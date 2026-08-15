const { randomUUID } = require('crypto');
const { client, COLLECTION_NAME } = require('../config/qdrant');

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

  const BATCH_SIZE = 100; // Qdrant's recommended upsert batch size
  for (let i = 0; i < points.length; i += BATCH_SIZE) {
    await client.upsert(COLLECTION_NAME, { points: points.slice(i, i + BATCH_SIZE) });
  }
}

// Every search is scoped to userId + courseId — this IS the multi-tenant
// isolation boundary in the vector DB, mirroring the Mongo query pattern.
async function searchSimilar({ userId, courseId, queryVector, limit = 5, noteId = null }) {
  const must = [
    { key: 'userId', match: { value: String(userId) } },
    { key: 'courseId', match: { value: String(courseId) } },
  ];
  if (noteId) must.push({ key: 'noteId', match: { value: String(noteId) } });

  const result = await client.search(COLLECTION_NAME, {
    vector: queryVector,
    limit,
    filter: { must },
    with_payload: true,
  });

  return result.map((r) => ({ text: r.payload.text, score: r.score, noteId: r.payload.noteId }));
}

async function deleteByNote(noteId) {
  await client.delete(COLLECTION_NAME, {
    filter: { must: [{ key: 'noteId', match: { value: String(noteId) } }] },
  });
}

module.exports = { upsertChunks, searchSimilar, deleteByNote };