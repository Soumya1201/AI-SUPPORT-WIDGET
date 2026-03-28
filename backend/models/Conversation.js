/**
 * models/Conversation.js — Stores chat sessions and message history
 *
 * Each conversation belongs to a bot.
 * Messages are stored as an array inside the conversation document.
 * sessionId is a random ID stored in the visitor's localStorage to track sessions.
 */

const mongoose = require("mongoose");

// Individual message schema (embedded in Conversation)
const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: [5000, "Message content too long"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // Don't create _id for each message (saves space)
);

const conversationSchema = new mongoose.Schema(
  {
    // Which bot this conversation belongs to
    bot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bot",
      required: true,
      index: true,
    },

    // Anonymous session ID from the visitor's browser (localStorage)
    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    // Optional: visitor info collected from the widget
    visitorInfo: {
      userAgent: String,
      referrer: String,
      language: String,
    },

    // All messages in this conversation
    messages: [messageSchema],

    // Quick counter (denormalized for analytics without counting array)
    messageCount: {
      type: Number,
      default: 0,
    },

    // Status of the conversation
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: look up conversations by bot + session quickly
conversationSchema.index({ bot: 1, sessionId: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);
