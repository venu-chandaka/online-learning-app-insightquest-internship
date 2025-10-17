// models/Lesson.js
import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    contentType: { type: String, enum: ["video", "text"], default: "video" },
    contentUrl: { type: String, required: true }, // video link or text content
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const LessonModel =
  mongoose.models["lesson"] || mongoose.model("lesson", lessonSchema);
export default LessonModel;
