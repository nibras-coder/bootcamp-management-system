const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // No token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find user
    // Password is hidden for security
    const user = await User.findById(decoded.id).select("-password");

    // User doesn't exist
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user no longer exists",
      });
    }

    // Check if account is deactivated
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated",
      });
    }

    // Attach user to request
    req.user = user;

    // Continue to controller
    next();

  } catch (error) {
    // DEBUG: Show the real JWT error
    console.error(
      "JWT VERIFY ERROR:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed or expired",
    });
  }
};

// ======================================================
// ADMIN ONLY
// ======================================================

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }
};

// ======================================================
// ROLE AUTHORIZATION
// ======================================================

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission.",
      });
    }

    next();
  };
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  verifyToken,
  protect: verifyToken,
  isAdmin,
  authorize,
};