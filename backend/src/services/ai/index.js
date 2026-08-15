const gemini = require('./gemini.service');
const openai = require('./openai.service');
const groq = require('./groq.service');

const providers = { gemini, openai, groq };

function getAIProvider(providerName) {
  const provider = providers[providerName];
  if (!provider) throw new Error(`Unknown AI provider: ${providerName}`);
  return provider;
}

module.exports = { getAIProvider };