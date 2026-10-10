import React, { useEffect, useRef } from 'react';
import { PDFDocumentData, BookHistoryItem } from '../types';
import { SAMPLE_BOOKS } from '../data/sampleBooks';
import { sounds } from '../utils/soundEffects';
import {
  FileText,
  Upload,
  BookOpen,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  Play,
  Maximize2,
} from 'lucide-react';

interface DocumentReaderProps {
  document: PDFDocumentData | null;
  currentView?: 'library' | 'reader';
  currentPageIndex: number;
  currentSentenceIndex: number;
  isPlaying: boolean;
  onSentenceClick: (sentenceIndex: number) => void;
  onSelectSampleBook: (sampleId: string) => void;
  onUploadClick: () => void;
  isDragging?: boolean;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  onReturnToMenu?: () => void;
  history?: BookHistoryItem[];
  onResumeBook?: (item: BookHistoryItem) => void;
  onOpenHistory?: () => void;
  isImmersiveMode?: boolean;
  onToggleImmersiveMode?: () => void;
}

export const DocumentReader: React.FC<DocumentReaderProps> = ({
  document,
  currentView = 'library',
  currentPageIndex,
  currentSentenceIndex,
  isPlaying,
  onSentenceClick,
  onSelectSampleBook,
  onUploadClick,
  fontSize,
  onReturnToMenu,
  history = [],
  onResumeBook,
  onOpenHistory,
  isImmersiveMode = false,
  onToggleImmersiveMode,
}) => {
  const activeSentenceRef = useRef<HTMLSpanElement>(null);
  const readerContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active sentence smoothly only when it nears or leaves viewport boundaries
  useEffect(() => {
    if (activeSentenceRef.current && isPlaying && currentView === 'reader') {
      const el = activeSentenceRef.current;
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight || window.document.documentElement.clientHeight;

      const isComfortablyVisible = rect.top >= 90 && rect.bottom <= viewportHeight - 140;

      if (!isComfortablyVisible) {
        el.scrollIntoView({
          behavior: 'auto',
          block: 'center',
          inline: 'nearest',
        });
      }
    }
  }, [currentSentenceIndex, currentPageIndex, isPlaying, currentView]);

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-sm sm:text-base leading-relaxed';
      case 'lg':
        return 'text-lg sm:text-xl leading-relaxed';
      case 'xl':
        return 'text-xl sm:text-2xl leading-loose';
      case 'md':
      default:
        return 'text-base sm:text-lg leading-relaxed';
    }
  };

  // Android Native Mobile Home Screen (Library dashboard)
  if (!document || currentView === 'library') {
    return (
      <div
        id="empty-state-welcome"
        className="relative z-10 w-full px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center text-center animate-fadeIn select-none pb-36"
      >
        {/* Android App Header Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs font-semibold mb-2 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Lector de Libros y Documentos PDF</span>
        </div>

        {/* Ambient Scene Indicator */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/60 border border-amber-500/20 text-amber-200/90 text-[11px] mb-3 backdrop-blur-md shadow-sm">
          <span>🎙️ Gran Biblioteca Zews • Narración en voz alta con micrófono</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold font-title text-neutral-100 tracking-wide max-w-xl mb-2">
          Tu Biblioteca en Voz Alta con{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400">
            LectorZews
          </span>
        </h2>

        <p className="text-xs sm:text-sm text-neutral-300 max-w-md mb-6 font-serif-elegant leading-relaxed">
          Toca para abrir cualquier libro o documento PDF guardado en tu teléfono. Disfruta de narración en español en segundo plano, temporizador de reposo y música instrumental.
        </p>

        {/* Primary Android Mobile Action Card: Abrir PDF */}
        <div
          id="dropzone-welcome"
          onClick={() => {
            sounds.playClick(600);
            onUploadClick();
          }}
          className="w-full max-w-md p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 via-neutral-900/70 to-neutral-950/80 border border-amber-500/20 active:scale-[0.98] transition-all cursor-pointer shadow-xl backdrop-blur-xl flex flex-col items-center justify-center group"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-950/40 mb-3 group-active:scale-95 transition-transform">
            <Upload className="w-7 h-7 stroke-[2.5]" />
          </div>
          <span className="text-base sm:text-lg font-bold text-neutral-100 mb-1">
            Abrir libro o PDF
          </span>
          <p className="text-xs text-neutral-400 text-center">
            Toca aquí para seleccionar un archivo PDF de tu celular
          </p>
        </div>

        {/* Recently Played Books / Historial Móvil */}
        {history.length > 0 && (
          <div className="w-full max-w-md sm:max-w-2xl mt-8 text-left">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-400 font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Libros recientes</span>
              </div>
              {onOpenHistory && (
                <button
                  id="btn-reader-view-all-history"
                  onClick={onOpenHistory}
                  className="text-xs text-amber-400/90 active:text-amber-300 underline underline-offset-2 transition"
                >
                  Ver todo ({history.length})
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {history.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  id={`recent-history-card-${item.id}`}
                  onClick={() => {
                    sounds.playDocumentLoaded();
                    if (onResumeBook) onResumeBook(item);
                  }}
                  className="p-3.5 rounded-xl cursor-pointer active:scale-[0.98] transition-all flex items-center justify-between gap-3 bg-neutral-900/80 active:bg-neutral-800 shadow-md backdrop-blur-md"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-amber-500/20 text-amber-300 font-semibold">
                        Pág. {item.lastPageIndex + 1}/{item.totalPages} ({Math.round(item.progressPercent)}%)
                      </span>
                    </div>
                    <h3 className="font-title text-xs sm:text-sm font-bold text-neutral-100 truncate">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 truncate">
                      Frase {item.lastSentenceIndex + 1}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 shadow-sm">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Sample Library / Clásicos para escuchar */}
        <div className="w-full max-w-md sm:max-w-2xl mt-8 mb-6 text-left">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-400 font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Obras clásicas de la biblioteca</span>
            </div>
            <span className="text-[11px] text-neutral-400">Listas para reproducir</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SAMPLE_BOOKS.map((book) => (
              <div
                key={book.id}
                id={`sample-book-${book.id}`}
                onClick={() => {
                  sounds.playDocumentLoaded();
                  onSelectSampleBook(book.id);
                }}
                className={`p-3.5 rounded-xl cursor-pointer active:scale-[0.98] transition-all flex items-center justify-between gap-3 bg-neutral-900/80 active:bg-neutral-800 shadow-md backdrop-blur-md ${
                  book.id === 'corazon_delator'
                    ? 'bg-gradient-to-r from-red-950/50 to-neutral-900/90'
                    : ''
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-semibold ${
                        book.id === 'corazon_delator'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {book.id === 'corazon_delator' ? 'TERROR' : book.language.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-neutral-400 truncate">
                      {book.genre}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-100 truncate">
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 truncate">{book.author}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Active Document Reader (100% Android Edge-to-Edge)
  const currentPage = document.pages[currentPageIndex] || {
    pageNumber: currentPageIndex + 1,
    text: '',
    sentences: [],
  };

  return (
    <div
      ref={readerContainerRef}
      id="document-reader-view"
      className="relative z-10 w-full min-h-full px-4 sm:px-6 pt-2 pb-44 sm:pb-48 transition-all duration-200"
    >
      {/* Native Android Mobile Reading Sub-Bar (Hidden in Immersive Mode) */}
      {!isImmersiveMode && (
        <div className="mb-3 py-2 px-3 rounded-xl bg-neutral-900/70 backdrop-blur-md flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-neutral-100 truncate">
                {document.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold">
              Pág. {currentPage.pageNumber} / {document.totalPages}
            </span>

            {onToggleImmersiveMode && (
              <button
                id="btn-reader-immersive"
                onClick={() => {
                  sounds.playClick(850);
                  onToggleImmersiveMode();
                }}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-200 active:scale-95 transition"
                title="Modo pantalla completa de lectura"
              >
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}

            {onReturnToMenu && (
              <button
                id="btn-reader-back-menu"
                onClick={() => {
                  sounds.playClick(500);
                  onReturnToMenu();
                }}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-200 active:scale-95 transition"
                title="Volver a la biblioteca"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-300" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Edge-to-Edge Pure Android Reading Canvas (NO BORDERS, NO MARCADORES) */}
      <div
        id="book-page-canvas"
        className="w-full py-2 transition-all select-text"
      >
        <div className="pb-2 mb-3 flex items-center justify-between text-[11px] text-neutral-400/90 font-serif-elegant">
          <span className="italic">
            {isImmersiveMode
              ? `Página ${currentPage.pageNumber} de ${document.totalPages}`
              : 'Toca cualquier frase para escuchar desde allí:'}
          </span>
          <span className="font-mono text-amber-400/80">
            {currentPage.sentences.length} frases
          </span>
        </div>

        {/* Sentences with Natural Fluid Highlighting */}
        <div className={`font-serif-elegant ${getFontSizeClass()} text-neutral-100 leading-relaxed space-y-1`}>
          {currentPage.sentences.map((sentence, sIdx) => {
            const isCurrent = sIdx === currentSentenceIndex;

            return (
              <span
                key={sIdx}
                ref={isCurrent ? activeSentenceRef : null}
                id={`sentence-${currentPageIndex}-${sIdx}`}
                onClick={() => {
                  sounds.playTick();
                  onSentenceClick(sIdx);
                }}
                className={`inline-block mr-1.5 px-1 py-0.5 rounded cursor-pointer transition-colors duration-150 ${
                  isCurrent
                    ? 'bg-amber-400/30 text-amber-100 font-semibold shadow-sm'
                    : 'active:bg-neutral-800/80 hover:text-white'
                }`}
              >
                {sentence}{' '}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
