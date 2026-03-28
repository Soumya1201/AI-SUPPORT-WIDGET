/**
 * controllers/chat.controller.js — AI Chat Message Handler
 *
 * Receives messages from the embedded widget, calls Gemini AI,
 * stores the conversation in MongoDB, and returns the AI response.
 */

const Bot = require("../models/Bot");
const Conversation = require("../models/Conversation");
const { generateAIResponse } = require("../utils/ai");

/**
 * @desc    Send a message and get AI response
 * @route   POST /api/chat/:botId
 * @access  Public (called by embedded widget on any website)
 */
const sendMessage = async (req, res, next) => {
  try {
    const { botId } = req.params;
    const { message, sessionId } = req.body;

    // 1. Validate bot exists and is active
    const bot = await Bot.findOne({ _id: botId, isActive: true });
    if (!bot) {
      return res.status(404).json({
        success: false,
        message: "Chatbot not found or is currently inactive.",
      });
    }

    // 2. Find or create a conversation for this session
    let conversation = await Conversation.findOne({ bot: botId, sessionId });

    if (!conversation) {
      // New visitor session — create a fresh conversation
      conversation = await Conversation.create({
        bot: botId,
        sessionId,
        visitorInfo: {
          userAgent: req.headers["user-agent"] || "",
          referrer: req.headers["referer"] || "",
          language: req.headers["accept-language"]?.split(",")[0] || "",
        },
        messages: [],
      });

      // Increment bot's conversation counter
      await Bot.findByIdAndUpdate(botId, {
        $inc: { "analytics.totalConversations": 1 },
      });
    }

    // 3. Add user message to conversation history
    conversation.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // 4. Prepare message history for AI (last 10 messages for context window)
    const recentMessages = conversation.messages
      .slice(-10)                     // Last 10 messages
      .slice(0, -1)                   // Exclude the one we just added
      .map((m) => ({ role: m.role, content: m.content }));

    // 5. Call Gemini AI
    const aiResponse = await generateAIResponse(bot, recentMessages, message);

    // 6. Add AI response to conversation
    conversation.messages.push({
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    });

    // Update message counter
    conversation.messageCount = conversation.messages.length;
    await conversation.save();

    // 7. Update bot analytics
    await Bot.findByIdAndUpdate(botId, {
      $inc: { "analytics.totalMessages": 2 }, // user + AI message
    });

    // 8. Return the AI response
    res.status(200).json({
      success: true,
      response: aiResponse,
      conversationId: conversation._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get conversation history by session ID (for widget to restore chat)
 * @route   GET /api/chat/:botId/history/:sessionId
 * @access  Public
 */
const getConversationHistory = async (req, res, next) => {
  try {
    const { botId, sessionId } = req.params;

    const conversation = await Conversation.findOne({ bot: botId, sessionId });

    if (!conversation) {
      return res.status(200).json({
        success: true,
        messages: [], // No history yet — return empty array (not an error)
      });
    }

    res.status(200).json({
      success: true,
      messages: conversation.messages,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getConversationHistory };
