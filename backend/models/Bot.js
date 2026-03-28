/**
 * models/Bot.js — Mongoose schema for chatbots
 *
 * Each bot belongs to a user (multi-tenant).
 * The knowledge base is stored as plain text that gets injected into the AI system prompt.
 */

const mongoose = require("mongoose");

const botSchema = new mongoose.Schema(
  {
    // The business owner who created this bot
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: [true, "Bot name is required"],
      trim: true,
      maxlength: [100, "Bot name cannot exceed 100 characters"],
    },

    // Shown to users when the chat widget opens
    welcomeMessage: {
      type: String,
      default: "Hi there! 👋 How can I help you today?",
      maxlength: [500, "Welcome message cannot exceed 500 characters"],
    },

    // The "brain" of the bot — injected into AI system prompt
    knowledgeBase: {
      type: String,
      default: "",
      maxlength: [10000, "Knowledge base cannot exceed 10,000 characters"],
    },

    // Visual customization for the widget
    settings: {
      primaryColor: {
        type: String,
        default: "#6366f1", // Indigo
      },
      botAvatar: {
        type: String,
        default: "🤖",
      },
      position: {
        type: String,
        enum: ["bottom-right", "bottom-left"],
        default: "bottom-right",
      },
    },

    // Basic analytics counters
    analytics: {
      totalConversations: { type: Number, default: 0 },
      totalMessages: { type: Number, default: 0 },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups when validating widget bot IDs
botSchema.index({ owner: 1 });
botSchema.index({ isActive: 1 });

module.exports = mongoose.model("Bot", botSchema);
