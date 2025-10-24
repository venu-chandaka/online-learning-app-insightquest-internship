import jwt from "jsonwebtoken";
import StudentModel from "../models/stModel.js";

const stAuth = async (req, res, next) => {
  const tokenFromCookie = req.cookies?.token;
  const authHeader = req.headers?.authorization;
  const tokenFromHeader = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  const token =
    tokenFromCookie ||
    tokenFromHeader ||
    req.body?.token ||
    req.query?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized. Login again." });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    const studentId = tokenDecode?.studentId || tokenDecode?.id || tokenDecode?.userId;

    if (!studentId) {
      return res.status(401).json({ success: false, message: "Invalid token structure." });
    }

    // ✅ Fetch the student from DB
    const student = await StudentModel.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    // ✅ Attach both ID and full object for use in controllers
    req.stId = student._id;
    req.student = student;
    req.body = { ...req.body, stId: student._id };

    next();
  } catch (error) {
    console.error("stAuth jwt error:", error.message);
    return res.status(401).json({ success: false, message: "Token invalid or expired. Login again." });
  }
};

export default stAuth;
