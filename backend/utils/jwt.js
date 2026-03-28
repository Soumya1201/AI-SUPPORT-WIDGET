/**
 * utils/jwt.js — JWT token generation and verification helpers
 */

const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT for a user
 * @param {string} userId - MongoDB user ID
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

/**
 * Verify a JWT token
 * @param {string} token
 * @returns {object} Decoded payload or throws error
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
