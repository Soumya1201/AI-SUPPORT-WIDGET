/**
 * routes/bot.routes.js — Chatbot Management Routes
 */

const express = require("express");
const router = express.Router();
const {
  createBot,
  getMyBots,
  getBotById,
  updateBot,
  deleteBot,
  getBotConversations,
  getPublicBotInfo,
} = require("../controllers/bot.controller");
const { protect } = require("../middleware/auth.middleware");
const { createBotRules } = require("../middleware/validate.middleware");

// Public route — widget uses this to load bot info
router.get("/public/:id", getPublicBotInfo);

// Protected routes — require JWT
router.use(protect);

router.route("/")
  .get(getMyBots)
  .post(createBotRules, createBot);

router.route("/:id")
  .get(getBotById)
  .put(updateBot)
  .delete(deleteBot);

router.get("/:id/conversations", getBotConversations);

module.exports = router;
