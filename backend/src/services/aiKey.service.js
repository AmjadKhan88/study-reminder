const User = require("../models/User.model");
const { decrypt } = require("../utils/crypto");

async function getUserGeminiKey(userId) {
  const user = await User.findById(userId).select("+geminiApiKeyEncrypted");
  if (!user?.geminiApiKeyEncrypted) {
    const err = new Error(
      "Add your Gemini API key in Settings to use AI features.",
    );
    err.statusCode = 400;
    err.apiCode = "GEMINI_KEY_REQUIRED";
    throw err;
  }
  return decrypt(user.geminiApiKeyEncrypted);
}

module.exports = { getUserGeminiKey };
