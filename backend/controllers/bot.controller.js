/**
 * controllers/bot.controller.js — Chatbot CRUD Operations
 *
 * Business owners create and manage their chatbots here.
 * Multi-tenant: users can only access their own bots.
 */

const Bot = require("../models/Bot");
const Conversation = require("../models/Conversation");

/**
 * @desc    Create a new chatbot
 * @route   POST /api/bots
 * @access  Private
 */
const createBot = async (req, res, next) => {
  try {
    const { name, welcomeMessage, knowledgeBase, settings } = req.body;

    const bot = await Bot.create({
      owner: req.user._id, // Multi-tenant: link to logged-in user
      name,
      welcomeMessage,
      knowledgeBase,
      settings,
    });

    res.status(201).json({
      success: true,
      message: "Chatbot created successfully!",
      bot,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bots owned by the logged-in user
 * @route   GET /api/bots
 * @access  Private
 */
const getMyBots = async (req, res, next) => {
  try {
    const bots = await Bot.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bots.length,
      bots,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single bot by ID (must be owner)
 * @route   GET /api/bots/:id
 * @access  Private
 */
const getBotById = async (req, res, next) => {
  try {
    const bot = await Bot.findOne({
      _id: req.params.id,
      owner: req.user._id, // Ensure ownership (multi-tenant security)
    });

    if (!bot) {
      return res.status(404).json({
        success: false,
        message: "Bot not found or you don't have permission to view it.",
      });
    }

    res.status(200).json({ success: true, bot });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a bot
 * @route   PUT /api/bots/:id
 * @access  Private
 */
const updateBot = async (req, res, next) => {
  try {
    const { name, welcomeMessage, knowledgeBase, settings, isActive } = req.body;

    const bot = await Bot.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id }, // Must be owner
      { name, welcomeMessage, knowledgeBase, settings, isActive },
      { new: true, runValidators: true } // Return updated doc, run schema validators
    );

    if (!bot) {
      return res.status(404).json({
        success: false,
        message: "Bot not found or you don't have permission to update it.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Bot updated successfully!",
      bot,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a bot (and all its conversations)
 * @route   DELETE /api/bots/:id
 * @access  Private
 */
const deleteBot = async (req, res, next) => {
  try {
    const bot = await Bot.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!bot) {
      return res.status(404).json({
        success: false,
        message: "Bot not found or you don't have permission to delete it.",
      });
    }

    // Also delete all conversations for this bot (cleanup)
    await Conversation.deleteMany({ bot: req.params.id });

    res.status(200).json({
      success: true,
      message: "Bot and all its conversations deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get conversation history for a bot
 * @route   GET /api/bots/:id/conversations
 * @access  Private
 */
const getBotConversations = async (req, res, next) => {
  try {
    // First verify the bot belongs to this user
    const bot = await Bot.findOne({ _id: req.params.id, owner: req.user._id });
    if (!bot) {
      return res.status(404).json({ success: false, message: "Bot not found." });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({ bot: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("sessionId messageCount status createdAt updatedAt messages");

    const total = await Conversation.countDocuments({ bot: req.params.id });

    res.status(200).json({
      success: true,
      conversations,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get public bot info (used by the widget to validate bot ID)
 * @route   GET /api/bots/public/:id
 * @access  Public (widget uses this)
 */
const getPublicBotInfo = async (req, res, next) => {
  try {
    // Only return safe public fields (NO knowledge base or owner info)
    const bot = await Bot.findOne({
      _id: req.params.id,
      isActive: true,
    }).select("name welcomeMessage settings");

    if (!bot) {
      return res.status(404).json({
        success: false,
        message: "Bot not found or is inactive.",
      });
    }

    res.status(200).json({ success: true, bot });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBot,
  getMyBots,
  getBotById,
  updateBot,
  deleteBot,
  getBotConversations,
  getPublicBotInfo,
};
