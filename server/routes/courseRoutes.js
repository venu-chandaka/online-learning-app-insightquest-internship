import express from "express";
import stAuth from "../middleware/stAuth.js"
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


courseRouter.get("/all", getAllCourses);
courseRouter.get("/:id", (req, res, next) => {
  stAuth(req, res, (err) => {
    if (!err && req.stId) return next(); // student verified
    mentorAuth(req, res, next);
  });
}, getCourseDetails);

export default courseRouter;
