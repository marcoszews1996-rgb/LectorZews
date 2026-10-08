import React from 'react';
import { sounds } from '../utils/soundEffects';
import { SpeedControls } from './SpeedControls';
import { SleepTimerState, AmbientTrackId } from '../types';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Bookmark as BookmarkIcon,
  BookmarkCheck,
  RotateCcw,
  Sparkles,
  Moon,
  Activity,
  ArrowLeft,
  Clock,
  Maximize2,
  Headphones,
  Music,
} from 'lucide-react';

interface AudioPlayerBarProps {
  isPlaying: boolean;
  isPaused: boolean;
  onPlayPause: () => void;
  onPrevSentence: () => void;
  onNextSentence: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onRestartPage: () => void;
  currentPage: number;
  totalPages: number;
  currentSentence: number;
  totalSentencesInPage: number;
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
  onAddBookmark: () => void;
  isCurrentSentenceBookmarked: boolean;
  activeSentenceText: string;
  sleepTimerState?: SleepTimerState;
  onOpenSleepTimer?: () => void;
  smartRhythm?: boolean;
  onToggleSmartRhythm?: () => void;
  onReturnToMenu?: () => void;
  onOpenHistory?: () => void;
  isImmersiveMode?: boolean;
  onToggleImmersiveMode?: () => void;
  onOpenBackgroundAudio?: () => void;
  onOpenVoicesModal?: () => void;
  ambientTrack?: AmbientTrackId;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  isPlaying,
  isPaused,
  onPlayPause,
  onPrevSentence,
  onNextSentence,
  onPrevPage,
  onNextPage,
  onRestartPage,
  currentPage,
  totalPages,
  currentSentence,
  totalSentencesInPage,
  currentSpeed,
  onSpeedChange,
  onAddBookmark,
  isCurrentSentenceBookmarked,
  activeSentenceText,
  sleepTimerState,
  onOpenSleepTimer,
  smartRhythm = true,
  onToggleSmartRhythm,
  onReturnToMenu,
  onOpenHistory,
  isImmersiveMode = false,
  onToggleImmersiveMode,
  onOpenBackgroundAudio,
  onOpenVoicesModal,
  ambientTrack = 'none',
}) => {
  const sentenceProgress =
    totalSentencesInPage > 0
      ? Math.min(100, Math.round(((currentSentence + 1) / totalSentencesInPage) * 100))
      : 0;

  const formatTimerCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="audio-player-dock"
      className="fixed bottom-0 left-0 right-0 z-30 px-3 sm:px-6 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-neutral-950/95 backdrop-blur-2xl text-neutral-100 shadow-2xl transition-all select-none"
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-2">
        {/* Subtle reading ticker line */}
        {activeSentenceText && (
          <div className="flex items-center justify-between text-xs text-neutral-400 gap-3 px-1">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <p className="truncate italic font-serif-elegant text-amber-200/90 text-[11px] sm:text-xs">
                "{activeSentenceText}"
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onOpenBackgroundAudio && (
                <button
                  id="btn-ticker-background-audio"
                  onClick={() => {
                    sounds.playClick(650);
                    onOpenBackgroundAudio();
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium transition cursor-pointer active:scale-95"
                  title="Modo Segundo Plano: Puedes bloquear la pantalla o usar otras aplicaciones"
                >
                  <Headphones className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="hidden xs:inline">Segundo Plano</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </button>
              )}
              <span className="font-mono text-[10px] text-neutral-500">
                Frase {currentSentence + 1}/{Math.max(1, totalSentencesInPage)}
              </span>
            </div>
          </div>
        )}

        {/* Sentence Progress Line */}
        <div className="w-full h-1 rounded-full bg-neutral-800/80 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 transition-all duration-300 rounded-full"
            style={{ width: `${sentenceProgress}%` }}
          />
        </div>

        {/* Main Controls Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 pt-1">
          {/* Left: Return to Menu & Page Navigation */}
          <div className="flex items-center gap-1 sm:gap-2">
            {onReturnToMenu && (
              <button
                id="btn-player-back-menu"
                onClick={() => {
                  sounds.playClick(500);
                  onReturnToMenu();
                }}
                className="p-1.5 sm:px-2.5 sm:py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
                title="Volver al menú de libros y biblioteca"
              >
                <ArrowLeft className="w-4 h-4 text-amber-300" />
                <span className="hidden md:inline">Menú</span>
              </button>
            )}

            <button
              id="btn-prev-page"
              onClick={() => {
                sounds.playSkip(false);
                onPrevPage();
              }}
              disabled={currentPage <= 1}
              className="p-1.5 sm:p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 disabled:opacity-40 disabled:hover:bg-neutral-900/80 transition-all active:scale-95"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-2 sm:px-3 py-1 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs font-mono text-amber-300/90 text-center select-none shrink-0">
              <span>{currentPage}</span>
              <span className="text-neutral-500 mx-1">/</span>
              <span className="text-neutral-400">{totalPages || 1}</span>
            </div>

            <button
              id="btn-next-page"
              onClick={() => {
                sounds.playSkip(true);
                onNextPage();
              }}
              disabled={currentPage >= totalPages}
              className="p-1.5 sm:p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 disabled:opacity-40 disabled:hover:bg-neutral-900/80 transition-all active:scale-95"
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Center: Minimalist Rounded Play/Pause and Skip buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Previous Sentence */}
            <button
              id="btn-prev-sentence"
              onClick={() => {
                sounds.playTick();
                onPrevSentence();
              }}
              className="p-2 sm:p-2.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-amber-300 transition-all active:scale-95"
              title="Retroceder a la frase anterior"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play / Pause - Minimalist, Rounded, Tactile */}
            <button
              id="btn-play-pause-main"
              onClick={() => {
                if (isPlaying) {
                  sounds.playPause();
                } else {
                  sounds.playPlay();
                }
                onPlayPause();
              }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 text-neutral-950 font-bold flex items-center justify-center shadow-lg shadow-amber-600/30 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
              title={isPlaying ? 'Pausar lectura' : 'Iniciar lectura en voz alta'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-neutral-950" />
              ) : (
                <Play className="w-6 h-6 fill-neutral-950 ml-0.5" />
              )}
            </button>

            {/* Next Sentence */}
            <button
              id="btn-next-sentence"
              onClick={() => {
                sounds.playTick();
                onNextSentence();
              }}
              className="p-2 sm:p-2.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-amber-300 transition-all active:scale-95"
              title="Avanzar a la siguiente frase"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Speed Controls & Instant Bookmark Button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden sm:block">
              <SpeedControls currentSpeed={currentSpeed} onSpeedChange={onSpeedChange} compact />
            </div>

            {/* Quick Speed Button for small screens */}
            <div className="sm:hidden">
              <button
                id="btn-speed-mobile-toggle"
                onClick={() => {
                  sounds.playSpeedChange();
                  const nextSpeed =
                    currentSpeed === 1.0 ? 1.25 : currentSpeed === 1.25 ? 1.5 : currentSpeed === 1.5 ? 2.0 : currentSpeed === 2.0 ? 0.75 : 1.0;
                  onSpeedChange(nextSpeed);
                }}
                className="px-2 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono font-bold text-amber-400"
                title="Cambiar velocidad"
              >
                {currentSpeed}x
              </button>
            </div>

            {/* Smart Rhythm (Ritmo Inteligente) Button */}
            {onToggleSmartRhythm && (
              <button
                id="btn-player-smart-rhythm"
                onClick={() => {
                  sounds.playTick();
                  onToggleSmartRhythm();
                }}
                className={`p-2 sm:px-2.5 sm:py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
                  smartRhythm
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/10'
                    : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
                title={
                  smartRhythm
                    ? 'Ritmo Inteligente activo: velocidad y pausas moduladas por comas y puntuación'
                    : 'Ritmo Inteligente desactivado: velocidad uniforme y fija'
                }
              >
                <Activity
                  className={`w-4 h-4 ${
                    smartRhythm ? 'text-amber-400 animate-pulse' : 'text-neutral-500'
                  }`}
                />
                <span className="hidden xl:inline text-[11px] font-medium">
                  {smartRhythm ? 'Ritmo Vivo' : 'Ritmo Fijo'}
                </span>
              </button>
            )}

            {/* Sleep Timer Button */}
            {onOpenSleepTimer && (
              <button
                id="btn-player-sleep-timer"
                onClick={() => {
                  sounds.playTick();
                  onOpenSleepTimer();
                }}
                className={`p-2 sm:px-2.5 sm:py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
                  sleepTimerState?.isActive
                    ? 'bg-indigo-950/80 border-indigo-500/60 text-indigo-200 shadow-sm shadow-indigo-950/60'
                    : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-indigo-300'
                }`}
                title={
                  sleepTimerState?.isActive
                    ? `Temporizador de apagado activo: ${
                        sleepTimerState.mode === 'end_of_page'
                          ? 'Fin de página'
                          : formatTimerCountdown(sleepTimerState.remainingSeconds)
                      }`
                    : 'Temporizador de apagado para dormir'
                }
              >
                <Moon
                  className={`w-4 h-4 ${
                    sleepTimerState?.isActive
                      ? 'text-indigo-400 fill-indigo-400/40 animate-pulse'
                      : 'text-neutral-400'
                  }`}
                />
                <span className="hidden sm:inline font-mono">
                  {sleepTimerState?.isActive
                    ? sleepTimerState.mode === 'end_of_page'
                      ? 'Fin pág.'
                      : formatTimerCountdown(sleepTimerState.remainingSeconds)
                    : 'Reposo'}
                </span>
              </button>
            )}

            {/* History Clock Button */}
            {onOpenHistory && (
              <button
                id="btn-player-history"
                onClick={() => {
                  sounds.playClick(650);
                  onOpenHistory();
                }}
                className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
                title="Ver historial de libros reproducidos (Reloj)"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="hidden xl:inline text-[11px]">Historial</span>
              </button>
            )}

            {/* Ambient Instrumental & Voices Button */}
            {onOpenVoicesModal && (
              <button
                id="btn-player-ambient-voices"
                onClick={() => {
                  sounds.playClick(600);
                  onOpenVoicesModal();
                }}
                className={`p-2 sm:px-2.5 sm:py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
                  ambientTrack !== 'none'
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-950/60'
                    : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-emerald-300'
                }`}
                title={
                  ambientTrack !== 'none'
                    ? `Fondo: ${ambientTrack === 'biblioteca' ? 'Biblioteca Acústica' : 'Lluvia Serena'}. Toca para cambiar voz o instrumental.`
                    : 'Añadir música ambiental de fondo o cambiar voz'
                }
              >
                <Music
                  className={`w-4 h-4 ${
                    ambientTrack !== 'none'
                      ? 'text-emerald-400 animate-pulse'
                      : 'text-neutral-400'
                  }`}
                />
                <span className="hidden xl:inline text-[11px]">
                  {ambientTrack === 'biblioteca'
                    ? 'Biblioteca'
                    : ambientTrack === 'lluvia'
                    ? 'Lluvia'
                    : 'Fondo'}
                </span>
              </button>
            )}

            {/* Bookmark Current Sentence Button */}
            <button
              id="btn-quick-bookmark"
              onClick={() => {
                sounds.playPlay();
                onAddBookmark();
              }}
              className={`p-2 sm:px-2.5 sm:py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
                isCurrentSentenceBookmarked
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm shadow-amber-500/10'
                  : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-amber-300'
              }`}
              title={
                isCurrentSentenceBookmarked
                  ? 'Marcador guardado en esta página'
                  : 'Añadir marcador a este punto'
              }
            >
              {isCurrentSentenceBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-amber-400 fill-amber-400/30" />
              ) : (
                <BookmarkIcon className="w-4 h-4" />
              )}
              <span className="hidden md:inline">
                {isCurrentSentenceBookmarked ? 'Marcado' : 'Marcar'}
              </span>
            </button>

            {/* Modo Inmersivo Button */}
            {onToggleImmersiveMode && (
              <button
                id="btn-player-immersive"
                onClick={() => {
                  sounds.playClick(850);
                  onToggleImmersiveMode();
                }}
                className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
                title="Modo Inmersivo (ocultar controles para enfoque total de lectura)"
              >
                <Maximize2 className="w-4 h-4 text-amber-400" />
                <span className="hidden xl:inline text-[11px]">Inmersivo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
