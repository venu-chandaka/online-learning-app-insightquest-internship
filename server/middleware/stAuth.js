//find the token from the cookie and from  that token it  will find stid
import jwt from "jsonwebtoken";

const stAuth = async (req, res, next) => {
    // Accept token from several places: cookie, Authorization header (Bearer), body, or query string
    const tokenFromCookie = req.cookies && req.cookies.token;
    const authHeader = req.headers && req.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const token = tokenFromCookie || tokenFromHeader || (req.body && req.body.token) || (req.query && req.query.token);

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized. Login again." });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        // Token is signed in controllers as { studentId: ... }
        const studentId = tokenDecode?.studentId || tokenDecode?.id || tokenDecode?.userId;
        if (!studentId) {
            return res.status(401).json({ success: false, message: "Not authorized. Login again." });
        }

        // Attach to body for backward compatibility and to req for convenience
        req.body = req.body || {};
        req.body.stId = studentId;
        req.stId = studentId;

        next();
    } catch (error) {
        // Hide internal jwt errors from clients but log them for debug
        console.error('stAuth jwt error:', error.message);
        return res.status(401).json({ success: false, message: "Not authorized. Login again." });
    }
};

export default stAuth;