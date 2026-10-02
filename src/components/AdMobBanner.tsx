import React, { useEffect, useRef, useState } from 'react';
import { ADMOB_CONFIG } from '../config/admob';
import {
  ShieldCheck,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface AdMobBannerProps {
  className?: string;
  hasAudioPlayer?: boolean;
  isImmersiveMode?: boolean;
  pdfOpenCount?: number;
  onOpenInterstitialPreview?: () => void;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  className = '',
  hasAudioPlayer = false,
  isImmersiveMode = false,
  pdfOpenCount = 0,
  onOpenInterstitialPreview,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showTechDetails, setShowTechDetails] = useState<boolean>(false);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const hasPushedRef = useRef<boolean>(false);

  // Hidden in immersive mode to ensure total reading focus
  if (isImmersiveMode || isDismissed) {
    return null;
  }

  // Safe measurement and ad push logic
  useEffect(() => {
    let isCancelled = false;

    const tryPushAd = () => {
      if (hasPushedRef.current || isCancelled) return;

      const container = containerRef.current;
      const ins = insRef.current;

      // Only attempt to push if elements exist and have valid visible width > 0
      if (!container || !ins) return;

      const width = container.offsetWidth || container.clientWidth;
      if (width <= 0) {
        // Not laid out yet; wait for resize or next frame
        return;
      }

      // Check if already filled by adsbygoogle
      if (ins.getAttribute('data-adsbygoogle-status')) {
        hasPushedRef.current = true;
        return;
      }

      try {
        hasPushedRef.current = true;
        const w = window as unknown as { adsbygoogle?: Array<Record<string, unknown>> };
        w.adsbygoogle = w.adsbygoogle || [];
        w.adsbygoogle.push({});
      } catch {
        // TagError or unapproved domain in test iframe is handled silently
      }
    };

    // Use ResizeObserver to trigger only once container has real non-zero layout
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0) {
            tryPushAd();
          }
        }
      });
      observer.observe(containerRef.current);
    } else {
      // Fallback: check after slight delay to ensure CSS paint
      const timer = setTimeout(tryPushAd, 300);
      return () => {
        isCancelled = true;
        clearTimeout(timer);
      };
    }

    return () => {
      isCancelled = true;
      if (observer) {
        observer.disconnect();
      }
    };
  }, [isMinimized]);

  const handleCopySnippet = () => {
    sounds.playClick(700);
    navigator.clipboard.writeText(
      `// Google AdMob Configuration\n// App ID: ${ADMOB_CONFIG.appId}\n// Banner Unit: ${ADMOB_CONFIG.bannerAdUnitId}\n${ADMOB_CONFIG.androidManifestSnippet}`
    );
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  return (
    <div
      ref={containerRef}
      id="admob-banner-wrapper"
      className={`w-full max-w-4xl mx-auto px-2 sm:px-4 transition-all duration-300 pointer-events-auto ${className} ${
        hasAudioPlayer ? 'mb-2' : 'my-3'
      }`}
    >
      <div
        id="admob-banner-container"
        className="relative overflow-hidden rounded-2xl bg-neutral-950/90 border border-amber-500/30 backdrop-blur-md shadow-lg shadow-black/40 transition-all text-neutral-200"
      >
        {/* Top Mini Header Bar */}
        <div className="flex items-center justify-between px-3 py-1 bg-neutral-900/90 border-b border-neutral-800 text-[10px] text-neutral-400 select-none">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="px-1.5 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] uppercase tracking-wider shrink-0">
              Anuncio
            </span>
            <span className="font-semibold text-neutral-300 truncate">
              Google AdMob · Banner
            </span>
            <span className="hidden sm:inline text-neutral-500 font-mono text-[9px] truncate">
              {ADMOB_CONFIG.bannerAdUnitId}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              id="btn-admob-info-toggle"
              onClick={() => {
                sounds.playTick();
                setShowTechDetails(!showTechDetails);
              }}
              className="p-1 rounded-md text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 transition"
              title="Información de AdMob en Android"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-admob-toggle-minimize"
              onClick={() => {
                sounds.playTick();
                setIsMinimized(!isMinimized);
              }}
              className="p-1 rounded-md text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 transition"
              title={isMinimized ? 'Expandir anuncio' : 'Minimizar anuncio'}
            >
              {isMinimized ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              id="btn-admob-dismiss"
              onClick={() => {
                sounds.playClick(400);
                setIsDismissed(true);
              }}
              className="p-1 rounded-md text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition"
              title="Ocultar anuncio temporalmente"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ad Unit Body */}
        {!isMinimized && (
          <div className="relative p-2.5">
            {/* Visual Banner Preview and Status Card */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full px-2 py-1">
              <div className="flex items-center gap-2.5 text-left min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/30 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-amber-100 font-serif-elegant truncate">
                    Espacio de Anuncio Google AdMob Vinculado
                  </p>
                  <p className="text-[10px] text-neutral-400 font-mono truncate">
                    ID Bloque: <span className="text-amber-300 font-semibold">{ADMOB_CONFIG.bannerAdUnitId}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400/90 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AdMob Activo</span>
                </span>
                <button
                  id="btn-copy-admob-data"
                  onClick={handleCopySnippet}
                  className="flex items-center gap-1 text-[10px] text-neutral-300 hover:text-amber-300 bg-neutral-800/80 hover:bg-neutral-700/80 px-2 py-1 rounded-lg border border-neutral-700 transition"
                  title="Copiar IDs de AdMob"
                >
                  {copiedSnippet ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar IDs</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Hidden/Measured ins element for Google Ads with explicit block styling */}
            <div className="w-full overflow-hidden flex justify-center mt-1">
              <ins
                ref={insRef}
                className="adsbygoogle"
                style={{
                  display: 'inline-block',
                  minWidth: '280px',
                  width: '100%',
                  maxWidth: '728px',
                  height: '50px',
                }}
                data-ad-client={ADMOB_CONFIG.publisherId}
                data-ad-slot={ADMOB_CONFIG.slotId}
              />
            </div>

            {/* Optional AdMob APK Integration Details */}
            {showTechDetails && (
              <div className="mt-2.5 p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between text-amber-300 font-semibold text-xs">
                  <span>Bloques AdMob Configurados:</span>
                  <span className="font-mono text-[10px] text-neutral-400">
                    Aperturas PDF: <strong className="text-amber-400">{pdfOpenCount}</strong> / 3
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[10px]">
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 block">Banner Ad Unit ID:</span>
                    <span className="text-amber-300 select-all break-all">{ADMOB_CONFIG.bannerAdUnitId}</span>
                  </div>
                  <div className="p-2 rounded bg-neutral-950 border border-amber-500/30">
                    <span className="text-amber-400 font-bold block">Intersticial (3ª apertura):</span>
                    <span className="text-amber-300 select-all break-all">{ADMOB_CONFIG.interstitialAdUnitId}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <p className="text-neutral-400 text-[10px] leading-relaxed max-w-sm">
                    El anuncio intersticial de pantalla completa se mostrará automáticamente al abrir el 3.er libro en PDF.
                  </p>
                  {onOpenInterstitialPreview && (
                    <button
                      id="btn-preview-interstitial-ad"
                      onClick={() => {
                        sounds.playClick(600);
                        onOpenInterstitialPreview();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-semibold transition"
                    >
                      Probar Intersticial Ahora
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
