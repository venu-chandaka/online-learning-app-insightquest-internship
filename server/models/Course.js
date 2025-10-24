// models/Course.js
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "mentor" },
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  thumbnail: { type: String, default: "" },
  isPublished: { type: Boolean, default: false },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "user-student" }]
}, { timestamps: true });

const CourseModel = mongoose.models.Course || mongoose.model("Course", courseSchema);
export default CourseModel;
