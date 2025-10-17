import express from "express";
import mentorAuth from "../middleware/mentorAuth.js";
import {
  createCourse,
  updateCourse,
  getAllCourses,
  getCourseDetails,
  toggleCoursePublish,
  getMentorCourses,
} from "../controllers/courseController.js";

const courseRouter = express.Router();

// Mentor routes
courseRouter.post("/create", mentorAuth, createCourse);
courseRouter.put("/update", mentorAuth, updateCourse);
courseRouter.put("/toggle-publish", mentorAuth, toggleCoursePublish);
courseRouter.get("/mycources", mentorAuth, getMentorCourses);


// Public routes
courseRouter.get("/all", getAllCourses);
courseRouter.get("/:courseId", getCourseDetails);

export default courseRouter;
