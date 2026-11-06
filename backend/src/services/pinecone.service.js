const { Pinecone } = require("@pinecone-database/pinecone");
const User = require("../models/User.model");
const { decrypt } = require("../utils/crypto");

const INDEX_NAME = process.env.PINECONE_INDEX || "studypilot-notes";
const DIMENSIONS = parseInt(
  process.env.GEMINI_EMBEDDING_DIMENSIONS || "768",
  10,
);

function makeError(message, statusCode, apiCode) {
  const e = new Error(message);
  e.statusCode = statusCode;
  e.apiCode = apiCode;
  return e;
}

function normalizePineconeError(err) {
  if (err?.apiCode) return err;
  const msg = `${err?.name || ""} ${err?.message || ""}`;
  if (/Authorization|Unauthorized|\b401\b|\b403\b|api key/i.test(msg)) {
    return makeError(
      "Your Pinecone API key is invalid or expired. Please update it in Settings.",
      400,
      "PINECONE_KEY_INVALID",
    );
  }
  if (/quota|RESOURCE_EXHAUSTED|\b429\b/i.test(msg)) {
    return makeError(
      "Your Pinecone account reached its limit. Check your Pinecone dashboard.",
      429,
      "PINECONE_LIMIT",
    );
  }
  return err;
}

// Called when the user saves a key: checks it works and creates the index if missing.
async function validateAndPrepareIndex(apiKey) {
  const client = new Pinecone({ apiKey });

  let existing;
  try {
    const list = await client.listIndexes();
    existing = (list.indexes || []).find((i) => i.name === INDEX_NAME);
  } catch (err) {
    const e = normalizePineconeError(err);
    if (e.apiCode === "PINECONE_KEY_INVALID") return { valid: false };
    throw e;
  }

  if (existing) {
    if (existing.dimension !== DIMENSIONS) {
      throw makeError(
        `You already have an index named "${INDEX_NAME}" with the wrong size (${existing.dimension}). Delete it in your Pinecone dashboard and try again.`,
        400,
        "PINECONE_INDEX_MISMATCH",
      );
    }
    return { valid: true };
  }

  try {
    await client.createIndex({
      name: INDEX_NAME,
      dimension: DIMENSIONS,
      metric: "cosine",
      spec: { serverless: { cloud: "aws", region: "us-east-1" } },
      waitUntilReady: true,
      suppressConflicts: true,
    });
  } catch (err) {
    const e = normalizePineconeError(err);
    if (!e.statusCode) {
      e.statusCode = 400;
      e.message = `Could not create the Pinecone index: ${e.message}`;
    }
    throw e;
  }
  return { valid: true };
}

const cache = new Map(); // userId -> { enc, index }

// Returns the user's own Pinecone index. With { required: false } it returns
// null instead of throwing when the user has no key.
async function getUserIndex(userId, { required = true } = {}) {
  const user = await User.findById(userId).select("+pineconeApiKeyEncrypted");
  if (!user?.pineconeApiKeyEncrypted) {
    if (!required) return null;
    throw makeError(
      "Add your Pinecone API key in Settings to use lecture notes.",
      400,
      "PINECONE_KEY_REQUIRED",
    );
  }

  const cached = cache.get(String(userId));
  if (cached && cached.enc === user.pineconeApiKeyEncrypted)
    return cached.index;

  const index = new Pinecone({
    apiKey: decrypt(user.pineconeApiKeyEncrypted),
  }).index(INDEX_NAME);
  cache.set(String(userId), { enc: user.pineconeApiKeyEncrypted, index });
  return index;
}

module.exports = {
  validateAndPrepareIndex,
  getUserIndex,
  normalizePineconeError,
};
