/**
 * controllers/auth.controller.js — Authentication Logic
 *
 * Handles user registration, login, and fetching the current user profile.
 * All database interactions go here (not in routes).
 */

const User = require("../models/User");
const { generateToken } = require("../utils/jwt");

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Create user (password is hashed in the pre-save hook in User model)
    const user = await User.create({ name, email, password });

    // Generate JWT
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

/**
 * @desc    Login existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password (it's hidden by default)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      // Don't reveal whether the email exists (security best practice)
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT
    const token = generateToken(user._id);

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private (requires JWT)
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    res.status(200).json({
      success: true,
      user: req.user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
