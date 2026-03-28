/**
 * shared/constants.js — Shared constants across the project
 *
 * Import in both frontend and backend where applicable.
 */

// API response status codes
const STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
};

// User roles
const ROLES = {
  USER: "user",
  ADMIN: "admin",
};

// Message roles (for AI context)
const MESSAGE_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
};

// Conversation statuses
const CONVERSATION_STATUS = {
  ACTIVE: "active",
  CLOSED: "closed",
};

// Widget positions
const WIDGET_POSITIONS = {
  BOTTOM_RIGHT: "bottom-right",
  BOTTOM_LEFT: "bottom-left",
};

// Limits
const LIMITS = {
  KNOWLEDGE_BASE_MAX_CHARS: 10000,
  MESSAGE_MAX_CHARS: 1000,
  BOT_NAME_MAX_CHARS: 100,
  WELCOME_MSG_MAX_CHARS: 500,
  CONTEXT_WINDOW_MESSAGES: 10, // Last N messages sent to AI
  AI_MAX_OUTPUT_TOKENS: 500,
};

module.exports = {
  STATUS,
  ROLES,
  MESSAGE_ROLES,
  CONVERSATION_STATUS,
  WIDGET_POSITIONS,
  LIMITS,
};
