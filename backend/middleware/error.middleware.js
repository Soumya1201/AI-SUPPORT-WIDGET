/**
 * middleware/error.middleware.js — Centralized Error Handling
 *
 * Two middleware functions:
 * 1. notFound: Catches requests to undefined routes (404)
 * 2. errorHandler: Handles all errors thrown in the app
 */

/**
 * notFound — Generates a 404 error for undefined routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * errorHandler — Global error handler
 * Must have 4 parameters for Express to recognize it as an error handler.
 */
const errorHandler = (err, req, res, next) => {
  // If res.statusCode is still 200 (no status set), default to 500
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // MongoDB: Cast error (e.g., invalid ObjectId format)
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = "Invalid ID format.";
  }

  // MongoDB: Duplicate key error (e.g., email already exists)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  console.error(`❌ [${statusCode}] ${message}`);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only show stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
