/**
 * middleware/auth.middleware.js — JWT Authentication Guard
 *
 * Protects routes that require a logged-in user.
 * Attaches the user document to req.user for use in controllers.
 */

const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");

/**
 * protect — Middleware to verify JWT and attach user to request
 * Usage: router.get("/protected", protect, controller)
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // JWT is passed in the Authorization header as "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Verify the token (throws if invalid or expired)
    const decoded = verifyToken(token);

    // Find the user and attach to request
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is valid but user no longer exists.",
      });
    }

    req.user = user; // Now controllers can use req.user
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
    }
    next(error);
  }
};

/**
 * restrictTo — Middleware to limit access by user role
 * Usage: router.delete("/admin-only", protect, restrictTo("admin"), controller)
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
