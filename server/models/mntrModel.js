// models/Mentor.js
import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    profilePicture: { type: String, default: "" },
    bio: { type: String, trim: true },
    expertise: { type: [String], required: true },
    experience: { type: Number, default: 0 },
    
    verifyOtp: { type: String, default: "" },
    verifyOtpExpireAt: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },
    resetOtp: { type: String, default: "" },
    resetOtpExpireAt: { type: Number, default: 0 },

    courses: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
    ],

    students: [
      { type: mongoose.Schema.Types.ObjectId, ref: "user-student" }
    ],

    socialLinks: {
      linkedin: String,
      github: String,
      twitter: String,
      portfolio: String,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const MentorModel =
  mongoose.models["mentor"] || mongoose.model("mentor", mentorSchema);
export default MentorModel;
