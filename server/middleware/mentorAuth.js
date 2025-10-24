// middleware/mentorAuth.js
import jwt from "jsonwebtoken";
import MentorModel from "../models/mntrModel.js";

const mentorAuth = async (req, res, next) => {
  try {
    // 🔹 Get token from cookie, Authorization header, body, or query
    const token =
      req.cookies?.token ||
      (req.headers?.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null) ||
      req.body?.token ||
      req.query?.token;

    console.log("🟢 [mentorAuth] Incoming request");
    console.log("Token Extracted:", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing. Please login again.",
      });
    }

    // 🔹 Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded Token:", decoded);

    // 🔹 Token must contain mentorId (created from login)
    if (!decoded || !decoded.mentorId) {
      console.log("❌ Invalid token payload structure:", decoded);
      return res
        .status(401)
        .json({ success: false, message: "Invalid token structure." });
    }

    // 🔹 Fetch mentor from DB
    const mentor = await MentorModel.findById(decoded.mentorId);
    if (!mentor) {
      console.log("❌ Mentor not found for ID:", decoded.mentorId);
      return res
        .status(404)
        .json({ success: false, message: "Mentor not found." });
    }

    // Attach to request
    req.mentor = mentor;
    req.mentorId = mentor._id;

    console.log("✅ Mentor Authenticated:", mentor.email);
    next();
  } catch (error) {
    console.error("🚨 [mentorAuth] Error:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
};

export default mentorAuth;
