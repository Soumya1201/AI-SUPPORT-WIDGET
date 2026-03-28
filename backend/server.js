/**
 * server.js — Main entry point for the Express backend
 * Loads environment variables, connects to MongoDB, and starts the server.
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import route files
const authRoutes = require("./routes/auth.routes");
const botRoutes = require("./routes/bot.routes");
const chatRoutes = require("./routes/chat.routes");
const analyticsRoutes = require("./routes/analytics.routes");

// Import error handling middleware
const { errorHandler, notFound } = require("./middleware/error.middleware");

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────
// helmet sets secure HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // needed for widget.js
}));

// CORS: allow frontend and any site embedding the widget
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman, curl, or embedded widgets)
    if (!origin) return callback(null, true);
    // Allow the configured frontend URL
    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:5173",
    ];
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // For widget embedding — allow all origins to /api/chat
      callback(null, true);
    }
  },
  credentials: true,
}));

// ─── General Middleware ────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" })); // parse JSON, limit body size
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // HTTP request logger

// Serve widget.js as a static file (the embeddable script)
app.use("/widget", express.static("public/widget"));

// ─── Global Rate Limiter ───────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});
app.use("/api", globalLimiter);

// Stricter limiter for chat endpoint (to control AI API costs)
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,             // 20 messages per minute per IP
  message: { success: false, message: "Chat rate limit exceeded. Please slow down." },
});
app.use("/api/chat", chatLimiter);

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);         // /api/auth/register, /api/auth/login
app.use("/api/bots", botRoutes);          // /api/bots (CRUD for chatbots)
app.use("/api/chat", chatRoutes);         // /api/chat/:botId (widget messages)
app.use("/api/analytics", analyticsRoutes); // /api/analytics/:botId

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── 404 & Error Handlers ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Database Connection & Server Start ───────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); // Exit if DB fails — don't run without a database
  });

module.exports = app; // Export for testing
