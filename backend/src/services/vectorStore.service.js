const { getUserIndex, normalizePineconeError } = require("./pinecone.service");
const { withTimeout } = require("../utils/withTimeout");

const PINECONE_TIMEOUT_MS = 15000;

async function getNamespace(userId, required = true) {
  const index = await getUserIndex(userId, { required });
  return index ? index.namespace(String(userId)) : null;
}

async function upsertChunks({
  userId,
  courseId,
  noteId,
  dayNumber,
  chunks,
  vectors,
}) {
  const namespace = await getNamespace(userId);
  try {
    await withTimeout(
      namespace.deleteMany({ noteId: { $eq: String(noteId) } }),
      PINECONE_TIMEOUT_MS,
      "Pinecone replace note vectors",
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
        "Pinecone upsert",
      );
    }
  } catch (err) {
    throw normalizePineconeError(err);
  }
}

async function searchSimilar({
  userId,
  courseId,
  queryVector,
  limit = 5,
  noteId = null,
}) {
  const namespace = await getNamespace(userId);
  const filter = { courseId: { $eq: String(courseId) } };
  if (noteId) filter.noteId = { $eq: String(noteId) };

  try {
    const result = await withTimeout(
      namespace.query({
        vector: queryVector,
        topK: limit,
        filter,
        includeMetadata: true,
      }),
      PINECONE_TIMEOUT_MS,
      "Pinecone query",
    );
    return (result.matches || []).map((r) => ({
      text: r.metadata?.text,
      score: r.score,
      noteId: r.metadata?.noteId,
    }));
  } catch (err) {
    throw normalizePineconeError(err);
  }
}

// Delete helpers do nothing when the user has no Pinecone key.
async function deleteByNote(noteId, userId) {
  const namespace = await getNamespace(userId, false);
  if (!namespace) return;
  await withTimeout(
    namespace.deleteMany({ noteId: { $eq: String(noteId) } }),
    PINECONE_TIMEOUT_MS,
    "Pinecone delete",
  );
}

async function deleteByUser(userId) {
  const namespace = await getNamespace(userId, false);
  if (!namespace) return;
  await withTimeout(
    namespace.deleteAll(),
    PINECONE_TIMEOUT_MS,
    "Pinecone delete by user",
  );
}

async function deleteByCourse(courseId, userId) {
  const namespace = await getNamespace(userId, false);
  if (!namespace) return;
  await withTimeout(
    namespace.deleteMany({ courseId: { $eq: String(courseId) } }),
    PINECONE_TIMEOUT_MS,
    "Pinecone delete by course",
  );
}

module.exports = {
  upsertChunks,
  searchSimilar,
  deleteByNote,
  deleteByUser,
  deleteByCourse,
};
