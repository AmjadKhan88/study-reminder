const { Pinecone } = require('@pinecone-database/pinecone');

const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX;

if (!apiKey) throw new Error('Missing required environment variable: PINECONE_API_KEY');
if (!indexName) throw new Error('Missing required environment variable: PINECONE_INDEX');

const client = new Pinecone({ apiKey });
const index = client.index(indexName);

async function ensureIndex() {
  const description = await client.describeIndex(indexName);
  const expectedDimensions = parseInt(process.env.GEMINI_EMBEDDING_DIMENSIONS || '768', 10);
  if (description.dimension !== expectedDimensions) {
    throw new Error(
      `Pinecone index "${indexName}" has dimension ${description.dimension}; expected ${expectedDimensions}.`
    );
  }
  console.log(`Pinecone connected: index "${indexName}" (${description.dimension} dimensions)`);
}

module.exports = { client, index, indexName, ensureIndex };
