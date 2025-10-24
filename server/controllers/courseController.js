// server/controllers/courseController.js
import CourseModel from "../models/Course.js";
import LessonModel from "../models/Lesson.js";
import MentorModel from "../models/mntrModel.js";
import StudentModel from "../models/stModel.js";

// ➕ Create a new course (mentor only)
export const createCourse = async (req, res) => {
  try {
    const mentor = req.mentor;

    if (!mentor.isAccountVerified) {
      return res.status(403).json({
        success: false,
        message: "Account not verified. You cannot create a course.",
      });
    }

    const { title, description } = req.body;

    const newCourse = await CourseModel.create({
      title,
      description,
      instructor: mentor._id, // ✅ correct field name
      price: 0,
    });

    // Add this course to mentor's profile
    await MentorModel.findByIdAndUpdate(mentor._id, {
      $push: { courses: newCourse._id },
    });
    res.json({ success: true, course: newCourse });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✏️ Update course details
export const updateCourse = async (req, res) => {
  try {
    const { courseId, ...updates } = req.body;
    const course = await CourseModel.findByIdAndUpdate(courseId, updates, {
      new: true,
    });

    if (!course)
      return res.json({ success: false, message: "Course not found" });

    res.json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 📚 Get all published courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await CourseModel.find({ isPublished: true }).populate({
      path: "instructor",
      select: "name email",
      model: "mentor",
    });

    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 📘 Get all mentor’s uploaded courses
export const getMentorCourses = async (req, res) => {
  try {
    const mentorId = req.mentorId || req.mentor?._id || req.body?.mentorId;
    const courses = await CourseModel.find({ instructor: mentorId });
    if (!courses || courses.length === 0)
      return res.json({ success: false, message: "No courses uploaded yet" });

    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 🧠 Get course details with lessons + mentor + enrolled students

export const getCourseDetails = async (req, res) => {
  try {
    const courseId = req.params.id;
    const mentor = req.mentor; // from mentorAuth
    const student = req.student; // from studentAuth (if used)

    const course = await CourseModel.findById(courseId)
      .populate("lessons", "title contentType contentUrl")
      .populate("instructor", "name email bio isAccountVerified")
      .populate("enrolledStudents", "name email isAccountVerified");

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // ✅ If mentor is viewing their own course — allow access
    if (
  mentor &&
  course.instructor &&
  course.instructor._id?.toString() === mentor._id?.toString()
) {
  return res.status(200).json({ success: true, course });
}

    // ✅ If student is enrolled — allow access
    if (student) {
      const isEnrolled = course.enrolledStudents.some(
        (s) => s._id.toString() === student._id.toString()
      );
      if (isEnrolled) {
        return res.status(200).json({ success: true, course });
      }
    }

    // ❌ Otherwise block
    return res
      .status(403)
      .json({ success: false, message: "Access denied. Not enrolled or creator." });
  } catch (error) {
    console.error("getCourseDetails error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Internal Server Error" });
  }
};




// 🚀 Publish or Unpublish a course
export const toggleCoursePublish = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await CourseModel.findById(courseId);

    if (!course)
      return res.json({ success: false, message: "Course not found" });

    course.isPublished = !course.isPublished;
    await course.save();

    res.json({
      success: true,
      message: `Course ${
        course.isPublished ? "published" : "unpublished"
      } successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🧑‍🎓 Get all courses enrolled by a student
export const getEnrolledCourses = async (req, res) => {
  try {
    const studentId = req.studentId || req.body.studentId;
    const student = await StudentModel.findById(studentId).populate({
      path: "enrolledCourses.courseId",
      select: "title description mentor",
      populate: { path: "mentor", select: "name email", model: "mentor" },
    });

    if (!student)
      return res.json({ success: false, message: "Student not found" });

    res.json({ success: true, enrolledCourses: student.enrolledCourses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
