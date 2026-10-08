import React, { useEffect, useRef, useState } from 'react';
import { ADMOB_CONFIG } from '../config/admob';
import {
  X,
  ChevronDown,
  ChevronUp,
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
        className="relative overflow-hidden rounded-xl bg-neutral-950/80 backdrop-blur-md shadow-md transition-all text-neutral-200"
      >
        {/* Top Mini Header Bar */}
        <div className="flex items-center justify-between px-3 py-1 bg-neutral-900/60 text-[10px] text-neutral-400 select-none">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="px-1.5 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 text-[9px] uppercase tracking-wider shrink-0">
              Anuncio
            </span>
            <span className="font-semibold text-neutral-300 truncate text-[10px]">
              Patrocinado
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              id="btn-admob-toggle-minimize"
              onClick={() => {
                sounds.playTick();
                setIsMinimized(!isMinimized);
              }}
              className="p-1 rounded-md text-neutral-400 hover:text-amber-300 active:bg-neutral-800 transition"
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
              className="p-1 rounded-md text-neutral-400 hover:text-rose-400 active:bg-neutral-800 transition"
              title="Ocultar anuncio"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ad Unit Body */}
        {!isMinimized && (
          <div className="relative p-2 flex justify-center">
            {/* Measured ins element for Google Ads */}
            <div className="w-full overflow-hidden flex justify-center">
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
          </div>
        )}
      </div>
    </div>
  );
};
