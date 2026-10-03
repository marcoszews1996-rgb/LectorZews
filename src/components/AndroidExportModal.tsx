import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  ExternalLink,
  Check,
  Copy,
  X,
  Package,
  ShieldCheck,
  Sparkles,
  Info,
  Terminal,
  AlertTriangle,
  FileCode,
  CheckCircle2,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { usePWAInstall } from '../utils/usePWAInstall';
import { ADMOB_CONFIG } from '../config/admob';

interface AndroidExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const AndroidExportModal: React.FC<AndroidExportModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCommands, setCopiedCommands] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [showManifestDetails, setShowManifestDetails] = useState(false);
  const [copiedAdMobXml, setCopiedAdMobXml] = useState(false);
  const [copiedAdUnitId, setCopiedAdUnitId] = useState(false);
  const [copiedInterstitialId, setCopiedInterstitialId] = useState(false);
  const [copiedInterstitialCode, setCopiedInterstitialCode] = useState(false);
  const [copiedAppAdsTxt, setCopiedAppAdsTxt] = useState(false);

  if (!isOpen) return null;

  const pwabuilderUrl = `https://www.pwabuilder.com?site=${encodeURIComponent(appUrl)}`;

  const manifestJsonString = JSON.stringify(
    {
      id: '/',
      name: 'LectorZews - Lector de Libros y PDF',
      short_name: 'LectorZews',
      description:
        'Disfruta de tus mejores libros en PDF relatados en segundo plano; relájate y disfruta de la lectura.',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'any',
      background_color: '#0c0a09',
      theme_color: '#0c0a09',
      lang: 'es',
      dir: 'ltr',
      categories: ['books', 'education', 'utilities'],
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/pwa-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: '/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png',
        },
      ],
    },
    null,
    2
  );

  const capacitorCommands = `npm install
npm run build
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init LectorZews com.lectorzews.app --web-dir dist
npx cap add android
npx cap copy
npx cap open android`;

  const handleCopyUrl = () => {
    sounds.playClick(800);
    navigator.clipboard.writeText(appUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleCopyCommands = () => {
    sounds.playClick(800);
    navigator.clipboard.writeText(capacitorCommands);
    setCopiedCommands(true);
    setTimeout(() => setCopiedCommands(false), 2500);
  };

  const handleCopyManifest = () => {
    sounds.playClick(800);
    navigator.clipboard.writeText(manifestJsonString);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2500);
  };

  return (
    <div
      id="android-export-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="android-export-modal-content"
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-neutral-900 border border-amber-500/30 text-neutral-100 shadow-2xl p-5 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-amber-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-title text-neutral-100">
                  Exportar e Instalar en Android
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  AAB & APK
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Genera tu archivo .aab firmado para Google Play Store o tu .apk para probar en tu teléfono.
              </p>
            </div>
          </div>
          <button
            id="btn-close-android-modal"
            onClick={() => {
              sounds.playClick(400);
              onClose();
            }}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-5">
          {/* Card 1: PWABuilder 1-Click Generation */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-neutral-950 to-neutral-900 border border-emerald-500/40 shadow-lg relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-neutral-950 font-bold text-xs flex items-center justify-center font-mono">
                  1
                </span>
                <h3 className="text-base font-semibold text-emerald-300">
                  Generación Oficial de AAB Firmado y APK (PWABuilder)
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20 whitespace-nowrap">
                Recomendado y Gratis
              </span>
            </div>

            <p className="text-xs text-neutral-300 mb-3 leading-relaxed">
              LectorZews ya cuenta con <strong>Web App Manifest</strong>, <strong>Service Worker</strong> e <strong>iconos Android de alta resolución (192px, 512px y maskable)</strong>. Puedes empaquetarlo directamente en la herramienta oficial de empaquetado de Google/Microsoft para obtener el <strong>.aab firmado</strong> y el <strong>.apk de prueba</strong>:
            </p>

            {/* URL Display & Copy */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 mb-3">
              <span className="text-xs text-neutral-400 font-mono truncate flex-1 pl-1 select-all">
                {appUrl}
              </span>
              <button
                id="btn-copy-app-url"
                onClick={handleCopyUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition active:scale-95 shrink-0"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar URL</span>
                  </>
                )}
              </button>
            </div>

            {/* PWABuilder Troubleshooting Alert / Missing Name Fix */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 mb-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>¿PWABuilder dice "Missing Name" o "Your manifest description is missing"?</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                Este aviso aparece porque la URL de prueba de AI Studio tiene protección por cookies de sesión de Google que bloquea los rastreadores automáticos de PWABuilder. <strong>Tu Manifest ya está 100% completo</strong> con nombre, descripción e iconos.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  id="btn-copy-manifest-json-quick"
                  onClick={handleCopyManifest}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition active:scale-95 shadow-sm"
                >
                  {copiedManifest ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-neutral-950" />
                      <span>¡Manifest JSON Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Manifest JSON para PWABuilder</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-toggle-manifest-guide"
                  onClick={() => setShowManifestDetails(!showManifestDetails)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition"
                >
                  <FileCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>{showManifestDetails ? 'Ocultar campos' : 'Ver campos a rellenar'}</span>
                </button>
              </div>

              {showManifestDetails && (
                <div className="mt-2 p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300 space-y-1.5 animate-fadeIn font-sans">
                  <p className="text-amber-300 font-medium">Solución rápida en PWABuilder (1 minuto):</p>
                  <ol className="list-decimal list-inside space-y-1 text-neutral-300 pl-1 text-[11px]">
                    <li>En la pantalla de PWABuilder, pulsa el botón <strong>"Edit your Manifest"</strong> (o la pestaña <strong>Manifest</strong>).</li>
                    <li>
                      Haz clic en la pestaña <strong>"JSON"</strong> y pega el Manifest que acabas de copiar con el botón de arriba, o rellena manualmente:
                      <ul className="list-disc list-inside pl-3 pt-1 text-neutral-400 space-y-0.5">
                        <li><strong>Name:</strong> <code className="text-amber-300 select-all">LectorZews - Lector de Libros y PDF</code></li>
                        <li><strong>Short name:</strong> <code className="text-amber-300 select-all">LectorZews</code></li>
                        <li><strong>Description:</strong> <code className="text-amber-300 select-all">Disfruta de tus mejores libros en PDF relatados en segundo plano; relájate y disfruta de la lectura.</code></li>
                        <li><strong>Start URL:</strong> <code className="text-amber-300 select-all">/</code></li>
                      </ul>
                    </li>
                    <li>Pulsa <strong>"Save"</strong> o <strong>"Update"</strong>. ¡El reporte se pondrá en verde y podrás descargar tu paquete Android!</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Steps & Direct Link */}
            <div className="bg-neutral-950/60 rounded-xl p-3 border border-neutral-800/80 mb-4 text-xs text-neutral-300 space-y-1.5">
              <p className="font-semibold text-neutral-200">Pasos para descargar tu paquete en PWABuilder:</p>
              <ol className="list-decimal list-inside space-y-1 text-neutral-300/90 pl-1">
                <li>Haz clic en el botón verde de abajo para abrir <strong>PWABuilder</strong>.</li>
                <li>Si te pide el Manifest, pulsa <strong>"Edit your Manifest"</strong> y pega el JSON copiado.</li>
                <li>Haz clic en <strong>"Package for Stores"</strong> o <strong>"Build My PWA"</strong> &gt; <strong>Android</strong>.</li>
                <li>Configura el ID del paquete (ej. <code className="text-amber-300">com.lectorzews.app</code>) y pulsa <strong>"Download Package"</strong>.</li>
                <li>¡Listo! El archivo .zip contiene tu <strong>.aab firmado</strong> para la Play Store y tu <strong>.apk</strong> para probarlo de inmediato.</li>
              </ol>

              <div className="pt-2 mt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400 leading-relaxed">
                <span className="text-amber-300 font-semibold">💡 ¿Por qué el APK de prueba muestra una barra de navegador arriba?</span> Es el comportamiento normal de seguridad de Android (TWA Digital Asset Links) mientras la app está en fase de prueba no enlazada al dominio definitivo. Al publicar en Google Play o al instalarla directamente desde Chrome, la barra desaparece por completo y se abre 100% como app nativa a pantalla completa.
              </div>
            </div>

            <a
              id="btn-open-pwabuilder"
              href={pwabuilderUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sounds.playClick(600)}
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm transition shadow-lg shadow-emerald-950/50 active:scale-[0.99]"
            >
              <Package className="w-4 h-4" />
              <span>Abrir PWABuilder y Descargar AAB / APK</span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
            </a>
          </div>

          {/* Card: Web App Manifest Direct Download & Inspection */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-amber-500/30 shadow-md">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center font-mono">
                  📄
                </span>
                <h3 className="text-base font-semibold text-amber-300">
                  Web App Manifest Listo para Empaquetado APK
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500/10 text-amber-400 font-medium border border-amber-500/20">
                W3C Standard
              </span>
            </div>

            <p className="text-xs text-neutral-300 mb-3 leading-relaxed">
              El archivo manifest contiene la configuración completa requerida por Android (nombre, descripción, iconos en 192px/512px/maskable, colores de tema y modo standalone). Puedes descargarlo directamente o inspeccionarlo:
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <a
                id="btn-download-manifest-json"
                href="/manifest.json"
                download="manifest.json"
                onClick={() => sounds.playClick(650)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-200 border border-amber-500/30 text-xs font-semibold transition active:scale-95 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Descargar manifest.json</span>
              </a>

              <a
                id="btn-download-manifest-webmanifest"
                href="/manifest.webmanifest"
                download="manifest.webmanifest"
                onClick={() => sounds.playClick(650)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold transition active:scale-95 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Descargar manifest.webmanifest</span>
              </a>

              <button
                id="btn-copy-manifest-json-alt"
                onClick={handleCopyManifest}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold transition active:scale-95 shadow-sm"
              >
                {copiedManifest ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar JSON</span>
                  </>
                )}
              </button>

              <a
                id="btn-view-manifest-raw"
                href="/manifest.webmanifest"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sounds.playClick(500)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs transition"
              >
                <span>Ver JSON en pestaña</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Bubblewrap CLI Option */}
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 space-y-1.5">
              <p className="font-semibold text-neutral-200 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                Generar APK por línea de comandos con Bubblewrap (Google TWA):
              </p>
              <pre className="p-2 rounded-lg bg-neutral-950 border border-neutral-800/80 font-mono text-[10px] text-amber-300 overflow-x-auto select-all">
                {`npm i -g @bubblewrap/cli\nbubblewrap init --manifest="${appUrl}/manifest.webmanifest"\nbubblewrap build`}
              </pre>
            </div>
          </div>

          {/* Card 2: Direct PWA Install in Android Chrome */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 shadow-md">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center font-mono">
                  2
                </span>
                <h3 className="text-base font-semibold text-amber-300">
                  Instalación Inmediata en tu Teléfono Android (Sin compilar)
                </h3>
              </div>
            </div>

            <p className="text-xs text-neutral-300 mb-3 leading-relaxed">
              Gracias al soporte PWA, puedes instalar LectorZews directamente en tu móvil sin necesidad de archivo APK. Funciona a pantalla completa, con icono propio en el cajón de apps y sin barra de navegador:
            </p>

            {isInstallable && (
              <button
                id="btn-trigger-pwa-install"
                onClick={async () => {
                  sounds.playClick(700);
                  await install();
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition mb-3 active:scale-95 shadow-md shadow-amber-950/30"
              >
                <Download className="w-4 h-4" />
                <span>Instalar LectorZews ahora en este dispositivo</span>
              </button>
            )}

            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 space-y-1">
              <p className="font-semibold text-amber-200/90 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                Cómo instalarlo desde tu teléfono:
              </p>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Abre <strong>Google Chrome</strong> en tu móvil Android, navega a la URL de la app y toca los tres puntos del menú superior derecho <strong className="text-neutral-200">⋮</strong> &gt; <strong className="text-neutral-200">"Instalar aplicación"</strong> o <strong className="text-neutral-200">"Añadir a pantalla de inicio"</strong>.
              </p>
            </div>
          </div>

          {/* Card 3: Android Studio & Capacitor Compilation */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 shadow-md">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-500 text-neutral-950 font-bold text-xs flex items-center justify-center font-mono">
                  3
                </span>
                <h3 className="text-base font-semibold text-indigo-300">
                  Compilar con Android Studio y Capacitor (Código local)
                </h3>
              </div>
            </div>

            <p className="text-xs text-neutral-300 mb-2 leading-relaxed">
              Si prefieres compilar de manera 100% nativa con tu propia clave de firma en tu computadora:
            </p>

            <ol className="list-decimal list-inside text-xs text-neutral-400 space-y-1 mb-3 pl-1">
              <li>Descarga el código del proyecto desde el menú superior de AI Studio (<strong className="text-neutral-200">Export &gt; Download ZIP</strong>).</li>
              <li>Descomprime el archivo y abre una terminal en la carpeta del proyecto.</li>
              <li>Ejecuta los siguientes comandos para crear el proyecto de Android Studio:</li>
            </ol>

            <div className="relative">
              <pre className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 font-mono text-[11px] text-emerald-400 overflow-x-auto select-all">
                {capacitorCommands}
              </pre>
              <button
                id="btn-copy-capacitor-commands"
                onClick={handleCopyCommands}
                className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-medium flex items-center gap-1 transition active:scale-95"
              >
                {copiedCommands ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-neutral-400 mt-2">
              En Android Studio ve a: <strong className="text-neutral-200">Build &gt; Generate Signed Bundle / APK</strong> y selecciona tu firma para obtener el <strong className="text-neutral-200">.aab</strong> o <strong className="text-neutral-200">.apk</strong>.
            </p>
          </div>

          {/* Card 4: Google AdMob Integration for Android */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-amber-500/40 shadow-md">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center font-mono">
                  4
                </span>
                <h3 className="text-base font-semibold text-amber-300">
                  Google AdMob Integrado (Banner de Anuncios)
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/30">
                AdMob Activo
              </span>
            </div>

            <p className="text-xs text-neutral-300 mb-3 leading-relaxed">
              El banner de Google AdMob ya está activo en la interfaz de la aplicación web y PWA. Si compilas la app nativa para Android en Android Studio o Capacitor, utiliza tus credenciales configuradas:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] text-neutral-400 block">AdMob App ID:</span>
                  <code className="text-amber-300 font-mono text-xs select-all truncate block">
                    {ADMOB_CONFIG.appId}
                  </code>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] text-neutral-400 block">Banner Ad Unit ID:</span>
                  <code className="text-amber-300 font-mono text-xs select-all truncate block">
                    {ADMOB_CONFIG.bannerAdUnitId}
                  </code>
                </div>
                <button
                  id="btn-copy-ad-unit-id"
                  onClick={() => {
                    sounds.playClick(750);
                    navigator.clipboard.writeText(ADMOB_CONFIG.bannerAdUnitId);
                    setCopiedAdUnitId(true);
                    setTimeout(() => setCopiedAdUnitId(false), 2500);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1 shrink-0 transition active:scale-95"
                >
                  {copiedAdUnitId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar ID</span>
                    </>
                  )}
                </button>
              </div>

              {/* Interstitial Unit ID */}
              <div className="p-2.5 rounded-xl bg-neutral-900 border border-amber-500/30 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] text-amber-300 font-semibold block">
                    Intersticial Ad Unit ID (3ª apertura de PDF):
                  </span>
                  <code className="text-amber-300 font-mono text-xs select-all truncate block">
                    {ADMOB_CONFIG.interstitialAdUnitId}
                  </code>
                </div>
                <button
                  id="btn-copy-interstitial-ad-unit-id"
                  onClick={() => {
                    sounds.playClick(750);
                    navigator.clipboard.writeText(ADMOB_CONFIG.interstitialAdUnitId);
                    setCopiedInterstitialId(true);
                    setTimeout(() => setCopiedInterstitialId(false), 2500);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1 shrink-0 transition active:scale-95 border border-amber-500/40"
                >
                  {copiedInterstitialId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar ID</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-200">
                    Línea para AndroidManifest.xml (dentro de &lt;application&gt;):
                  </span>
                  <button
                    id="btn-copy-admob-manifest-xml"
                    onClick={() => {
                      sounds.playClick(750);
                      navigator.clipboard.writeText(ADMOB_CONFIG.androidManifestSnippet);
                      setCopiedAdMobXml(true);
                      setTimeout(() => setCopiedAdMobXml(false), 2500);
                    }}
                    className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[10px] font-bold flex items-center gap-1 transition active:scale-95"
                  >
                    {copiedAdMobXml ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar XML</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-2 rounded-lg bg-neutral-950 border border-neutral-800/80 font-mono text-[10px] text-amber-300 overflow-x-auto select-all">
                  {ADMOB_CONFIG.androidManifestSnippet}
                </pre>
              </div>

              {/* Capacitor Interstitial Implementation */}
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-200">
                    Código Capacitor para Anuncio Intersticial:
                  </span>
                  <button
                    id="btn-copy-interstitial-capacitor-code"
                    onClick={() => {
                      sounds.playClick(750);
                      navigator.clipboard.writeText(ADMOB_CONFIG.capacitorInterstitialSnippet);
                      setCopiedInterstitialCode(true);
                      setTimeout(() => setCopiedInterstitialCode(false), 2500);
                    }}
                    className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-medium flex items-center gap-1 transition active:scale-95"
                  >
                    {copiedInterstitialCode ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar Código</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-2 rounded-lg bg-neutral-950 border border-neutral-800/80 font-mono text-[10px] text-emerald-400 overflow-x-auto select-all">
                  {ADMOB_CONFIG.capacitorInterstitialSnippet}
                </pre>
              </div>

              {/* Archivo app-ads.txt para verificación oficial AdMob */}
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-neutral-200">
                      Archivo de Verificación: <code className="text-amber-400">/app-ads.txt</code>
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Activo en servidor
                    </span>
                  </div>
                  <button
                    id="btn-copy-app-ads-txt"
                    onClick={() => {
                      sounds.playClick(750);
                      navigator.clipboard.writeText(ADMOB_CONFIG.appAdsTxt);
                      setCopiedAppAdsTxt(true);
                      setTimeout(() => setCopiedAppAdsTxt(false), 2500);
                    }}
                    className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-medium flex items-center gap-1 transition active:scale-95"
                  >
                    {copiedAppAdsTxt ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar app-ads.txt</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-2 rounded-lg bg-neutral-950 border border-neutral-800/80 font-mono text-[10px] text-sky-300 overflow-x-auto select-all">
                  {ADMOB_CONFIG.appAdsTxt}
                </pre>
                <p className="text-[10px] text-neutral-400">
                  Google AdMob verifica este archivo en la URL de tu sitio web de desarrollador en Google Play Store para validar la propiedad de los anuncios.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end">
          <button
            id="btn-done-android-modal"
            onClick={() => {
              sounds.playClick(500);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
