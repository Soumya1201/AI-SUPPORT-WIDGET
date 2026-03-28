/**
 * controllers/analytics.controller.js — Basic Analytics
 *
 * Returns aggregated stats for the dashboard.
 */

const Bot = require("../models/Bot");
const Conversation = require("../models/Conversation");

/**
 * @desc    Get analytics for a specific bot
 * @route   GET /api/analytics/:botId
 * @access  Private
 */
const getBotAnalytics = async (req, res, next) => {
  try {
    const { botId } = req.params;

    // Verify ownership
    const bot = await Bot.findOne({ _id: botId, owner: req.user._id });
    if (!bot) {
      return res.status(404).json({ success: false, message: "Bot not found." });
    }

    // Get conversation stats for last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recentConversations = await Conversation.aggregate([
      { $match: { bot: bot._id, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
          messages: { $sum: "$messageCount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalConversations: bot.analytics.totalConversations,
        totalMessages: bot.analytics.totalMessages,
        last7Days: recentConversations,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get overall analytics for all user's bots
 * @route   GET /api/analytics/overview
 * @access  Private
 */
const getOverviewAnalytics = async (req, res, next) => {
  try {
    const bots = await Bot.find({ owner: req.user._id });

    const overview = bots.map((bot) => ({
      botId: bot._id,
      botName: bot.name,
      totalConversations: bot.analytics.totalConversations,
      totalMessages: bot.analytics.totalMessages,
      isActive: bot.isActive,
    }));

    const totals = bots.reduce(
      (acc, bot) => ({
        totalConversations: acc.totalConversations + bot.analytics.totalConversations,
        totalMessages: acc.totalMessages + bot.analytics.totalMessages,
      }),
      { totalConversations: 0, totalMessages: 0 }
    );

    res.status(200).json({
      success: true,
      overview,
      totals,
      botsCount: bots.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBotAnalytics, getOverviewAnalytics };
