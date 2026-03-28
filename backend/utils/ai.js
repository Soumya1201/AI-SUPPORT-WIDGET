/**
 * utils/ai.js — Google Gemini AI integration
 *
 * Wraps the Gemini API to generate customer support responses.
 * Injects the bot's knowledge base into the system prompt.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Gemini client once (singleton pattern)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Build the system prompt for the AI model.
 * This shapes the AI's personality and knowledge.
 *
 * @param {object} bot - Bot document from MongoDB
 * @returns {string} Formatted system prompt
 */
const buildSystemPrompt = (bot) => {
  return `You are a helpful customer support AI assistant for "${bot.name}".

Your role is to:
- Answer questions politely, concisely, and helpfully
- Use the knowledge base below to answer questions accurately
- If you don't know the answer, say so honestly and suggest contacting human support
- Keep responses focused and under 200 words unless detail is needed
- Use markdown for formatting when helpful (bullet points, bold text, etc.)
- Never make up information that isn't in your knowledge base

KNOWLEDGE BASE:
${bot.knowledgeBase || "No specific knowledge base provided. Use general helpfulness."}

Always maintain a friendly, professional tone. You represent ${bot.name}.`;
};

/**
 * Generate an AI response for a chat message
 *
 * @param {object} bot - Bot document (for name + knowledge base)
 * @param {Array} messageHistory - Array of { role, content } objects
 * @param {string} userMessage - The latest user message
 * @returns {Promise<string>} AI-generated response text
 */
const generateAIResponse = async (bot, messageHistory, userMessage) => {
  try {
    // Use Gemini 1.5 Flash for fast, cost-effective responses
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: buildSystemPrompt(bot),
    });

    // Convert our message history to Gemini's format
    // Gemini uses "user" and "model" roles (not "assistant")
    const history = messageHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Start a chat session with history context
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 500,  // Keep responses concise
        temperature: 0.7,       // Balanced creativity vs accuracy
        topP: 0.8,
        topK: 40,
      },
    });

    // Send the user's latest message
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;

    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error.message);

    // Provide a graceful fallback message instead of crashing
    if (error.message.includes("API_KEY")) {
      throw new Error("AI service configuration error. Please contact support.");
    }
    throw new Error("AI service temporarily unavailable. Please try again.");
  }
};

module.exports = { generateAIResponse };
