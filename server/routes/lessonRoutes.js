import express from "express";
import mentorAuth from "../middleware/mentorAuth.js";
import { addLesson, getLessonsByCourse } from "../controllers/lessonController.js";

const lessonRouter = express.Router();

lessonRouter.post("/add", mentorAuth, addLesson);
lessonRouter.get("/:courseId", getLessonsByCourse);

export default lessonRouter;
