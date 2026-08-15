// Splits text into overlapping chunks so context isn't lost at chunk boundaries.
function chunkText(text, chunkSize = 1000, overlap = 150) {
  const cleaned = text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
  if (cleaned.length === 0) return [];

  const chunks = [];
  let start = 0;

  while (start < cleaned.length) {
    const end = Math.min(start + chunkSize, cleaned.length);
    let chunk = cleaned.slice(start, end);

    // Prefer breaking on a sentence/paragraph boundary rather than mid-word
    if (end < cleaned.length) {
      const lastBreak = Math.max(chunk.lastIndexOf('\n'), chunk.lastIndexOf('. '));
      if (lastBreak > chunkSize * 0.5) {
        chunk = chunk.slice(0, lastBreak + 1);
      }
    }

    chunks.push(chunk.trim());
    start += chunk.length - overlap;
    if (chunk.length === 0) break; // safety net against infinite loop
  }

  return chunks.filter((c) => c.length > 20); // drop tiny fragments
}

module.exports = { chunkText };