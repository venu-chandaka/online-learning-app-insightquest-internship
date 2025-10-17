import express from "express";
import stAuth from "../middleware/stAuth.js";
import {
  getStudentData,
  enrollInCourse,
  completeLesson,
  getEnrolledCourses,
} from "../controllers/stcontroller.js";
const stRouter = express.Router();
stRouter.get("/get-data", stAuth, getStudentData);
stRouter.post("/enroll", stAuth, enrollInCourse);
stRouter.post("/complete-lesson", stAuth, completeLesson);
stRouter.get("/enrolled-courses", stAuth, getEnrolledCourses);
export default stRouter;