import express from "express";
import QuizModel from "../models/Quiz.js";
import CourseModel from "../models/Course.js";
import StudentModel from "../models/stModel.js";
import mentorAuth from "../middleware/mentorAuth.js";
import stAuth from "../middleware/stAuth.js";


const quizRouter = express.Router();

/* -------------------- Mentor APIs -------------------- */

// 🔹 Create or update quiz for a course
quizRouter.post("/create", mentorAuth, async (req, res) => {
  try {
    const { courseId, questions, passingMarks } = req.body;

    if (!courseId || !questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: "Incomplete quiz data" });
    }

    // Calculate total marks automatically (1 mark per question)
    const totalMarks = questions.length;

    let quiz = await QuizModel.findOne({ courseId });
    if (quiz) {
      quiz.questions = questions;
      quiz.totalMarks = totalMarks;
      quiz.passingMarks = passingMarks;
      await quiz.save();
    } else {
      quiz = await QuizModel.create({ courseId, questions, totalMarks, passingMarks });
    }

    res.json({ success: true, quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create quiz" });
  }
});

// 🔹 Get quiz for a course (mentor or student)
quizRouter.get("/:courseId", async (req, res) => {
  try {
    const quiz = await QuizModel.findOne({ courseId: req.params.courseId });
    if (!quiz)
      return res.status(404).json({ success: false, message: "Quiz not found" });
    res.json({ success: true, quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* -------------------- Student APIs -------------------- */

// 🔹 Submit quiz attempt
// quizRouter.post("/submit", stAuth , async (req, res) => {
//   try {
//     const { courseId, answers } = req.body;
//     const quiz = await QuizModel.findOne({ courseId });
//     if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

//     let score = 0;
//     quiz.questions.forEach((q, i) => {
//       if (answers[i] && answers[i] === q.correctAnswer) score++;
//     });

//     const passed = score >= quiz.passingMarks;

//     // Optionally store quiz results in student progress
//     const student = await StudentModel.findById(req.user.id);
//     student.quizResults = student.quizResults || {};
//     student.quizResults[courseId] = { score, passed };
//     await student.save();

//     res.json({
//       success: true,
//       message: passed ? "✅ Passed!" : "❌ Failed.",
//       score,
//       total: quiz.totalMarks,
//       passed,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Quiz submission failed" });
//   }
// });
quizRouter.post("/submit", stAuth , async (req, res) => {
  try {
    const { courseId, answers } = req.body;
    const quiz = await QuizModel.findOne({ courseId });
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    // Compute total marks dynamically if not set
    const totalMarks = quiz.totalMarks || quiz.questions.length;

    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] && answers[i] === q.correctAnswer) score++;
    });

    const passed = score >= quiz.passingMarks;

    // Store quiz results in student progress
    const student = await StudentModel.findById(req.stId);
    student.quizResults = student.quizResults || {};
    student.quizResults[courseId] = { score, passed };
    await student.save();

    res.json({
      success: true,
      message: passed ? "✅ Passed!" : "❌ Failed.",
      score,
      total: totalMarks,
      passed,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Quiz submission failed" });
  }
});


export default quizRouter;
