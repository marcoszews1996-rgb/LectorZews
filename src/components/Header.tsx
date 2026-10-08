import React, { useRef } from 'react';
import { ThemeMode, VoicePresetId, SleepTimerState, AmbientTrackId } from '../types';
import { sounds } from '../utils/soundEffects';
import {
  Bookmark as BookmarkIcon,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Sparkles,
  Upload,
  Headphones,
  Clock,
  ArrowLeft,
  Music,
} from 'lucide-react';

interface HeaderProps {
  appName: string;
  theme: ThemeMode;
  onCycleTheme: () => void;
  soundsEnabled: boolean;
  onToggleSounds: () => void;
  onOpenBookmarks: () => void;
  bookmarksCount: number;
  voicePreset: VoicePresetId;
  selectedVoiceURI?: string | null;
  ambientTrack?: AmbientTrackId;
  onOpenVoicesModal: () => void;
  currentLanguage?: string;
  onFileUpload: (file: File) => void;
  isLoadingFile: boolean;
  hasDocument: boolean;
  sleepTimerState?: SleepTimerState;
  onOpenSleepTimer?: () => void;
  onReturnToMenu?: () => void;
  onOpenHistory?: () => void;
  historyCount?: number;
  isImmersiveMode?: boolean;
  onToggleImmersiveMode?: () => void;
  onOpenBackgroundAudio?: () => void;
  isPlaying?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  appName,
  theme,
  onCycleTheme,
  soundsEnabled,
  onToggleSounds,
  onOpenBookmarks,
  bookmarksCount,
  voicePreset,
  selectedVoiceURI,
  ambientTrack,
  onOpenVoicesModal,
  onFileUpload,
  isLoadingFile,
  hasDocument,
  sleepTimerState,
  onOpenSleepTimer,
  onReturnToMenu,
  onOpenHistory,
  historyCount = 0,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sounds.playDocumentLoaded();
      onFileUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon className="w-4 h-4 text-amber-300" />;
    if (theme === 'light') return <Sun className="w-4 h-4 text-amber-500" />;
    return <Moon className="w-4 h-4 text-neutral-400" />;
  };

  return (
    <header
      id="main-app-header"
      className="relative z-30 w-full px-3 sm:px-5 pt-[calc(0.5rem+env(safe-area-inset-top,0px))] pb-2.5 flex items-center justify-between bg-neutral-950/90 backdrop-blur-xl transition-all select-none"
    >
      {/* Brand & Android Back Navigation */}
      <div className="flex items-center gap-2 sm:gap-3">
        {hasDocument && onReturnToMenu ? (
          <button
            id="btn-header-back-menu"
            onClick={() => {
              sounds.playClick(500);
              onReturnToMenu();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 text-amber-200 text-xs font-semibold transition shrink-0"
            title="Volver a la biblioteca"
          >
            <ArrowLeft className="w-4 h-4 text-amber-300" />
            <span>Biblioteca</span>
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-950/60 flex items-center justify-center text-amber-400 shadow-md shadow-amber-950/40">
              <Headphones className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h1
                id="app-brand-title"
                className="font-title text-base sm:text-lg font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-400 leading-tight"
              >
                {appName}
              </h1>
              <p className="text-[10px] text-amber-400/80 font-medium tracking-wide">
                Audiolibro & Lector PDF
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Controls (Material Android Actions) */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Hidden Android File Picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.text,application/pdf,application/x-pdf,text/plain,application/octet-stream,*/*"
          className="hidden"
          onChange={handleFileInputChange}
          id="hidden-file-input"
        />

        {/* Primary Action Button: Abrir PDF */}
        <button
          id="btn-upload-file"
          onClick={() => {
            sounds.playClick(600);
            fileInputRef.current?.click();
          }}
          disabled={isLoadingFile}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 active:from-amber-600 active:to-amber-700 text-neutral-950 text-xs font-bold shadow-md shadow-amber-950/30 transition active:scale-95 disabled:opacity-50"
          title="Abrir archivo PDF desde tu celular"
        >
          <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{isLoadingFile ? 'Cargando...' : 'Abrir PDF'}</span>
        </button>

        {/* Voices Menu Trigger */}
        <button
          id="btn-open-voices-modal"
          onClick={() => {
            sounds.playVoiceChange();
            onOpenVoicesModal();
          }}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-neutral-900/90 active:bg-neutral-800 text-neutral-200 text-xs font-medium transition active:scale-95"
          title="Voz e instrumental de fondo"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden xs:inline font-semibold text-amber-300 truncate max-w-[85px] sm:max-w-[110px]">
            {selectedVoiceURI ? 'Voz' : voicePreset === 'femenina' ? 'Femenina' : 'Masculina'}
          </span>
        </button>

        {/* Ambient Instrumental Indicator */}
        {ambientTrack && ambientTrack !== 'none' && (
          <button
            id="btn-header-ambient"
            onClick={() => {
              sounds.playClick(600);
              onOpenVoicesModal();
            }}
            className="flex items-center gap-1 px-2 py-2 rounded-xl bg-emerald-950/80 text-emerald-300 text-xs font-medium transition active:scale-95"
            title="Música instrumental activa"
          >
            <Music className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline text-[11px]">Música</span>
          </button>
        )}

        {/* Bookmarks Trigger */}
        <button
          id="btn-header-bookmarks"
          onClick={() => {
            sounds.playClick(700);
            onOpenBookmarks();
          }}
          className="relative p-2 sm:px-2.5 sm:py-2 rounded-xl bg-neutral-900/90 active:bg-neutral-800 text-neutral-200 text-xs font-medium transition active:scale-95"
          title="Marcadores guardados"
        >
          <BookmarkIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          {bookmarksCount > 0 && (
            <span
              id="header-bookmarks-badge"
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-neutral-950 font-bold text-[9px] flex items-center justify-center font-mono shadow-sm"
            >
              {bookmarksCount}
            </span>
          )}
        </button>

        {/* History Clock Trigger */}
        {onOpenHistory && (
          <button
            id="btn-header-history"
            onClick={() => {
              sounds.playClick(650);
              onOpenHistory();
            }}
            className="relative p-2 sm:px-2.5 sm:py-2 rounded-xl bg-neutral-900/90 active:bg-neutral-800 text-neutral-200 text-xs font-medium transition active:scale-95"
            title="Historial de lectura reciente"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            {historyCount > 0 && (
              <span
                id="header-history-badge"
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-neutral-950 font-bold text-[9px] flex items-center justify-center font-mono shadow-sm"
              >
                {historyCount}
              </span>
            )}
          </button>
        )}

        {/* Sleep Timer Trigger */}
        {onOpenSleepTimer && (
          <button
            id="btn-header-sleep-timer"
            onClick={() => {
              sounds.playTick();
              onOpenSleepTimer();
            }}
            className={`p-2 sm:px-2.5 sm:py-2 rounded-xl text-xs font-medium transition active:scale-95 ${
              sleepTimerState?.isActive
                ? 'bg-indigo-950/90 text-indigo-200 shadow-sm'
                : 'bg-neutral-900/90 active:bg-neutral-800 text-neutral-300'
            }`}
            title="Temporizador de apagado"
          >
            <Moon
              className={`w-3.5 h-3.5 shrink-0 ${
                sleepTimerState?.isActive
                  ? 'text-indigo-400 fill-indigo-400/40 animate-pulse'
                  : 'text-amber-400'
              }`}
            />
          </button>
        )}

        {/* Dark/Light Theme Toggle */}
        <button
          id="btn-toggle-theme"
          onClick={() => {
            sounds.playTick();
            onCycleTheme();
          }}
          className="p-2 rounded-xl bg-neutral-900/90 active:bg-neutral-800 text-neutral-300 text-xs transition active:scale-95"
          title="Alternar tema"
        >
          {getThemeIcon()}
        </button>

        {/* Tactile Sound Feedback Toggle */}
        <button
          id="btn-toggle-sounds"
          onClick={onToggleSounds}
          className="p-2 rounded-xl bg-neutral-900/90 active:bg-neutral-800 text-neutral-400 active:text-neutral-200 text-xs transition active:scale-95"
          title={soundsEnabled ? 'Sonidos activados' : 'Sonidos desactivados'}
        >
          {soundsEnabled ? (
            <Volume2 className="w-4 h-4 text-amber-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-neutral-500" />
          )}
        </button>
      </div>
    </header>
  );
};
