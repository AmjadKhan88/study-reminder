const { QdrantClient } = require('@qdrant/js-client-rest');

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = process.env.QDRANT_COLLECTION || 'study-reminder';
const VECTOR_SIZE = parseInt(process.env.GEMINI_EMBEDDING_DIMENSIONS || '768', 10);

async function ensureCollection() {
  const collections = await client.getCollections();
  const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);
  if (!exists) {
    await client.createCollection(COLLECTION_NAME, {
      vectors: { size: VECTOR_SIZE, distance: 'Cosine' },
    });
    console.log(`Qdrant collection "${COLLECTION_NAME}" created`);
  } else {
    console.log(`Qdrant collection "${COLLECTION_NAME}" already exists`);
  }
}

module.exports = { client, COLLECTION_NAME, ensureCollection };