import React, { useEffect, useRef } from 'react';
import { PDFDocumentData, BookHistoryItem } from '../types';
import { SAMPLE_BOOKS } from '../data/sampleBooks';
import { sounds } from '../utils/soundEffects';
import {
  FileText,
  Upload,
  BookOpen,
  Bookmark as BookmarkIcon,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  Play,
  CheckCircle2,
  FileCheck,
  Maximize2,
} from 'lucide-react';

interface DocumentReaderProps {
  document: PDFDocumentData | null;
  currentPageIndex: number;
  currentSentenceIndex: number;
  isPlaying: boolean;
  onSentenceClick: (sentenceIndex: number) => void;
  onBookmarkSentence: (sentenceIndex: number) => void;
  bookmarkedSentencesOnPage: Set<number>;
  onSelectSampleBook: (sampleId: string) => void;
  onUploadClick: () => void;
  isDragging: boolean;
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
  currentPageIndex,
  currentSentenceIndex,
  isPlaying,
  onSentenceClick,
  onBookmarkSentence,
  bookmarkedSentencesOnPage,
  onSelectSampleBook,
  onUploadClick,
  isDragging,
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
    if (activeSentenceRef.current && isPlaying) {
      const el = activeSentenceRef.current;
      const rect = el.getBoundingClientRect();
      const viewportHeight =
        window.innerHeight || window.document.documentElement.clientHeight;
      
      // Margen de confort: si está visible holgadamente en el tercio central, NO recalcular scroll
      const isComfortablyVisible = rect.top >= 90 && rect.bottom <= viewportHeight - 140;

      if (!isComfortablyVisible) {
        // En móviles o pantallas táctiles, 'auto' previene el jank y sobrecarga de animación del WebView
        const isMobile = window.innerWidth <= 768;
        el.scrollIntoView({
          behavior: isMobile ? 'auto' : 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }
    }
  }, [currentSentenceIndex, currentPageIndex, isPlaying]);

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

  if (!document) {
    return (
      <div
        id="empty-state-welcome"
        className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-14 flex flex-col items-center text-center animate-fadeIn"
      >
        {/* Vintage Radio & Library Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium mb-4 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Voz viva en cualquier dispositivo · Sin lags</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-bold font-title text-neutral-100 tracking-wide max-w-xl mb-3">
          Tu Biblioteca en Voz Alta con{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400">
            LectorZews
          </span>
        </h2>

        <p className="text-sm sm:text-base text-neutral-300 max-w-lg mb-8 font-serif-elegant">
          Arrastra o carga cualquier archivo en formato PDF. Disfruta de voz femenina y voz masculina
          optimizadas en español nativo, con marcadores y temporizador de reposo.
        </p>

        {/* Big Drag & Drop or Upload Trigger */}
        <div
          id="dropzone-welcome"
          onClick={() => {
            sounds.playClick(600);
            onUploadClick();
          }}
          className={`w-full max-w-lg p-8 sm:p-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer backdrop-blur-md flex flex-col items-center justify-center group ${
            isDragging
              ? 'border-amber-400 bg-amber-500/20 scale-102'
              : 'border-amber-500/30 hover:border-amber-400/60 bg-neutral-950/60 hover:bg-neutral-900/80 shadow-xl'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-900/30 border border-amber-500/40 flex items-center justify-center text-amber-300 mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-7 h-7" />
          </div>
          <span className="text-base sm:text-lg font-semibold text-neutral-100 mb-1">
            Seleccionar archivo PDF
          </span>
          <p className="text-xs text-neutral-400">
            o arrastra tu documento aquí desde tu computadora o teléfono
          </p>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-amber-400/80 font-mono">
            <span>• Compatible con Android e iOS</span>
            <span>• PDF & TXT</span>
          </div>
        </div>

        {/* Recently Played Books / History Quick Resume */}
        {history.length > 0 && (
          <div className="w-full max-w-3xl mt-8 text-left">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-400 font-semibold">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Libros reproducidos recientemente (Historial):</span>
              </div>
              {onOpenHistory && (
                <button
                  id="btn-reader-view-all-history"
                  onClick={onOpenHistory}
                  className="text-xs text-amber-400/90 hover:text-amber-300 underline underline-offset-2 transition"
                >
                  Ver todo ({history.length})
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {history.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  id={`recent-history-card-${item.id}`}
                  onClick={() => {
                    sounds.playDocumentLoaded();
                    if (onResumeBook) onResumeBook(item);
                  }}
                  className="p-3.5 rounded-xl cursor-pointer transition-all active:scale-98 flex items-center justify-between gap-3 group backdrop-blur-md border bg-neutral-950/70 hover:bg-neutral-900/90 border-amber-500/25 hover:border-amber-500/50 shadow-md"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Pág. {item.lastPageIndex + 1}/{item.totalPages} ({Math.round(item.progressPercent)}%)
                      </span>
                    </div>
                    <h3 className="font-title text-sm font-bold text-neutral-100 group-hover:text-amber-200 transition truncate">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 truncate">
                      Frase {item.lastSentenceIndex + 1}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-amber-500/15 group-hover:bg-amber-500 group-hover:text-neutral-950 flex items-center justify-center text-amber-400 transition shrink-0">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Sample Library */}
        <div className="w-full max-w-3xl mt-10 text-left">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-400 font-semibold">
              <BookOpen className="w-4 h-4" />
              <span>O prueba con una obra clásica de la biblioteca:</span>
            </div>
            <span className="text-xs text-neutral-400">Listo para escuchar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SAMPLE_BOOKS.map((book) => (
              <div
                key={book.id}
                id={`sample-book-${book.id}`}
                onClick={() => {
                  sounds.playDocumentLoaded();
                  onSelectSampleBook(book.id);
                }}
                className={`p-4 rounded-xl cursor-pointer transition-all active:scale-98 flex items-center justify-between gap-3 group backdrop-blur-md border ${
                  book.id === 'corazon_delator'
                    ? 'bg-gradient-to-r from-red-950/40 to-neutral-950/80 border-red-800/40 hover:border-red-500/60 shadow-lg shadow-red-950/20'
                    : 'bg-neutral-950/60 hover:bg-neutral-900/90 border-amber-500/15 hover:border-amber-500/40'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-mono text-[10px] ${
                        book.id === 'corazon_delator'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      {book.id === 'corazon_delator' ? 'TERROR' : book.language.toUpperCase()}
                    </span>
                    <span
                      className={`text-xs truncate ${
                        book.id === 'corazon_delator' ? 'text-red-300/80 font-medium' : 'text-neutral-400'
                      }`}
                    >
                      {book.genre}
                    </span>
                  </div>
                  <h4
                    className={`text-sm font-bold transition-colors truncate ${
                      book.id === 'corazon_delator'
                        ? 'text-red-100 group-hover:text-red-300'
                        : 'text-neutral-100 group-hover:text-amber-300'
                    }`}
                  >
                    {book.title}
                  </h4>
                  <p className="text-xs text-neutral-400 truncate">{book.author}</p>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    book.id === 'corazon_delator'
                      ? 'bg-red-500/20 text-red-400 group-hover:bg-red-500/30'
                      : 'bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400'
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentPage = document.pages[currentPageIndex] || {
    pageNumber: currentPageIndex + 1,
    text: '',
    sentences: [],
  };

  return (
    <div
      ref={readerContainerRef}
      id="document-reader-view"
      className={`relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 transition-all duration-300 ${
        isImmersiveMode ? 'pt-6 sm:pt-8 pb-16' : 'pt-4 pb-48 sm:pb-52'
      }`}
    >
      {/* Document Info Header Bar - Hidden in Immersive Mode for 100% Text Focus */}
      {!isImmersiveMode && (
        <div className="mb-4 p-3 sm:p-4 rounded-2xl bg-neutral-950/70 border border-amber-500/20 backdrop-blur-md flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-neutral-100 truncate font-serif-elegant">
                {document.title}
              </h2>
              <p className="text-[11px] text-neutral-400 truncate">
                {document.totalPages} páginas en total · {document.fileName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden xs:inline-block px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-xs font-semibold">
              Página {currentPage.pageNumber} de {document.totalPages}
            </span>

            {/* Immersive Mode Trigger */}
            {onToggleImmersiveMode && (
              <button
                id="btn-reader-immersive"
                onClick={() => {
                  sounds.playClick(850);
                  onToggleImmersiveMode();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/80 text-neutral-200 hover:text-amber-300 text-xs font-semibold shadow-sm transition active:scale-95"
                title="Modo Inmersivo: Ocultar controles para enfoque total de lectura"
              >
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Modo Inmersivo</span>
              </button>
            )}

            {onReturnToMenu && (
              <button
                id="btn-reader-back-menu"
                onClick={() => {
                  sounds.playClick(500);
                  onReturnToMenu();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold shadow-sm transition active:scale-95"
                title="Volver a la biblioteca principal"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al Menú</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reader Book Page Container */}
      <div
        id="book-page-canvas"
        className={`p-6 sm:p-10 rounded-2xl bg-neutral-950/80 border backdrop-blur-md shadow-2xl transition-all ${
          isImmersiveMode
            ? 'border-amber-500/30 ring-1 ring-amber-500/20 sm:p-12'
            : 'border-amber-500/20'
        }`}
      >
        <div className="border-b border-neutral-800/80 pb-3 mb-6 flex items-center justify-between text-xs text-neutral-400">
          <span className="font-serif-elegant italic">
            {isImmersiveMode
              ? `Página ${currentPage.pageNumber} de ${document.totalPages} · Modo Inmersivo activo`
              : 'Haz clic en cualquier frase para comenzar a escuchar desde ahí'}
          </span>
          <span className="font-mono text-[11px] text-amber-400/80">
            {currentPage.sentences.length} frases en esta página
          </span>
        </div>

        {/* Sentences with Interactive Highlight and Direct Click */}
        <div className={`space-y-1 font-serif-elegant ${getFontSizeClass()} text-neutral-200`}>
          {currentPage.sentences.map((sentence, sIdx) => {
            const isCurrent = sIdx === currentSentenceIndex;
            const isBookmarked = bookmarkedSentencesOnPage.has(sIdx);

            return (
              <span
                key={sIdx}
                ref={isCurrent ? activeSentenceRef : null}
                id={`sentence-${currentPageIndex}-${sIdx}`}
                onClick={() => {
                  sounds.playTick();
                  onSentenceClick(sIdx);
                }}
                className={`inline-block mr-1.5 px-1.5 py-0.5 rounded-lg cursor-pointer transition-colors duration-150 select-text ${
                  isCurrent
                    ? 'bg-amber-400/25 text-amber-100 ring-1 ring-amber-400/60 shadow-sm shadow-amber-500/20 font-medium'
                    : 'hover:bg-neutral-800/60 hover:text-white'
                } ${isBookmarked ? 'border-b border-amber-400' : ''}`}
                title="Pulsa para escuchar esta frase"
              >
                {isBookmarked && (
                  <BookmarkIcon className="inline w-3 h-3 text-amber-400 mr-1 fill-amber-400/40 align-middle" />
                )}
                {sentence}{' '}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
