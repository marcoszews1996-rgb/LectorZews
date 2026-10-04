import React from 'react';
import {
  Smartphone,
  Download,
  Maximize2,
  X,
  CheckCircle2,
  Share,
  PlusSquare,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstalled: boolean;
  isInstallable: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isFullscreen: boolean;
  onInstall: () => Promise<boolean>;
  onToggleFullscreen: () => void;
  onOpenAndroidExport: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  isInstalled,
  isInstallable,
  isIOS,
  isAndroid,
  isFullscreen,
  onInstall,
  onToggleFullscreen,
  onOpenAndroidExport,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="install-app-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="install-app-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-2xl bg-neutral-950 border border-amber-500/40 shadow-2xl shadow-amber-950/40 p-5 sm:p-6 text-neutral-100 my-auto max-h-[92vh] flex flex-col"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 border-b border-neutral-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-900/40 border border-amber-500/50 flex items-center justify-center text-amber-300 shadow-md shadow-amber-950/40 shrink-0">
              <Smartphone className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-title text-lg sm:text-xl font-bold text-amber-100">
                  Usar como App Real
                </h2>
                {isInstalled && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Instalada
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                Elimina las barras del navegador, pestañas y URL para una lectura inmersiva
              </p>
            </div>
          </div>
          <button
            id="btn-close-install-modal"
            onClick={() => {
              sounds.playClick(450);
              onClose();
            }}
            className="p-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 transition active:scale-95"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-4 py-4 pr-1 text-xs">
          {/* Status Banner */}
          {isInstalled ? (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-start gap-3 text-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-emerald-300">
                  ¡LectorZews ya se ejecuta como Aplicación!
                </p>
                <p className="text-[11px] text-emerald-200/80 mt-0.5">
                  Estás en modo independiente (standalone). Si accedes desde el icono de tu pantalla de inicio, la barra de navegación del navegador permanece oculta.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-amber-300">
                  Actualmente estás viendo la app dentro de una pestaña del navegador
                </p>
                <p className="text-[11px] text-amber-200/80 mt-0.5">
                  Para que se abra exactamente como una aplicación nativa (como Spotify o Kindle), instálala en tu dispositivo con las siguientes opciones:
                </p>
              </div>
            </div>
          )}

          {/* Quick Action: 1-Click Install (Chrome / Edge / Android) */}
          {isInstallable && !isInstalled && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/50 via-neutral-900 to-neutral-900 border-2 border-amber-500/60 shadow-lg shadow-amber-950/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                  Instalación Rápida con 1 Toque
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-semibold">
                  Recomendado
                </span>
              </div>
              <p className="text-neutral-300 text-xs">
                Tu navegador permite instalar LectorZews directamente con su icono y ventana exclusiva sin barras.
              </p>
              <button
                id="btn-trigger-pwa-install"
                onClick={async () => {
                  sounds.playSuccess();
                  const success = await onInstall();
                  if (success) {
                    onClose();
                  }
                }}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-neutral-950" />
                Instalar LectorZews en este dispositivo
              </button>
            </div>
          )}

          {/* Quick Action: Toggle Fullscreen Mode immediately */}
          <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-200">
                <Maximize2 className="w-4 h-4 text-amber-400" />
                <span>Modo Pantalla Completa Inmediato</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Oculta de inmediato las barras y controles del navegador mientras lees.
              </p>
            </div>
            <button
              id="btn-modal-toggle-fullscreen"
              onClick={() => {
                sounds.playClick(600);
                onToggleFullscreen();
              }}
              className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold shrink-0 transition active:scale-95"
            >
              {isFullscreen ? 'Salir de Pantalla Completa' : 'Pantalla Completa'}
            </button>
          </div>

          {/* Android Steps (Chrome, Samsung Internet, Edge, Brave) */}
          <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-2.5">
            <div className="flex items-center gap-2 text-neutral-200 font-semibold">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Cómo instalar en Android (Google Chrome / Brave / Edge)</span>
            </div>
            <div className="space-y-2 text-[11px] text-neutral-300">
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <p>
                  Abre el <strong>menú de tres puntos (⋮)</strong> en la esquina superior derecha del navegador en tu teléfono.
                </p>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <p>
                  Toca en <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <p>
                  ¡Listo! Se añadirá el icono de <strong>LectorZews</strong> a tu cajón de apps. Al tocarlo, se abrirá como app propia, <strong>sin barra de navegación ni URL</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* iOS / iPhone / iPad Steps */}
          {isIOS && (
            <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-2.5">
              <div className="flex items-center gap-2 text-neutral-200 font-semibold">
                <Share className="w-4 h-4 text-sky-400" />
                <span>Cómo instalar en iPhone o iPad (Safari)</span>
              </div>
              <div className="space-y-2 text-[11px] text-neutral-300">
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center shrink-0">
                    1
                </span>
                  <p>
                    Toca el botón <strong>Compartir</strong> (el icono del cuadrado con una flecha hacia arriba <Share className="w-3 h-3 inline text-sky-400" />) en la barra inferior de Safari.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <p>
                    Desplázate hacia abajo y selecciona <strong>"Agregar a la pantalla de inicio"</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <p>
                    Toca <strong>Agregar</strong> en la esquina superior derecha. LectorZews aparecerá en tu pantalla de inicio como una aplicación completa.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Native Android APK Option */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-900 to-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold text-neutral-200">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>¿Deseas compilar el archivo APK / AAB instalable?</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Obtén el paquete completo para Android Studio, Capacitor y Google Play Store con AdMob ya integrado.
              </p>
            </div>
            <button
              id="btn-modal-open-android-apk-guide"
              onClick={() => {
                sounds.playClick(750);
                onClose();
                onOpenAndroidExport();
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shrink-0 transition active:scale-95 flex items-center gap-1.5"
            >
              <span>Ver APK / AAB</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-end shrink-0">
          <button
            id="btn-close-install-modal-footer"
            onClick={() => {
              sounds.playClick(500);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition active:scale-95"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
