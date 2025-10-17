import LessonModel from "../models/Lesson.js";
import CourseModel from "../models/Course.js";

// ➕ Add a new lesson to a course
export const addLesson = async (req, res) => {
  try {
    const { courseId, title, contentType, contentUrl } = req.body;

    if (!courseId || !title || !contentType || !contentUrl)
      return res.json({ success: false, message: "All fields required" });

    const course = await CourseModel.findById(courseId);
    if (!course) return res.json({ success: false, message: "Course not found" });

    const lesson = new LessonModel({ title, contentType, contentUrl, courseId });
    await lesson.save();

    course.lessons.push(lesson._id);
    await course.save();

    res.json({ success: true, message: "Lesson added successfully", lesson });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 📖 Get all lessons for a course
export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await LessonModel.find({ courseId }).sort({ order: 1 });
    res.json({ success: true, lessons });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
