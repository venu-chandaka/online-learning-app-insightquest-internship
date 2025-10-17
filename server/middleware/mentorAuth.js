// middleware/mentorAuth.js
import jwt from "jsonwebtoken";

const mentorAuth = async (req, res, next) => {
  // Get token from cookie, Authorization header, body, or query string
  const tokenFromCookie = req.cookies && req.cookies.token;
  const authHeader = req.headers && req.headers.authorization;
  const tokenFromHeader =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
  const token =
    tokenFromCookie ||
    tokenFromHeader ||
    (req.body && req.body.token) ||
    (req.query && req.query.token);

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized. Login again." });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    // Token is signed as { mentorId: ... } in login/register controller
    const mentorId =
      tokenDecode?.mentorId || tokenDecode?.id || tokenDecode?.userId;

    if (!mentorId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized. Login again." });
    }

    // Attach mentorId to request (body and direct property)
    req.body = req.body || {};
    req.body.mentorId = mentorId;
    req.mentorId = mentorId;

    next();
  } catch (error) {
    // Log JWT errors for server debugging
    console.error("mentorAuth jwt error:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Not authorized. Login again." });
  }
};

export default mentorAuth;
