/**
 * routes/auth.routes.js — Authentication Routes
 *
 * POST /api/auth/register  — Create new account
 * POST /api/auth/login     — Login and get JWT
 * GET  /api/auth/me        — Get current user (protected)
 */

const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { registerRules, loginRules } = require("../middleware/validate.middleware");

router.post("/register", registerRules, register);
router.post("/login", loginRules, login);
router.get("/me", protect, getMe);

module.exports = router;
