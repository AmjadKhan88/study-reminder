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

module.exports = { buildWeeklyPlanPrompt };