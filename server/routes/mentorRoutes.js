import express from "express";
import mentorAuth from "../middleware/mentorAuth.js";
import {
  getMentorData,
  updateMentorProfile,
  getMentorStudents,
} from "../controllers/mentorController.js";

const mentorRouter = express.Router();
// 👨‍🏫 Mentor Dashboard Routes
mentorRouter.get("/get-data", mentorAuth, getMentorData);
mentorRouter.put("/update-profile", mentorAuth, updateMentorProfile);
mentorRouter.get("/students", mentorAuth, getMentorStudents);

export default mentorRouter;
