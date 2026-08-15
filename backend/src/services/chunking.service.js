const MAX_CHUNKS = 400; // hard safety ceiling — protects memory regardless of input

// Splits text into overlapping chunks so context isn't lost at chunk boundaries.
function chunkText(text, chunkSize = 1000, overlap = 150) {
  const cleaned = text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
  if (cleaned.length === 0) return [];

  const chunks = [];
  let start = 0;
  const minStep = Math.floor(chunkSize * 0.3); // guarantees forward progress every iteration

  while (start < cleaned.length && chunks.length < MAX_CHUNKS) {
    const end = Math.min(start + chunkSize, cleaned.length);
    let chunk = cleaned.slice(start, end);

    if (end < cleaned.length) {
      const lastBreak = Math.max(chunk.lastIndexOf('\n'), chunk.lastIndexOf('. '));
      if (lastBreak > chunkSize * 0.5) {
        chunk = chunk.slice(0, lastBreak + 1);
      }
    }

    chunks.push(chunk.trim());

    const step = Math.max(chunk.length - overlap, minStep); // never advance by less than minStep
    start += step;
  }

  return chunks.filter((c) => c.length > 20);
}

module.exports = { chunkText, MAX_CHUNKS };