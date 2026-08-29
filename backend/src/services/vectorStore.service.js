const { randomUUID } = require('crypto');
const { client, COLLECTION_NAME } = require('../config/qdrant');
const { withTimeout } = require('../utils/withTimeout');

const QDRANT_TIMEOUT_MS = 15000;

async function upsertChunks({ userId, courseId, noteId, dayNumber, chunks, vectors }) {
  const points = chunks.map((text, i) => ({
    id: randomUUID(),
    vector: vectors[i],
    payload: {
      userId: String(userId),
      courseId: String(courseId),
      noteId: String(noteId),
      dayNumber: dayNumber ?? null,
      chunkIndex: i,
      text,
    },
  }));

  const BATCH_SIZE = 100;
  for (let i = 0; i < points.length; i += BATCH_SIZE) {
    await withTimeout(
      client.upsert(COLLECTION_NAME, { points: points.slice(i, i + BATCH_SIZE) }),
      QDRANT_TIMEOUT_MS,
      'Qdrant upsert'
    );
  }
}

async function searchSimilar({ userId, courseId, queryVector, limit = 5, noteId = null }) {
  const must = [
    { key: 'userId', match: { value: String(userId) } },
    { key: 'courseId', match: { value: String(courseId) } },
  ];
  if (noteId) must.push({ key: 'noteId', match: { value: String(noteId) } });

  const result = await withTimeout(
    client.query(COLLECTION_NAME, { query: queryVector, limit, filter: { must }, with_payload: true }),
    QDRANT_TIMEOUT_MS,
    'Qdrant query'
  );

  return result.points.map((r) => ({ text: r.payload.text, score: r.score, noteId: r.payload.noteId }));
}

async function deleteByNote(noteId) {
  await withTimeout(
    client.delete(COLLECTION_NAME, { filter: { must: [{ key: 'noteId', match: { value: String(noteId) } }] } }),
    QDRANT_TIMEOUT_MS,
    'Qdrant delete'
  );
}

// Wipes every vector belonging to a user across all their courses/notes —
// used when an account is deleted, so no orphaned data survives in Qdrant.
async function deleteByUser(userId) {
  await withTimeout(
    client.delete(COLLECTION_NAME, { filter: { must: [{ key: 'userId', match: { value: String(userId) } }] } }),
    QDRANT_TIMEOUT_MS,
    'Qdrant delete by user'
  );
}

module.exports = { upsertChunks, searchSimilar, deleteByNote, deleteByUser };