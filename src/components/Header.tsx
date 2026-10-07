import React, { useRef } from 'react';
import { ThemeMode, VoicePresetId, SleepTimerState, AmbientTrackId } from '../types';
import { VOICE_PRESETS } from '../utils/speechEngine';
import { sounds } from '../utils/soundEffects';
import {
  Bookmark as BookmarkIcon,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Sparkles,
  Upload,
  BookOpen,
  Headphones,
  Laptop,
  Clock,
  Smartphone,
  ArrowLeft,
  Globe,
  Maximize2,
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
  onOpenAndroidExport?: () => void;
  onReturnToMenu?: () => void;
  onOpenHistory?: () => void;
  historyCount?: number;
  isImmersiveMode?: boolean;
  onToggleImmersiveMode?: () => void;
  onOpenBackgroundAudio?: () => void;
  isPlaying?: boolean;
  isInstalled?: boolean;
  onOpenInstallModal?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
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
  currentLanguage = 'es',
  onFileUpload,
  isLoadingFile,
  hasDocument,
  sleepTimerState,
  onOpenSleepTimer,
  onOpenAndroidExport,
  onReturnToMenu,
  onOpenHistory,
  historyCount = 0,
  isImmersiveMode = false,
  onToggleImmersiveMode,
  onOpenBackgroundAudio,
  isPlaying = false,
  isInstalled = false,
  onOpenInstallModal,
  onToggleFullscreen,
  isFullscreen = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sounds.playDocumentLoaded();
      onFileUpload(file);
    }
    // reset input so same file can be reloaded if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon className="w-4 h-4 text-amber-300" />;
    if (theme === 'light') return <Sun className="w-4 h-4 text-amber-500" />;
    return <Laptop className="w-4 h-4 text-neutral-400" />;
  };

  const getThemeLabel = () => {
    if (theme === 'dark') return 'Oscuro';
    if (theme === 'light') return 'Claro';
    return 'Auto';
  };

  return (
    <header
      id="main-app-header"
      className="relative z-20 w-full px-3 sm:px-6 py-3 flex items-center justify-between border-b border-amber-900/20 bg-neutral-950/70 backdrop-blur-md transition-colors"
    >
      {/* Brand & Return to Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {hasDocument && onReturnToMenu && (
          <button
            id="btn-header-back-menu"
            onClick={() => {
              sounds.playClick(500);
              onReturnToMenu();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0"
            title="Volver a la biblioteca / Menú principal"
          >
            <ArrowLeft className="w-4 h-4 text-amber-300" />
            <span className="hidden xs:inline sm:inline">Menú</span>
          </button>
        )}

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-600/30 to-amber-950/50 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md shadow-amber-950/30">
          <Headphones className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1
              id="app-brand-title"
              className="font-title text-base sm:text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-400 select-none"
            >
              {appName}
            </h1>
            <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              PRO
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-neutral-400/90 font-serif-elegant tracking-wide truncate max-w-[130px] sm:max-w-none">
            Voz viva para cualquier libro & PDF
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,application/pdf,text/plain"
          className="hidden"
          onChange={handleFileInputChange}
          id="hidden-file-input"
        />
        <button
          id="btn-upload-file"
          onClick={() => {
            sounds.playClick(600);
            fileInputRef.current?.click();
          }}
          disabled={isLoadingFile}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
          title="Abrir cualquier archivo PDF"
        >
          <Upload className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden xs:inline sm:inline">
            {isLoadingFile ? 'Cargando...' : 'Abrir PDF'}
          </span>
        </button>

        {/* Voices Menu Trigger */}
        <button
          id="btn-open-voices-modal"
          onClick={() => {
            sounds.playVoiceChange();
            onOpenVoicesModal();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-medium transition-all active:scale-95"
          title="Cambiar voz e idioma de lectura"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden md:inline text-neutral-300">Voz:</span>
          <span className="font-semibold text-amber-300 truncate max-w-[100px] sm:max-w-[125px]">
            {selectedVoiceURI ? '🎙️ Elegida' : voicePreset === 'femenina' ? '👩 Femenina' : '🎙️ Masculina'}
          </span>
        </button>

        {/* Ambient Instrumental Selector Trigger */}
        <button
          id="btn-header-ambient"
          onClick={() => {
            sounds.playClick(600);
            onOpenVoicesModal();
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-medium transition-all active:scale-95 border ${
            ambientTrack && ambientTrack !== 'none'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-sm'
              : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
          }`}
          title={
            ambientTrack && ambientTrack !== 'none'
              ? `Música ambiental: ${ambientTrack === 'biblioteca' ? 'Biblioteca Acústica' : 'Lluvia Serena'}`
              : 'Elegir música instrumental de fondo'
          }
        >
          <Music className={`w-3.5 h-3.5 ${ambientTrack && ambientTrack !== 'none' ? 'text-emerald-400' : 'text-neutral-400'}`} />
          <span className="hidden lg:inline">
            {ambientTrack === 'biblioteca'
              ? '📖 Biblioteca'
              : ambientTrack === 'lluvia'
              ? '🌧️ Lluvia'
              : 'Música'}
          </span>
        </button>

        {/* Language Selector Trigger */}
        <button
          id="btn-header-language"
          onClick={() => {
            sounds.playClick(650);
            onOpenVoicesModal();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-medium transition-all active:scale-95"
          title="Idioma de lectura (Predeterminado: Español)"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold text-amber-300 font-mono">
            {currentLanguage.toLowerCase() === 'es' ? '🇪🇸 ES' : currentLanguage.toUpperCase()}
          </span>
        </button>

        {/* Bookmarks Menu Trigger */}
        <button
          id="btn-open-bookmarks-modal"
          onClick={() => {
            sounds.playClick(650);
            onOpenBookmarks();
          }}
          className="relative flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-medium transition-all active:scale-95"
          title="Ver marcadores y favoritos"
        >
          <BookmarkIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">Marcadores</span>
          {bookmarksCount > 0 && (
            <span
              id="header-bookmarks-badge"
              className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 font-bold text-[10px] flex items-center justify-center font-mono"
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
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-medium transition-all active:scale-95"
            title="Historial de libros reproducidos (Reloj)"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Historial</span>
            {historyCount > 0 && (
              <span
                id="header-history-badge"
                className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 font-bold text-[10px] flex items-center justify-center font-mono"
              >
                {historyCount}
              </span>
            )}
          </button>
        )}

        {/* Sleep Timer Menu Trigger */}
        {onOpenSleepTimer && (
          <button
            id="btn-header-sleep-timer"
            onClick={() => {
              sounds.playTick();
              onOpenSleepTimer();
            }}
            className={`relative flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              sleepTimerState?.isActive
                ? 'bg-indigo-950/70 border-indigo-500/50 text-indigo-200 shadow-sm shadow-indigo-950/40'
                : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-indigo-300'
            }`}
            title="Temporizador de apagado para dormir"
          >
            <Moon
              className={`w-3.5 h-3.5 shrink-0 ${
                sleepTimerState?.isActive
                  ? 'text-indigo-400 fill-indigo-400/40 animate-pulse'
                  : 'text-amber-400'
              }`}
            />
            <span className="hidden sm:inline">
              {sleepTimerState?.isActive
                ? sleepTimerState.mode === 'end_of_page'
                  ? 'Fin pág.'
                  : `${Math.ceil(sleepTimerState.remainingSeconds / 60)}m`
                : 'Reposo'}
            </span>
            {sleepTimerState?.isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping shrink-0" />
            )}
          </button>
        )}

        {/* Background Audio Modal Trigger */}
        {onOpenBackgroundAudio && (
          <button
            id="btn-header-background-audio"
            onClick={() => {
              sounds.playClick(650);
              onOpenBackgroundAudio();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-emerald-300 text-xs font-medium transition-all active:scale-95"
            title="Reproducción en segundo plano (pantalla apagada o en otras apps)"
          >
            <Headphones className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden xl:inline">Segundo Plano</span>
            {isPlaying && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            )}
          </button>
        )}

        {/* Instalar App / Modo Nativo Trigger */}
        {onOpenInstallModal && (
          <button
            id="btn-header-install-app"
            onClick={() => {
              sounds.playClick(750);
              onOpenInstallModal();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border text-xs font-semibold transition-all active:scale-95 shadow-sm ${
              isInstalled
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-gradient-to-r from-amber-500/25 to-amber-600/20 hover:from-amber-500/35 hover:to-amber-600/30 border-amber-500/60 text-amber-200'
            }`}
            title={
              isInstalled
                ? 'LectorZews en Modo App Nativo'
                : 'Instalar LectorZews como App para quitar las barras del navegador'
            }
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">
              {isInstalled ? 'Modo App' : 'Instalar App'}
            </span>
          </button>
        )}

        {/* Pantalla Completa Web Trigger */}
        {onToggleFullscreen && (
          <button
            id="btn-header-toggle-fullscreen"
            onClick={() => {
              sounds.playClick(650);
              onToggleFullscreen();
            }}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              isFullscreen
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
            }`}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa sin controles de navegador'}
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{isFullscreen ? 'Salir' : 'Pantalla Completa'}</span>
          </button>
        )}

        {/* Android Export / Guía Trigger */}
        {onOpenAndroidExport && (
          <button
            id="btn-header-android-export"
            onClick={() => {
              sounds.playClick(750);
              onOpenAndroidExport();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-950/80 to-neutral-900/80 hover:from-emerald-900/90 hover:to-neutral-800 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all active:scale-95 shadow-sm shadow-emerald-950/40"
            title="Exportar APK / AAB para Android"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Guía Android</span>
          </button>
        )}

        {/* Modo Inmersivo Trigger */}
        {hasDocument && onToggleImmersiveMode && (
          <button
            id="btn-header-immersive-mode"
            onClick={() => {
              sounds.playClick(850);
              onToggleImmersiveMode();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-xs font-semibold transition-all active:scale-95 shadow-sm shadow-amber-950/40"
            title="Activar Modo Inmersivo: Oculta temporalmente todos los controles para lectura total"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden md:inline">Modo Inmersivo</span>
          </button>
        )}

        {/* Auto Dark Mode / Theme Toggle */}
        <button
          id="btn-toggle-theme"
          onClick={() => {
            sounds.playTick();
            onCycleTheme();
          }}
          className="flex items-center gap-1 p-2 sm:px-2.5 sm:py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium transition-all active:scale-95"
          title={`Modo visual: ${getThemeLabel()} (Pulsa para alternar)`}
        >
          {getThemeIcon()}
          <span className="hidden lg:inline text-[11px] text-neutral-400">{getThemeLabel()}</span>
        </button>

        {/* Tactile Sound Feedback Toggle */}
        <button
          id="btn-toggle-sounds"
          onClick={() => {
            onToggleSounds();
          }}
          className="p-2 sm:p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs transition-all active:scale-95"
          title={soundsEnabled ? 'Sonidos de botones activados' : 'Sonidos desactivados'}
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
