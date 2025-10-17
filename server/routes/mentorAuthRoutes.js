import express from "express";
import mentorAuth from "../middleware/mentorAuth.js";
import {
  mentorRegister,
  mentorLogin,
  mentorLogout,
  mentorSendVerifyOtp,
  mentorVerifyAccount,
  mentorSendResetOtp,
  mentorResetPassword,
} from "../controllers/mentorAuthController.js";

const mentorAuthRouter = express.Router();

// 🔐 Auth Routes
mentorAuthRouter.post("/register", mentorRegister);
mentorAuthRouter.post("/login", mentorLogin);
mentorAuthRouter.post("/logout", mentorLogout);
mentorAuthRouter.post("/send-verify-otp", mentorAuth, mentorSendVerifyOtp);
mentorAuthRouter.post("/verify-account", mentorAuth, mentorVerifyAccount);
mentorAuthRouter.post("/send-reset-otp", mentorSendResetOtp);
mentorAuthRouter.post("/reset-password", mentorResetPassword);

export default mentorAuthRouter;
