/* ----------------------------- shared rule blocks ---------------------------- */

const DIFFICULTY = {
  easy: {
    plan: "The student is a complete beginner. Start from the very basics, move slowly, and use exactly 3 small subtopics per week. Skip advanced topics unless the outline demands them.",
    content:
      "The student is a COMPLETE BEGINNER. Start from zero, define every term, use real-life analogies, and teach in very small steps. Use the simplest examples (small numbers, short code, everyday situations).",
    quiz: "Questions test basic recall and simple understanding. Wrong options must be clearly different from the right answer.",
  },
  medium: {
    plan: "The student knows the basics. Use 3-5 subtopics per week with a balanced pace from fundamentals to intermediate level.",
    content:
      "The student knows the basics. Give a balanced explanation: short revision of the idea, then how it works, then examples at normal exam level.",
    quiz: "Questions mix recall and applying the idea to a small problem. Wrong options should be believable.",
  },
  difficult: {
    plan: "The student has strong basics and wants depth. Use 4-5 subtopics per week, include advanced topics, problem solving, and exam-level practice.",
    content:
      "The student has STRONG BASICS and wants depth. Go deeper: reasoning behind the idea, edge cases, common traps, and harder multi-step examples. Keep the WORDS simple even though the ideas are advanced.",
    quiz: "Questions need multi-step thinking, analysis, or solving a harder problem. Wrong options should be very believable (common mistakes).",
  },
};

function level(difficulty) {
  return DIFFICULTY[difficulty] || DIFFICULTY.medium;
}

const SIMPLE_ENGLISH_RULES = `LANGUAGE RULES (very important. The student is from Pakistan and English is NOT their first language):
- Use simple, everyday English. Short sentences (about 12-18 words). Active voice.
- No idioms, no slang, no fancy words. Say "use" not "utilize", "show" not "demonstrate".
- If you must use a hard English word, an academic word, or a technical term, write its simple meaning in brackets right after it, the first time only. Example: "Photosynthesis (how plants make food from sunlight)" or "Ambiguous (having more than one possible meaning)".
- Keep subject terms in English (students need them in exams) but always explain them in simple words.`;

const SUBJECT_FORMAT_RULES = `SUBJECT FORMATTING RULES (first detect the subject from the course title and topic, then follow the matching rules):

MATHS / STATISTICS:
- Show formulas in LaTeX. Inline math: $x^2 + 1$. Display math on its own lines: $$ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} $$
- Give the formula first, then a worked example, one step per line, then the final answer in **bold**.

PHYSICS:
- Worked problems use this layout: **Given**, **Find**, **Formula**, **Solution**, **Answer**. Always write units (SI). Equations in LaTeX.

CHEMISTRY:
- Write formulas like $\\mathrm{H_2O}$ and reactions like $$ \\mathrm{2H_2 + O_2 \\rightarrow 2H_2O} $$. Use a table to compare substances or properties.

BIOLOGY / PROCESSES / HISTORY TIMELINES:
- Use a Mermaid diagram for any process or cycle, and a table for comparisons.

PROGRAMMING / COMPUTER SCIENCE:
- Put every code example in a fenced block with the language name (python, javascript, cpp, c, java, sql, bash...). Keep each block under 25 lines.
- After the code, explain it line by line in simple words. Show the sample output in a separate \`\`\`text block.
- For algorithms, add a Mermaid flowchart. For data structures, use a small table or Mermaid diagram.

ECONOMICS / ACCOUNTING / BUSINESS:
- Use tables for numbers and formulas in LaTeX. Always show the calculation steps.

LANGUAGES / HUMANITIES / OTHER:
- Use tables for vocabulary or comparisons, short bullet lists, and clear examples.

DIAGRAM RULES (Mermaid):
- Use a fenced block with the word mermaid. Supported: flowchart TD, flowchart LR, sequenceDiagram, classDiagram, stateDiagram-v2, erDiagram, pie, timeline.
- Keep diagrams small (max 12 nodes). ALWAYS put node labels in double quotes, like A["Start"] --> B["Check input (valid?)"]. Never use unquoted brackets, colons or quotes inside labels.

GENERAL:
- Write all math in LaTeX with $ ... $ and $$ ... $$ (never \\( \\) or \\[ \\]). Do NOT use the $ sign for money; write "Rs. 500" or "USD 5".
- Use Markdown tables for comparisons. No images, no HTML tags, no ASCII art.`;

/* --------------------------------- prompts ---------------------------------- */

function buildWeeklyPlanPrompt({ title, outline, totalWeeks, difficulty }) {
  return `You are an expert curriculum designer creating a week-by-week study breakdown.

Course title: ${title}
Difficulty level: ${difficulty || "medium"}
Level guidance: ${level(difficulty).plan}
Course outline/syllabus:
"""
${outline}
"""

Break this course into exactly ${totalWeeks} weeks. For each week give a main topic and subtopics that progress logically and fully cover the outline by the final week. Write topic names in simple English.

Respond with ONLY a valid JSON array, no markdown formatting, no code fences, no explanation text, in this exact shape:
[
  { "weekNumber": 1, "topic": "string", "subtopics": ["string", "string", "string"] }
]

The array must have exactly ${totalWeeks} items, weekNumber from 1 to ${totalWeeks}.`;
}

function buildDayContentPrompt({
  courseTitle,
  topic,
  subtopics,
  dayNumber,
  referenceMaterial,
  difficulty,
}) {
  return `You are a friendly, expert tutor writing today's study material for a student, in the style of a well-formatted chat answer. NOT a dense textbook paragraph.

Course: ${courseTitle}
Day ${dayNumber} topic: ${topic}
Focus subtopic(s): ${subtopics.join(", ")}

DIFFICULTY: ${level(difficulty).content}

${SIMPLE_ENGLISH_RULES}

${SUBJECT_FORMAT_RULES}

${referenceMaterial ? `The student uploaded their own lecture notes. Where these excerpts are relevant, ground your explanation in them (paraphrase, don't copy) and prefer them over generic knowledge:\n"""\n${referenceMaterial}\n"""\n` : ""}
STRUCTURE OF THE "CONTENT" PART (Markdown):
- Start with a 1-2 sentence friendly intro (no heading).
- Then 2-4 sections, each with a "## " heading that has one relevant emoji (for example "## 🔑 Key Idea", "## 🧩 How It Works", "## 💡 Example", "## ⚠️ Common Mistake").
- Keep paragraphs SHORT (2-4 sentences). Use "- " bullet lists for steps and facts. Use **bold** for important terms the first time.
- Include at least one fully worked example in its own "## 💡 Example" section.
- Leave a blank line between paragraphs, headings, lists, code blocks, tables and diagrams.
- Total length: 400-700 words (code and formulas not counted).
- Do NOT write a top-level H1 title.

OUTPUT FORMAT (strict). Do NOT use JSON. Use exactly these three marker lines, each alone on its own line, in this order, with nothing before the first marker and nothing after the last section. Write LaTeX normally with single backslashes.

===CONTENT===
(the Markdown content here)
===KEY_CONCEPTS===
- first key concept (3-5 short lines)
===TIPS===
- first study tip (2-3 short, encouraging, practical tips for this material)`;
}

function buildFlashcardsPrompt({ topic, subtopics, content, difficulty }) {
  return `Create exactly 10 flashcards for active-recall practice based on this study material.

Topic: ${topic}
Subtopics: ${subtopics.join(", ")}
Difficulty guidance: ${level(difficulty).quiz}

${SIMPLE_ENGLISH_RULES}

Plain-text rules: do NOT use LaTeX, Markdown or code fences. Write maths with normal symbols (x², √16, ½, ×, ÷, π, ≤, ≥). Keep code to a very short single line if needed.

Study content:
"""
${content}
"""

Respond with ONLY a valid JSON array, no markdown, no code fences, exactly 10 items, in this shape:
[{ "front": "string (question or term)", "back": "string (short simple answer or definition)" }]`;
}

function buildQuizPrompt({ topic, subtopics, content, difficulty }) {
  return `Create a 5-question multiple choice quiz testing understanding of this study material.

Topic: ${topic}
Subtopics: ${subtopics.join(", ")}
Difficulty guidance: ${level(difficulty).quiz}

${SIMPLE_ENGLISH_RULES}

Plain-text rules: do NOT use LaTeX, Markdown or code fences. Write maths with normal symbols (x², √16, ½, ×, ÷, π, ≤, ≥).

Study content:
"""
${content}
"""

Respond with ONLY a valid JSON array, no markdown, no code fences, exactly 5 items, in this shape:
[{ "question": "string", "options": ["string","string","string","string"], "correctIndex": 0, "explanation": "string, a brief simple reason the correct answer is right" }]

correctIndex must be a number 0-3 matching the correct option's position in the options array.`;
}

function buildSummaryPrompt({ title, text }) {
  return `You are an expert study assistant. A student uploaded lecture notes titled "${title}". Summarize them for study purposes.

${SIMPLE_ENGLISH_RULES}

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
  const context = contextChunks
    .map((c, i) => `[Excerpt ${i + 1}]\n${c}`)
    .join("\n\n");
  return `You are a helpful study assistant answering a student's question using ONLY the excerpts from their own uploaded lecture notes below. If the excerpts don't contain enough information to answer confidently, say so honestly instead of guessing.

${SIMPLE_ENGLISH_RULES}

Excerpts from the student's notes:
"""
${context}
"""

Student's question: ${question}

Write a clear, well-formatted Markdown answer: short paragraphs, **bold** for key terms, "- " bullets where useful. Keep it under 300 words. Do not mention "excerpts" or "context". Just answer naturally as a tutor would.`;
}

module.exports = {
  buildWeeklyPlanPrompt,
  buildDayContentPrompt,
  buildFlashcardsPrompt,
  buildQuizPrompt,
  buildSummaryPrompt,
  buildRagAnswerPrompt,
};
