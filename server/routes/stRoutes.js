import express from "express";
import stAuth from "../middleware/stAuth.js";
import {
  getStudentData,
  enrollInCourse,
  // completeLesson,
  getEnrolledCourses,
} from "../controllers/stcontroller.js";
import StudentModel from "../models/stModel.js";
const stRouter = express.Router();
stRouter.get("/get-data", stAuth, getStudentData);
stRouter.post("/enroll", stAuth, enrollInCourse);
// stRouter.post("/complete-lesson", stAuth, completeLesson);
stRouter.get("/enrolled-courses", stAuth, getEnrolledCourses);
stRouter.post("/complete-lesson", stAuth, async (req, res) => {
  const { courseId, lessonId } = req.body;
  const student = await StudentModel.findById(req.stId);

  const alreadyDone = student.completedLessons.some(
    (l) => l.lessonId.toString() === lessonId
  );
  if (!alreadyDone) {
    student.completedLessons.push({ courseId, lessonId });
    await student.save();
  }

  res.json({ success: true, message: "Lesson marked as completed" });
});
// stRouter.get("/get-completed-lessons/:courseId", stAuth, async (req, res) => {
//   const { courseId } = req.params;
//   const student = await StudentModel.findById(req.user.id);
//   const completed = student.completedLessons[courseId] || [];
//   res.json({ completedLessonIds: completed });
// });
// stRouter.get("/get-completed-lessons/:courseId", stAuth, async (req, res) => {
//   try {
//     const { courseId } = req.params;

//     const student = await StudentModel.findById(req.user.id);
//     if (!student) {
//       return res.status(404).json({ success: false, message: "Student not found" });
//     }

//     // Filter completed lessons by courseId
//     const lessonsForCourse = student.completedLessons.filter(
//       (item) => String(item.courseId) === String(courseId)
//     );

//     // Extract only lesson IDs
//     const completedLessonIds = lessonsForCourse.map((item) => item.lessonId);

//     res.json({ success: true, completedLessonIds });
//   } catch (err) {
//     console.error("Error in get-completed-lessons:", err);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// });
// routes/studentRoutes.js
stRouter.get("/get-completed-lessons/:courseId", stAuth, async (req, res) => {
  try {
    const { courseId } = req.body;

    // Ensure authentication worked and student ID exists
    const student = await StudentModel.findById(req.stId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Filter completed lessons for this course
    const filteredLessons = student.completedLessons.filter(
      (entry) => String(entry.courseId) === String(courseId)
    );

    // Collect all lesson IDs
    const completedLessonIds = filteredLessons.map((entry) => entry.lessonId);

    return res.json({
      success: true,
      completedLessonIds,
    });
  } catch (err) {
    console.error("Error fetching completed lessons:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});


export default stRouter;