function buildWeeklyPlanPrompt({ title, outline, totalWeeks }) {
  return `You are an expert curriculum designer creating a week-by-week study breakdown.

Course title: ${title}
Course outline/syllabus:
"""
${outline}
"""

Break this course into exactly ${totalWeeks} weeks. For each week, provide a main topic and 3-5 subtopics that logically progress from foundational to advanced concepts, fully covering the outline by the final week.

Respond with ONLY a valid JSON array, no markdown formatting, no code fences, no explanation text, in this exact shape:
[
  { "weekNumber": 1, "topic": "string", "subtopics": ["string", "string", "string"] }
]

The array must have exactly ${totalWeeks} items, weekNumber from 1 to ${totalWeeks}.`;
}

function buildDayContentPrompt({ courseTitle, topic, subtopics, dayNumber, referenceMaterial }) {
  return `You are a friendly, expert tutor writing today's study material for a student, in the style of a well-formatted chat answer (like ChatGPT) — NOT a dense textbook paragraph.

Course: ${courseTitle}
Day ${dayNumber} topic: ${topic}
Focus subtopic(s): ${subtopics.join(', ')}

${referenceMaterial ? `The student has uploaded their own lecture notes. Where these excerpts are relevant to today's topic, ground your explanation in them (paraphrase, don't copy verbatim) and prefer them over generic knowledge:\n"""\n${referenceMaterial}\n"""\n` : ''}
Write the "content" field as a Markdown-formatted string. Follow these rules strictly:
- Start with a short 1-2 sentence friendly intro (no heading for this part).
- Break the material into 2-4 sections, each with a "## " heading that includes one relevant emoji (e.g. "## 🔑 Key Idea", "## 🧩 How It Works", "## 💡 Example", "## ⚠️ Common Mistake").
- Keep paragraphs SHORT — 2-4 sentences max. Never a wall of text.
- Use "- " bullet lists for enumerable facts, steps, or properties.
- Use **bold** around important terms the first time they appear.
- Include at least one concrete worked example inside its own "## 💡 Example" section.
- Leave a blank line between every paragraph, heading, and list item block.
- Total length: 350-600 words.
- Do NOT include a top-level title/H1 (the app already shows the topic name separately).

Also produce:
- keyConcepts: 3-5 short bullet-style strings
- tips: 2-3 short, encouraging, practical study tips specific to this material

Respond with ONLY valid JSON, no code fences, in this exact shape:
{
  "content": "string (markdown as described above, use \\n\\n between blocks)",
  "keyConcepts": ["string", "string", "string"],
  "tips": ["string", "string"]
}`;
}

function buildFlashcardsPrompt({ topic, subtopics, content }) {
  return `Create exactly 10 flashcards for active-recall practice based on this study material.

Topic: ${topic}
Subtopics: ${subtopics.join(', ')}
Study content:
"""
${content}
"""

Respond with ONLY a valid JSON array, no markdown, no code fences, exactly 10 items, in this shape:
[{ "front": "string (question or term)", "back": "string (concise answer or definition)" }]`;
}

function buildQuizPrompt({ topic, subtopics, content }) {
  return `Create a 5-question multiple choice quiz testing understanding of this study material.

Topic: ${topic}
Subtopics: ${subtopics.join(', ')}
Study content:
"""
${content}
"""

Respond with ONLY a valid JSON array, no markdown, no code fences, exactly 5 items, in this shape:
[{ "question": "string", "options": ["string","string","string","string"], "correctIndex": 0, "explanation": "string, brief reason the correct answer is right" }]

correctIndex must be a number 0-3 matching the correct option's position in the options array.`;
}

function buildSummaryPrompt({ title, text }) {
  return `You are an expert study assistant. A student uploaded lecture notes titled "${title}". Summarize them for study purposes.

Notes content:
"""
${text}
"""

Respond with ONLY valid JSON, no code fences, in this exact shape:
{
  "summary": "string, markdown formatted, 150-300 words, use \\n\\n between short paragraphs, bold key terms with **term**",
  "keyConcepts": ["string", "string", "string", "string", "string"]
}`;
}

function buildRagAnswerPrompt({ question, contextChunks }) {
  const context = contextChunks.map((c, i) => `[Excerpt ${i + 1}]\n${c}`).join('\n\n');
  return `You are a helpful study assistant answering a student's question using ONLY the excerpts from their own uploaded lecture notes below. If the excerpts don't contain enough information to answer confidently, say so honestly instead of guessing.

Excerpts from the student's notes:
"""
${context}
"""

Student's question: ${question}

Write a clear, well-formatted Markdown answer: short paragraphs, **bold** for key terms, "- " bullets where useful. Keep it under 300 words. Do not mention "excerpts" or "context" explicitly — just answer naturally as a tutor would.`;
}

module.exports = {
  buildWeeklyPlanPrompt,
  buildDayContentPrompt,
  buildFlashcardsPrompt,
  buildQuizPrompt,
  buildSummaryPrompt,
  buildRagAnswerPrompt,
};