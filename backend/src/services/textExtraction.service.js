const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');

const MAX_EXTRACTED_CHARS = 300000; // ~150-200 pages of plain text — generous ceiling for lecture notes

async function extractText(buffer, mimetype) {
  let text;

  if (mimetype === 'application/pdf') {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      text = result.text;
    } finally {
      await parser.destroy(); // releases the underlying pdf.js document/worker resources
    }
  } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else if (mimetype === 'text/plain') {
    text = buffer.toString('utf-8');
  } else {
    throw new Error('Unsupported file type');
  }

  const truncated = text.length > MAX_EXTRACTED_CHARS;
  return {
    text: truncated ? text.slice(0, MAX_EXTRACTED_CHARS) : text,
    truncated,
    originalLength: text.length,
  };
}

module.exports = { extractText, MAX_EXTRACTED_CHARS };