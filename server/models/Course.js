// models/Course.js
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    thumbnail: { type: String, default: "" },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mentor",
      required: true,
    },

    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "user-student" }],
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],

    duration: { type: Number, default: 0 },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    price: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CourseModel =
  mongoose.models["Course"] || mongoose.model("Course", courseSchema);

export default CourseModel;
