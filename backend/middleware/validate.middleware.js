/**
 * middleware/validate.middleware.js — Input Validation Rules
 *
 * Uses express-validator to define and run validation rules.
 * Always call `validate` at the end of a rule array to check for errors.
 */

const { body, validationResult } = require("express-validator");

/**
 * validate — Checks for validation errors and returns 400 if any exist
 * Must be the last item in a validation middleware array.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Auth Validation Rules ─────────────────────────────────────────────────────

const registerRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ max: 50 }).withMessage("Name cannot exceed 50 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

  validate,
];

const loginRules = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),

  validate,
];

// ─── Bot Validation Rules ──────────────────────────────────────────────────────

const createBotRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Bot name is required")
    .isLength({ max: 100 }).withMessage("Bot name cannot exceed 100 characters"),

  body("welcomeMessage")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Welcome message cannot exceed 500 characters"),

  body("knowledgeBase")
    .optional()
    .isLength({ max: 10000 }).withMessage("Knowledge base cannot exceed 10,000 characters"),

  validate,
];

// ─── Chat Validation Rules ─────────────────────────────────────────────────────

const chatMessageRules = [
  body("message")
    .trim()
    .notEmpty().withMessage("Message cannot be empty")
    .isLength({ max: 1000 }).withMessage("Message cannot exceed 1,000 characters"),

  body("sessionId")
    .trim()
    .notEmpty().withMessage("Session ID is required"),

  validate,
];

module.exports = {
  registerRules,
  loginRules,
  createBotRules,
  chatMessageRules,
};
