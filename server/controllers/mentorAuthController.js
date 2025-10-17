import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import MentorModel from "../models/mntrModel.js";
import transporter from "../config/nodeMailer.js";

const createToken = (mentorId) =>
  jwt.sign({ mentorId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// REGISTER
export const mentorRegister = async (req, res) => {
  const { name, email, password, expertise } = req.body;
  if (!name || !email || !password || !expertise)
    return res.json({ success: false, message: "All fields required" });

  try {
    const existingMentor = await MentorModel.findOne({ email });
    if (existingMentor)
      return res.json({ success: false, message: "Mentor already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const mentor = new MentorModel({
      name,
      email,
      password: hashedPassword,
      expertise,
    });
    await mentor.save();

    const token = createToken(mentor._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to InsightQuestMentor 🎓",
      text: `Hi ${name},\n\nWelcome aboard as a mentor! We’re glad to have your expertise at InsightQuestLearner.\n\nBest,\nCh.Venu & Team`,
    });

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// LOGIN
export const mentorLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({ success: false, message: "All fields required" });

  try {
    const mentor = await MentorModel.findOne({ email });
    if (!mentor) return res.json({ success: false, message: "Invalid email" });

    const isMatch = await bcrypt.compare(password, mentor.password);
    if (!isMatch)
      return res.json({ success: false, message: "Invalid password" });

    const token = createToken(mentor._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// LOGOUT
export const mentorLogout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// SEND VERIFY OTP
export const mentorSendVerifyOtp = async (req, res) => {
  try {
    const mentorId = req.mentorId || req.body?.mentorId;
    const mentor = await MentorModel.findById(mentorId);
    if (!mentor) return res.json({ success: false, message: "Mentor not found" });
    if (mentor.isAccountVerified)
      return res.json({ success: false, message: "Already verified" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    mentor.verifyOtp = otp;
    mentor.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await mentor.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: mentor.email,
      subject: "Mentor Verification OTP",
      text: `Hi ${mentor.name},\n\nYour OTP is ${otp}. Valid for 24 hours.\n\nBest,\nCh.Venu & Team`,
    });

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// VERIFY ACCOUNT
export const mentorVerifyAccount = async (req, res) => {
  const mentorId = req.mentorId || req.body?.mentorId;
  const { otp } = req.body;
  if (!mentorId || !otp)
    return res.json({ success: false, message: "All fields required" });

  try {
    const mentor = await MentorModel.findById(mentorId);
    if (!mentor) return res.json({ success: false, message: "Mentor not found" });
    if (mentor.verifyOtp !== otp)
      return res.json({ success: false, message: "Invalid OTP" });
    if (mentor.verifyOtpExpireAt < Date.now())
      return res.json({ success: false, message: "OTP expired" });

    mentor.isAccountVerified = true;
    mentor.verifyOtp = "";
    mentor.verifyOtpExpireAt = 0;
    await mentor.save();

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// PASSWORD RESET FLOW (similar to student)
export const mentorSendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: "Email required" });

  try {
    const mentor = await MentorModel.findOne({ email });
    if (!mentor) return res.json({ success: false, message: "Mentor not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    mentor.resetOtp = otp;
    mentor.resetOtpExpireAt = Date.now() + 5 * 60 * 1000;
    await mentor.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: mentor.email,
      subject: "Password Reset OTP",
      text: `Hi ${mentor.name},\n\nYour password reset OTP is ${otp}. Valid for 5 minutes.\n\nBest,\nCh.Venu & Team`,
    });

    res.json({ success: true, message: "Reset OTP sent to your email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const mentorResetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    return res.json({ success: false, message: "All fields required" });

  try {
    const mentor = await MentorModel.findOne({ email });
    if (!mentor) return res.json({ success: false, message: "Mentor not found" });
    if (mentor.resetOtp !== otp)
      return res.json({ success: false, message: "Invalid OTP" });
    if (mentor.resetOtpExpireAt < Date.now())
      return res.json({ success: false, message: "OTP expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    mentor.password = hashedPassword;
    mentor.resetOtp = "";
    mentor.resetOtpExpireAt = 0;
    await mentor.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
