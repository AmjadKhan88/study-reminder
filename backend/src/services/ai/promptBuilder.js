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

function buildDayContentPrompt({ courseTitle, topic, subtopics, dayNumber }) {
  return `You are an expert tutor writing today's study material for a student.

Course: ${courseTitle}
Day ${dayNumber} topic: ${topic}
Focus subtopic(s): ${subtopics.join(', ')}

Write clear, well-structured study content a student can read and understand in about 30-45 minutes, covering the subtopic(s) in depth with a concrete example where useful. Also list the key concepts and 2-3 practical tips for retaining this material.

Respond with ONLY valid JSON, no markdown formatting, no code fences, in this exact shape:
{
  "content": "string (plain text, use \\n\\n between paragraphs, 300-600 words)",
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

module.exports = { buildWeeklyPlanPrompt, buildDayContentPrompt, buildFlashcardsPrompt, buildQuizPrompt };