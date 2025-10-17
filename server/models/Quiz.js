// models/Quiz.js
import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    questions: [
      {
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: String, required: true },
      },
    ],
    totalMarks: { type: Number, default: 0 },
    passingMarks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const QuizModel =
  mongoose.models["quiz"] || mongoose.model("quiz", quizSchema);
export default QuizModel;
