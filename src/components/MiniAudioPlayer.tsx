import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Maximize2, X, Headphones } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface MiniAudioPlayerProps {
  title: string;
  currentPage: number;
  totalPages: number;
  currentSentence: number;
  totalSentencesInPage: number;
  activeSentenceText: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevSentence: () => void;
  onNextSentence: () => void;
  onExpand: () => void;
  onClose: () => void;
}

export const MiniAudioPlayer: React.FC<MiniAudioPlayerProps> = ({
  title,
  currentPage,
  totalPages,
  currentSentence,
  totalSentencesInPage,
  activeSentenceText,
  isPlaying,
  onPlayPause,
  onPrevSentence,
  onNextSentence,
  onExpand,
  onClose,
}) => {
  const sentenceProgress =
    totalSentencesInPage > 0
      ? Math.min(100, Math.round(((currentSentence + 1) / totalSentencesInPage) * 100))
      : 0;

  return (
    <div
      id="mini-audio-player-dock"
      className="fixed bottom-0 left-0 right-0 z-40 px-3 sm:px-6 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-neutral-950/95 backdrop-blur-2xl border-t border-amber-500/20 text-neutral-100 shadow-2xl transition-all select-none animate-fadeIn"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-1.5">
        {/* Mini progress bar */}
        <div className="w-full h-1 rounded-full bg-neutral-800/80 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 rounded-full"
            style={{ width: `${sentenceProgress}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-0.5">
          {/* Left: Book Info & Touch to Expand into Reader */}
          <div
            onClick={() => {
              sounds.playClick(600);
              onExpand();
            }}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer active:opacity-80 transition group"
            title="Toca para volver a la lectura completa"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-950/70 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0 shadow-md">
              <Headphones className="w-5 h-5" />
              {isPlaying && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse border-2 border-neutral-950" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-neutral-100 truncate group-hover:text-amber-300 transition">
                  {title}
                </h4>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono shrink-0">
                  Pág. {currentPage}/{totalPages || 1}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 truncate font-serif-elegant italic">
                {activeSentenceText ? `"${activeSentenceText}"` : `Frase ${currentSentence + 1} de ${totalSentencesInPage}`}
              </p>
            </div>
          </div>

          {/* Right Controls: SkipBack, Play/Pause, SkipForward, Expand, Close */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Retroceder frase */}
            <button
              id="btn-mini-prev"
              onClick={(e) => {
                e.stopPropagation();
                sounds.playTick();
                onPrevSentence();
              }}
              className="p-2 rounded-full bg-neutral-900/90 active:bg-neutral-800 text-neutral-300 hover:text-amber-300 transition active:scale-95"
              title="Retroceder audio"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play / Pausa */}
            <button
              id="btn-mini-play-pause"
              onClick={(e) => {
                e.stopPropagation();
                if (isPlaying) {
                  sounds.playPause();
                } else {
                  sounds.playPlay();
                }
                onPlayPause();
              }}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-500/30 active:scale-95 transition"
              title={isPlaying ? 'Pausar audio' : 'Reanudar lectura en voz alta'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-neutral-950" />
              ) : (
                <Play className="w-5 h-5 fill-neutral-950 ml-0.5" />
              )}
            </button>

            {/* Adelantar frase */}
            <button
              id="btn-mini-next"
              onClick={(e) => {
                e.stopPropagation();
                sounds.playTick();
                onNextSentence();
              }}
              className="p-2 rounded-full bg-neutral-900/90 active:bg-neutral-800 text-neutral-300 hover:text-amber-300 transition active:scale-95"
              title="Adelantar audio"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Expandir a lectura completa */}
            <button
              id="btn-mini-expand"
              onClick={(e) => {
                e.stopPropagation();
                sounds.playClick(600);
                onExpand();
              }}
              className="p-2 rounded-full bg-neutral-900/90 active:bg-neutral-800 text-neutral-400 hover:text-amber-300 transition active:scale-95"
              title="Ver texto completo"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Detener y cerrar libro */}
            <button
              id="btn-mini-close"
              onClick={(e) => {
                e.stopPropagation();
                sounds.playClick(400);
                onClose();
              }}
              className="p-1.5 rounded-full text-neutral-500 hover:text-neutral-300 active:bg-neutral-800 transition active:scale-95"
              title="Cerrar libro"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
