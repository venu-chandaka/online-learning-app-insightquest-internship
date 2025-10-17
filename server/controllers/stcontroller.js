// controllers/stController.js
import stModel from "../models/stModel.js";
import CourseModel from "../models/Course.js";
import LessonModel from "../models/Lesson.js";
import EnrollmentModel from "../models/Enrollment.js";

export const getStudentData = async (req, res) => {
  try {
    const stId = req.stId || req.body?.stId;

    const student = await stModel.findById(stId)
      .populate({
        path: "enrolledCourses.courseId",
        select: "title description category thumbnail instructor",
        populate: { path: "instructor", select: "name email" },
      });

    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });

    res.json({
      success: true,
      stData: {
        name: student.name,
        email: student.email,
        profilePicture: student.profilePicture,
        isAccountVerified: student.isAccountVerified,
        enrolledCourses: student.enrolledCourses,
        progress: student.enrolledCourses.map((c) => ({
          courseId: c.courseId,
          progress: c.progress,
        })),
        createdAt: student.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🧩 Enroll in a course
export const enrollInCourse = async (req, res) => {
  try {
    const student = await stModel.findById(req.stId);
    if (!student.isAccountVerified) {
      return res.status(403).json({ success: false, message: "Verify your account before enrolling in any course." });
    }

    const { courseId } = req.body;
    const course = await CourseModel.findById(courseId);
    if (!course) return res.json({ success: false, message: "Course not found" });

    // Add to course's enrolledStudents array
    if (!course.enrolledStudents.includes(student._id)) {
      course.enrolledStudents.push(student._id);
      await course.save();
    }

    // Add to student's enrolledCourses array if not already present
    const alreadyEnrolled = student.enrolledCourses.some(ec => (typeof ec === "object" ? ec.courseId?.toString() : ec.toString()) === courseId);
    if (!alreadyEnrolled) {
      student.enrolledCourses.push({ courseId, progress: 0 });
      await student.save();
    }

    res.json({ success: true, message: "Enrolled successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// 🧩 Mark lesson as completed
export const completeLesson = async (req, res) => {
  try {
    const stId = req.stId || req.body?.stId;
    const { lessonId } = req.body;

    const lesson = await LessonModel.findById(lessonId);
    if (!lesson) return res.json({ success: false, message: "Lesson not found" });

    // Update student’s completed lessons
    await stModel.findByIdAndUpdate(stId, {
      $push: { completedLessons: { lessonId } },
    });

    // Calculate progress for that course
    const totalLessons = await LessonModel.countDocuments({ courseId: lesson.courseId });
    const completedLessons = await stModel.findOne({
      _id: stId,
      "completedLessons.lessonId": { $in: [lessonId] },
    });

    const progress = Math.min((completedLessons.length / totalLessons) * 100, 100);
    await stModel.updateOne(
      { _id: stId, "enrolledCourses.courseId": lesson.courseId },
      { $set: { "enrolledCourses.$.progress": progress } }
    );

    await EnrollmentModel.updateOne(
      { studentId: stId, courseId: lesson.courseId },
      { progress }
    );

    res.json({ success: true, message: "Lesson completed", progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🧩 Get student’s enrolled courses
export const getEnrolledCourses = async (req, res) => {
  try {
    const stId = req.stId || req.body?.stId;
    const student = await stModel.findById(stId).populate("enrolledCourses.courseId");

    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });

    res.json({
      success: true,
      enrolledCourses: student.enrolledCourses.map((c) => ({
        id: c.courseId._id,
        title: c.courseId.title,
        category: c.courseId.category,
        progress: c.progress,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
