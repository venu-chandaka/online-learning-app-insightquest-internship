// models/Lesson.js
import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  contentType: { type: String, enum: ["video", "text"], required: true },
  contentUrl: { type: String, required: true },
  duration: { type: Number, default: 0 }, // optional
  order: { type: Number, default: 0 }, // optional for sorting
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
}, { timestamps: true });

const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);
export default Lesson;
