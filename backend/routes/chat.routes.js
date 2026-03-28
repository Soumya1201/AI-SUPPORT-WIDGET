/**
 * routes/chat.routes.js — Chat Widget Routes
 * These are PUBLIC routes called by the embedded widget.
 */

const express = require("express");
const router = express.Router();
const { sendMessage, getConversationHistory } = require("../controllers/chat.controller");
const { chatMessageRules } = require("../middleware/validate.middleware");

// POST /api/chat/:botId          — Send a message, get AI response
router.post("/:botId", chatMessageRules, sendMessage);

// GET  /api/chat/:botId/history/:sessionId — Restore chat history
router.get("/:botId/history/:sessionId", getConversationHistory);

module.exports = router;
