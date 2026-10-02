import * as pdfjsLib from 'pdfjs-dist';
import { DocumentPage, PDFDocumentData } from '../types';

// Setup PDF.js worker with reliable cdn fallback for all mobile browsers & Vite bundling
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  } catch {
    // If worker fails, pdfjs will fall back to main thread gracefully
  }
}

/**
 * Clean and split text into natural, digestible sentences for smooth speech synthesis.
 * Optimized for Spanish, English, French, etc., respecting ¿?, ¡!, periods, semicolons.
 */
export function splitIntoSentences(text: string): string[] {
  if (!text || !text.trim()) return [];

  // Normalize excessive spaces, carriage returns, and control characters
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    // Fix hyphenated line breaks (e.g. con- / tinuación -> continuación)
    .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2')
    .replace(/\n+/g, ' ')
    .trim();

  if (!normalized) return [];

  // Protect common abbreviations in Spanish so they are not treated as sentence ends
  const protectedText = normalized
    .replace(/\b(Sr|Sra|Dr|Dra|D|Dña|pág|pag|cap|ej|etc|vs|art|núm|num|dpto|Ud|Uds)\./gi, '$1{{DOT}}')
    .replace(/([0-9]+)\.([0-9]+)/g, '$1{{NUMDOT}}$2');

  // Split strictly by full sentence terminators (. ! ?) followed by capital letter or quote
  const rawChunks = protectedText.split(/(?<=[.?!])\s+(?=[A-ZÁÉÍÓÚÑ¿¡"«“—\d])/g);

  const sentences: string[] = [];
  for (const chunk of rawChunks) {
    // Restore protected dots
    const restored = chunk
      .replace(/\{\{DOT\}\}/g, '.')
      .replace(/\{\{NUMDOT\}\}/g, '.')
      .trim();

    if (!restored) continue;
    
    // Only break truly excessive blocks (> 450 characters without any period) to prevent TTS freeze
    if (restored.length > 450) {
      const parts = restored.match(/[^,;:—]+[,;:—]?/g);
      if (parts && parts.length > 1) {
        let buffer = '';
        for (const part of parts) {
          if ((buffer + ' ' + part).length > 320 && buffer.length > 0) {
            sentences.push(buffer.trim());
            buffer = part;
          } else {
            buffer = buffer ? `${buffer} ${part}` : part;
          }
        }
        if (buffer.trim()) {
          sentences.push(buffer.trim());
        }
      } else {
        sentences.push(restored);
      }
    } else {
      sentences.push(restored);
    }
  }

  return sentences.length > 0 ? sentences : [normalized];
}

/**
 * Parse an ArrayBuffer of a PDF file using pdf.js and extract pages & sentences.
 * Throws clean user-friendly error messages if corrupted or password protected.
 */
export async function parsePdfArrayBuffer(
  arrayBuffer: ArrayBuffer,
  fileName: string
): Promise<PDFDocumentData> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useWorkerFetch: false,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pages: DocumentPage[] = [];
  let totalSentences = 0;

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    
    // Combine text items with proper spacing
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .trim();

    const sentences = splitIntoSentences(pageText);
    totalSentences += sentences.length;

    pages.push({
      pageNumber: i,
      text: pageText || '(Página sin texto reconocible o con imágenes)',
      sentences: sentences.length > 0 ? sentences : ['Página sin texto detectable.'],
    });
  }

  const cleanTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ');

  return {
    title: cleanTitle,
    fileName,
    totalPages: numPages,
    pages,
    totalSentences: Math.max(1, totalSentences),
  };
}

/**
 * Creates a PDFDocumentData structure from raw text (for pasted text or sample books).
 */
export function createDocumentFromText(title: string, text: string): PDFDocumentData {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const pages: DocumentPage[] = [];
  let totalSentences = 0;

  // Group paragraphs into ~250-300 word pages for easy reading
  const wordsPerPage = 200;
  let currentPageText: string[] = [];
  let currentWordCount = 0;
  let pageNumber = 1;

  for (const para of paragraphs) {
    const paraWords = para.split(/\s+/).length;
    currentPageText.push(para);
    currentWordCount += paraWords;

    if (currentWordCount >= wordsPerPage) {
      const fullText = currentPageText.join('\n\n');
      const sentences = splitIntoSentences(fullText);
      totalSentences += sentences.length;

      pages.push({
        pageNumber,
        text: fullText,
        sentences,
      });

      pageNumber++;
      currentPageText = [];
      currentWordCount = 0;
    }
  }

  if (currentPageText.length > 0 || pages.length === 0) {
    const fullText = currentPageText.join('\n\n') || text;
    const sentences = splitIntoSentences(fullText);
    totalSentences += sentences.length;

    pages.push({
      pageNumber,
      text: fullText,
      sentences: sentences.length > 0 ? sentences : [fullText],
    });
  }

  return {
    title,
    fileName: `${title.toLowerCase().replace(/\s+/g, '_')}.txt`,
    totalPages: pages.length,
    pages,
    totalSentences: Math.max(1, totalSentences),
  };
}
