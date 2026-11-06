const { createGeminiProvider } = require("./gemini.service");

function getAIProvider(_providerName, apiKey) {
  return createGeminiProvider(apiKey);
}

module.exports = { getAIProvider };
