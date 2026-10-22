const { index } = require('../config/pinecone');
const { withTimeout } = require('../utils/withTimeout');

const PINECONE_TIMEOUT_MS = 15000;

function userNamespace(userId) {
  return index.namespace(String(userId));
}

async function upsertChunks({ userId, courseId, noteId, dayNumber, chunks, vectors }) {
  const namespace = userNamespace(userId);
  // Remove any previous chunks if this note is reprocessed with different content.
  await withTimeout(
    namespace.deleteMany({ noteId: { $eq: String(noteId) } }),
    PINECONE_TIMEOUT_MS,
    'Pinecone replace note vectors'
  );

  const points = chunks.map((text, i) => ({
    id: `${noteId}-${i}`,
    values: vectors[i],
    metadata: {
      courseId: String(courseId),
      noteId: String(noteId),
      dayNumber: dayNumber ?? -1,
      chunkIndex: i,
      text,
    },
  }));

  const BATCH_SIZE = 100;
  for (let i = 0; i < points.length; i += BATCH_SIZE) {
    await withTimeout(
      namespace.upsert(points.slice(i, i + BATCH_SIZE)),
      PINECONE_TIMEOUT_MS,
      'Pinecone upsert'
    );
  }
}

async function searchSimilar({ userId, courseId, queryVector, limit = 5, noteId = null }) {
  const filter = { courseId: { $eq: String(courseId) } };
  if (noteId) filter.noteId = { $eq: String(noteId) };

  const result = await withTimeout(
    userNamespace(userId).query({
      vector: queryVector,
      topK: limit,
      filter,
      includeMetadata: true,
    }),
    PINECONE_TIMEOUT_MS,
    'Pinecone query'
  );

  return (result.matches || []).map((r) => ({
    text: r.metadata?.text,
    score: r.score,
    noteId: r.metadata?.noteId,
  }));
}

async function deleteByNote(noteId, userId) {
  await withTimeout(
    userNamespace(userId).deleteMany({ noteId: { $eq: String(noteId) } }),
    PINECONE_TIMEOUT_MS,
    'Pinecone delete'
  );
}

async function deleteByUser(userId) {
  await withTimeout(userNamespace(userId).deleteAll(), PINECONE_TIMEOUT_MS, 'Pinecone delete by user');
}

// Wipes every vector tied to one course — used by cascade course deletion.
async function deleteByCourse(courseId, userId) {
  await withTimeout(
    userNamespace(userId).deleteMany({ courseId: { $eq: String(courseId) } }),
    PINECONE_TIMEOUT_MS,
    'Pinecone delete by course'
  );
}

module.exports = { upsertChunks, searchSimilar, deleteByNote, deleteByUser, deleteByCourse };
