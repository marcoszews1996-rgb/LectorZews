import React, { useState, useEffect } from 'react';
import { Smartphone, Maximize2, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface InstallAppBannerProps {
  isInstalled: boolean;
  isInstallable: boolean;
  onOpenModal: () => void;
  onInstall: () => Promise<boolean>;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

export const InstallAppBanner: React.FC<InstallAppBannerProps> = ({
  isInstalled,
  isInstallable,
  onOpenModal,
  onInstall,
  onToggleFullscreen,
  isFullscreen,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('lectorzews_install_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  // If running inside native Android app, or already installed as PWA or dismissed, don't show the banner
  const isNativeApp =
    typeof window !== 'undefined' &&
    ((window as unknown as { AndroidTTS?: unknown }).AndroidTTS !== undefined ||
      navigator.userAgent.includes('LectorZewsNative') ||
      window.matchMedia('(display-mode: standalone)').matches);

  if (isNativeApp || isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    sounds.playClick(400);
    setIsDismissed(true);
    try {
      sessionStorage.setItem('lectorzews_install_banner_dismissed', 'true');
    } catch {}
  };

  return (
    <div
      id="pwa-install-app-banner"
      className="relative z-30 w-full bg-gradient-to-r from-amber-950/90 via-neutral-900/95 to-neutral-950/90 border-b border-amber-500/40 px-3 sm:px-6 py-2.5 shadow-lg backdrop-blur-md animate-fadeIn transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        {/* Left message */}
        <div className="flex items-center gap-2.5 text-neutral-200 text-center sm:text-left">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-amber-200 flex items-center gap-1.5 justify-center sm:justify-start">
              <span>¿Quieres usar LectorZews como una App real?</span>
              <span className="hidden md:inline-block text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                Sin barras de navegador
              </span>
            </p>
            <p className="text-[11px] text-neutral-400 hidden xs:block">
              Instálala en tu móvil o PC para abrirla en ventana propia a pantalla completa con icono directo.
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isInstallable && (
            <button
              id="btn-banner-quick-install"
              onClick={async () => {
                sounds.playSuccess();
                const success = await onInstall();
                if (!success) {
                  onOpenModal();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-neutral-950" />
              <span>Instalar WebApp</span>
            </button>
          )}

          <button
            id="btn-banner-how-to-install"
            onClick={() => {
              sounds.playClick(600);
              onOpenModal();
            }}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-medium text-xs transition active:scale-95 flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isInstallable ? 'Instrucciones' : 'Cómo tener la App'}</span>
          </button>

          <button
            id="btn-banner-fullscreen"
            onClick={() => {
              sounds.playClick(650);
              onToggleFullscreen();
            }}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 text-xs transition active:scale-95"
            title="Ocultar barras del navegador ahora mismo"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFullscreen ? 'Salir' : 'Pantalla Completa'}</span>
          </button>

          <button
            id="btn-banner-dismiss"
            onClick={handleDismiss}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80 transition active:scale-95"
            title="Cerrar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
