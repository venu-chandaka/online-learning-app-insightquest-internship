import CourseModel from "../models/Course.js";
import LessonModel from "../models/Lesson.js";

// ➕ Create a new course (mentor only)
export const createCourse = async (req, res) => {
  try {
    const mentor = req.mentor;

    if (!mentor.isAccountVerified) {
      return res.status(403).json({ success: false, message: "Account not verified. You cannot create a course." });
    }

    const { title, description } = req.body;

    const newCourse = await Course.create({
      title,
      description,
      instructor: mentor._id,
      price: 0, // All free
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
    const course = await CourseModel.findByIdAndUpdate(courseId, updates, { new: true });
    if (!course) return res.json({ success: false, message: "Course not found" });
    res.json({ success: true, message: "Course updated successfully", course });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API route example:
// GET /api/course/my for mentor's own courses
export const getMentorCourses = async (req, res) => {
  try{
    const mentorId = req.mentorId || req.body?.mentorId;
   const courses = await CourseModel.find({ instructor: mentorId });
   if (!courses) return res.json({ success: false, message: "No courses uploaded" });
   res.json({ success: true, courses });
  }catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// 📚 Get all published courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await CourseModel.find({ isPublished: true }).populate("instructor", "name email");
    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 🧠 Get course details with lessons
export const getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await CourseModel.findById(courseId).populate("lessons");

    if (!course) return res.json({ success: false, message: "Course not found" });
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🚀 Publish or Unpublish a course
export const toggleCoursePublish = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await CourseModel.findById(courseId);
    if (!course) return res.json({ success: false, message: "Course not found" });
    course.isPublished = !course.isPublished;
    await course.save();
    res.json({ success: true, message: `Course ${course.isPublished ? "published" : "unpublished"}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
