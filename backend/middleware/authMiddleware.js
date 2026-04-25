const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect middleware
 * ──────────────────
 * Verifies the JWT token stored in HTTP-only cookies.
 * If valid, fetches the user from DB (excluding password) and attaches to `req.user`.
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Retrieve token from cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user and attach to request. Use .lean() for better performance.
    const user = await User.findById(decoded.id)
      .select("-passwordHash")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Session valid but user no longer exists",
      });
    }

    // Attach user to request for use in controllers
    req.user = user;

    next();
  } catch (error) {
    console.error("[AuthMiddleware Error]", error.message);
    res.status(401).json({
      success: false,
      message: "Session expired or invalid token",
    });
  }
};
