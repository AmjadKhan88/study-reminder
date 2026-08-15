const Course = require('../models/Course.model');
const LectureNote = require('../models/LectureNote.model');
const { extractText } = require('./textExtraction.service');
const { chunkText } = require('./chunking.service');
const { embedBatch, embedText } = require('./embedding.service');
const { upsertChunks, searchSimilar } = require('./vectorStore.service');
const { getAIProvider } = require('./ai');
const { buildSummaryPrompt, buildRagAnswerPrompt } = require('./ai/promptBuilder');
const { parseJsonObjectResponse } = require('./ai/parseUtils');

const MAX_CHARS_FOR_SUMMARY = 30000; // keeps the summary prompt within a safe token budget

// Runs after the upload response has already been sent — extraction, chunking,
// embedding, and summarization all happen here in the background.
async function processLectureNote(noteId, fileBuffer) {
  const note = await LectureNote.findById(noteId);
  if (!note) return;

  try {
    const rawText = await extractText(fileBuffer, note.fileType);
    if (!rawText || rawText.trim().length < 50) {
      throw new Error('Could not extract readable text from this file');
    }

    const chunks = chunkText(rawText);
    if (chunks.length === 0) throw new Error('No usable content found in file');

    const vectors = await embedBatch(chunks);
    await upsertChunks({
      userId: note.user,
      courseId: note.course,
      noteId: note._id,
      dayNumber: note.dayNumber,
      chunks,
      vectors,
    });

    const course = await Course.findById(note.course);
    const provider = getAIProvider(course.aiProvider);
    const summaryPrompt = buildSummaryPrompt({
      title: note.title,
      text: rawText.slice(0, MAX_CHARS_FOR_SUMMARY),
    });
    const raw = await provider.generateJSON(summaryPrompt);
    const parsed = parseJsonObjectResponse(raw);

    note.extractedCharCount = rawText.length;
    note.chunkCount = chunks.length;
    note.summary = parsed.summary;
    note.keyConcepts = parsed.keyConcepts || [];
    note.status = 'ready';
    await note.save();
  } catch (err) {
    note.status = 'failed';
    note.errorMessage = err.message;
    await note.save();
  }
}

async function answerQuestion({ courseId, userId, question, noteId }) {
  const course = await Course.findOne({ _id: courseId, user: userId });
  if (!course) throw new Error('Course not found');

  const queryVector = await embedText(question);
  const matches = await searchSimilar({ userId, courseId, queryVector, limit: 5, noteId });

  if (matches.length === 0) {
    return {
      answer:
        "I couldn't find anything relevant in your uploaded notes for this course yet. Try uploading lecture notes first, or rephrase your question.",
      sources: [],
    };
  }

  const provider = getAIProvider(course.aiProvider);
  const prompt = buildRagAnswerPrompt({ question, contextChunks: matches.map((m) => m.text) });
  const answer = await provider.generateJSON(prompt); // plain markdown text, no JSON parsing needed here

  return { answer, sources: matches.map((m) => ({ noteId: m.noteId, score: m.score })) };
}

module.exports = { processLectureNote, answerQuestion };