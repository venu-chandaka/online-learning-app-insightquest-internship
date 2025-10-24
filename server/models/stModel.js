// models/Student.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },

    verifyOtp: { type: String, default: "" },
    verifyOtpExpireAt: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },
    resetOtp: { type: String, default: "" },
    resetOtpExpireAt: { type: Number, default: 0 },

    enrolledCourses: [
      {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        enrolledAt: { type: Date, default: Date.now },
        progress: { type: Number, default: 0 },
      },
    ],

    // completedLessons: [
    //   {
    //     lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
    //     completedAt: { type: Date, default: Date.now },
    //   },
    // ],

    quizScores: [
      {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        score: { type: Number, default: 0 },
        attemptedAt: { type: Date, default: Date.now },
      },
    ],
    completedLessons: [
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
    completedAt: { type: Date, default: Date.now }
  }
],


    profilePicture: { type: String, default: "" },
  },
  { timestamps: true }
);

const StudentModel =
  mongoose.models["user-student"] ||
  mongoose.model("user-student", studentSchema);
export default StudentModel;
