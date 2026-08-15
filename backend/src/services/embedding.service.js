const { GoogleGenerativeAI } = require('@google/generative-ai');
const { withTimeout } = require('../utils/withTimeout');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';
const EMBED_TIMEOUT_MS = 20000;

async function embedText(text) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await withTimeout(model.embedContent(text), EMBED_TIMEOUT_MS, 'Gemini embedding request');
  return result.embedding.values;
}

async function embedBatch(texts) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const BATCH_SIZE = 50;
  const allEmbeddings = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const slice = texts.slice(i, i + BATCH_SIZE);
    const requests = slice.map((text) => ({ content: { role: 'user', parts: [{ text }] } }));
    console.log(`Embedding batch ${Math.floor(i / BATCH_SIZE) + 1}: ${slice.length} chunks...`);
    const result = await withTimeout(
      model.batchEmbedContents({ requests }),
      EMBED_TIMEOUT_MS,
      'Gemini batch embedding request'
    );
    allEmbeddings.push(...result.embeddings.map((e) => e.values));
  }

  return allEmbeddings;
}

module.exports = { embedText, embedBatch };