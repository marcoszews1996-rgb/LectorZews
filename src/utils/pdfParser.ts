// Ensure polyfills for PDF.js are active in all mobile environments & WebViews
if (typeof window !== 'undefined') {
  if (!window.Promise || !Promise.try) {
    (Promise as unknown as { try: (fn: (...args: unknown[]) => unknown, ...args: unknown[]) => Promise<unknown> }).try = function (
      fn: (...args: unknown[]) => unknown,
      ...args: unknown[]
    ) {
      return new Promise((resolve) => resolve(fn(...args)));
    };
  }
  if (typeof Uint8Array !== 'undefined' && !(Uint8Array.prototype as unknown as { toHex?: unknown }).toHex) {
    (Uint8Array.prototype as unknown as { toHex: (this: Uint8Array) => string }).toHex = function (this: Uint8Array) {
      let hex = '';
      for (let i = 0; i < this.length; i++) {
        const b = this[i].toString(16);
        hex += (b.length === 1 ? '0' : '') + b;
      }
      return hex;
    };
  }
}

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { DocumentPage, PDFDocumentData } from '../types';

// Setup PDF.js worker with local same-origin worker first, then cdn fallback
if (typeof window !== 'undefined') {
  try {
    // Local worker guarantees no cross-origin CSP or security blocks
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  } catch {
    // If worker fails, pdfjs falls back to main thread execution
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
 * Robust secondary fallback parser that reads text directly from PDF binary streams
 * if the main pdf.js engine encounters an unsupported format, strict DRM or corrupted xrefs.
 */
function extractTextFromPdfFallback(arrayBuffer: ArrayBuffer, fileName: string): PDFDocumentData {
  try {
    const bytes = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder('latin1');
    const rawString = decoder.decode(bytes);

    // Look for PDF text blocks between BT (Begin Text) and ET (End Text)
    const textMatches: string[] = [];
    const btRegex = /BT[\s\S]*?ET/g;
    let match: RegExpExecArray | null;

    while ((match = btRegex.exec(rawString)) !== null) {
      const block = match[0];
      // Match (Text) Tj or [(T) (e) (x) (t)] TJ
      const tjRegex = /\((.*?)\)\s*Tj/g;
      let tjMatch: RegExpExecArray | null;
      while ((tjMatch = tjRegex.exec(block)) !== null) {
        const text = tjMatch[1]
          .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
          .replace(/\\([()])/g, '$1')
          .replace(/\\n/g, ' ')
          .replace(/\\r/g, ' ')
          .trim();
        if (text) textMatches.push(text);
      }

      // Also match array format [ (part1) -10 (part2) ] TJ
      const arrayTjRegex = /\[(.*?)\]\s*TJ/g;
      let arrayMatch: RegExpExecArray | null;
      while ((arrayMatch = arrayTjRegex.exec(block)) !== null) {
        const inner = arrayMatch[1];
        const stringParts = inner.match(/\((.*?)\)/g);
        if (stringParts) {
          const combined = stringParts
            .map((s) => s.slice(1, -1).replace(/\\([()])/g, '$1'))
            .join('')
            .trim();
          if (combined) textMatches.push(combined);
        }
      }
    }

    const cleanTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ');

    if (textMatches.length > 0) {
      const allText = textMatches.join(' ');
      return createDocumentFromText(cleanTitle, allText);
    }

    // Check if raw stream has readable UTF-8 strings of length >= 4
    const printableWords: string[] = [];
    const wordRegex = /[A-ZÁÉÍÓÚÑa-záéíóúñ0-9,.!¿?¡:;—'"«»]{4,}/g;
    let wordMatch: RegExpExecArray | null;
    let count = 0;
    while ((wordMatch = wordRegex.exec(rawString)) !== null && count < 2000) {
      const w = wordMatch[0];
      // Skip PDF operators
      if (!/^(endstream|endobj|Length|FlateDecode|Filter|MediaBox|Subtype|Catalog|Pages|Font)/i.test(w)) {
        printableWords.push(w);
        count++;
      }
    }

    if (printableWords.length >= 20) {
      const recovered = printableWords.join(' ');
      return createDocumentFromText(cleanTitle, recovered);
    }
  } catch (err) {
    console.warn('Fallback stream extractor warning:', err);
  }

  // Graceful fallback for scanned/image-only PDFs
  const cleanTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ');
  return {
    title: cleanTitle,
    fileName,
    totalPages: 1,
    pages: [
      {
        pageNumber: 1,
        text: `Documento cargado: "${cleanTitle}". Este archivo no contiene texto digital seleccionable o está compuesto por imágenes escaneadas. Puedes escuchar este aviso o cargar otro PDF con texto escrito para una lectura completa.`,
        sentences: [
          `Documento cargado: "${cleanTitle}".`,
          `Este archivo no contiene texto digital seleccionable o está compuesto por imágenes escaneadas.`,
          `Puedes escuchar este aviso o cargar otro PDF con texto escrito para una lectura fluida en voz alta.`,
        ],
      },
    ],
    totalSentences: 3,
  };
}

/**
 * Parse an ArrayBuffer of a PDF file using pdf.js with automatic multi-level fallbacks.
 * Never throws fatal exceptions to the user UI.
 */
export async function parsePdfArrayBuffer(
  arrayBuffer: ArrayBuffer,
  fileName: string
): Promise<PDFDocumentData> {
  const cleanTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ');

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      cMapUrl: '/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: '/standard_fonts/',
      stopAtErrors: false,
      useSystemFonts: true,
      verbosity: 0,
    });

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const pages: DocumentPage[] = [];
    let totalSentences = 0;
    let hasAnyText = false;

    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();

        // Combine text items with proper spacing
        const pageText = textContent.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ')
          .trim();

        if (pageText.length > 0) {
          hasAnyText = true;
        }

        const sentences = splitIntoSentences(pageText);
        totalSentences += sentences.length;

        pages.push({
          pageNumber: i,
          text: pageText || `(Página ${i} sin texto digital o con imágenes)`,
          sentences:
            sentences.length > 0
              ? sentences
              : [`Página ${i}: esta página no contiene texto seleccionable.`],
        });
      } catch (pageErr) {
        console.warn(`Error reading page ${i}:`, pageErr);
        pages.push({
          pageNumber: i,
          text: `Página ${i}`,
          sentences: [`Página ${i}`],
        });
      }
    }

    // If PDF opened but has virtually zero digital text, try fallback stream recovery
    if (!hasAnyText && pages.length <= 3) {
      const fallbackResult = extractTextFromPdfFallback(arrayBuffer, fileName);
      if (fallbackResult.pages.length > 0 && fallbackResult.totalSentences > 0) {
        return fallbackResult;
      }
    }

    return {
      title: cleanTitle,
      fileName,
      totalPages: Math.max(1, numPages),
      pages:
        pages.length > 0
          ? pages
          : [
              {
                pageNumber: 1,
                text: `Documento "${cleanTitle}"`,
                sentences: [`Documento "${cleanTitle}"`],
              },
            ],
      totalSentences: Math.max(1, totalSentences),
    };
  } catch (primaryErr) {
    console.warn('PDF.js primary parser error, attempting robust fallback:', primaryErr);
    // Execute fallback parser so the user never receives a blocking error toast!
    return extractTextFromPdfFallback(arrayBuffer, fileName);
  }
}

/**
 * Creates a PDFDocumentData structure from raw text (for pasted text or sample books).
 */
export function createDocumentFromText(title: string, text: string): PDFDocumentData {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const pages: DocumentPage[] = [];
  let totalSentences = 0;

  // Group paragraphs into ~200-250 word pages for easy reading
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
    const fullText = currentPageText.join('\n\n') || text || 'Contenido del documento';
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
