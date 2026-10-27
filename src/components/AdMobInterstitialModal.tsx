import React, { useEffect, useState, useRef } from 'react';
import { ADMOB_CONFIG } from '../config/admob';
import {
  X,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Volume2,
  BookOpen,
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface AdMobInterstitialModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfTitle?: string;
  isTestPreview?: boolean;
}

export const AdMobInterstitialModal: React.FC<AdMobInterstitialModalProps> = ({
  isOpen,
  onClose,
  pdfTitle = 'Documento PDF',
  isTestPreview = false,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5);
  const [canClose, setCanClose] = useState<boolean>(false);
  const insRef = useRef<HTMLModElement>(null);
  const hasPushedRef = useRef<boolean>(false);

  // Timer countdown: 5 seconds before user can dismiss (standard AdMob Interstitial skip behavior)
  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(5);
      setCanClose(false);
      hasPushedRef.current = false;
      return;
    }

    setSecondsRemaining(5);
    setCanClose(false);

    // Audio chime on interstitial appearance
    sounds.playClick(900);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Try to trigger real Google Ads push safely if container has layout
    const timer = setTimeout(() => {
      if (hasPushedRef.current || !insRef.current) return;
      try {
        hasPushedRef.current = true;
        const w = window as unknown as { adsbygoogle?: Array<Record<string, unknown>> };
        w.adsbygoogle = w.adsbygoogle || [];
        w.adsbygoogle.push({});
      } catch {
        // TagError or unapproved domain handled gracefully
      }
    }, 400);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    sounds.playClick(600);
    onClose();
  };

  const progressPercent = Math.max(0, Math.min(100, ((5 - secondsRemaining) / 5) * 100));

  return (
    <div
      id="admob-interstitial-modal"
      className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-xl flex flex-col justify-between text-neutral-100 animate-fadeIn overflow-y-auto select-none"
    >
      {/* Top Countdown Bar & Dismiss Button */}
      <div className="w-full bg-neutral-900/90 border-b border-neutral-800 p-3 sm:px-6 relative">
        {/* Animated Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] uppercase tracking-wider">
              Anuncio Intersticial
            </span>
            <span className="font-semibold text-neutral-300 text-xs sm:text-sm truncate">
              Google AdMob · Pantalla Completa
            </span>
            {isTestPreview && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono">
                Modo Prueba
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!canClose ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800/80 text-neutral-400 text-xs font-mono border border-neutral-700">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Cerrar en {secondsRemaining}s</span>
              </div>
            ) : (
              <button
                id="btn-close-interstitial-top"
                onClick={handleDismiss}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition shadow-lg shadow-amber-500/20 active:scale-95 animate-pulse"
              >
                <span>Continuar al PDF</span>
                <X className="w-4 h-4 text-neutral-950 stroke-[3]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Interstitial Ad Body */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center items-center">
        {/* AdMob Notice Badge */}
        <div className="mb-3 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {isTestPreview
              ? 'Vista previa del anuncio intersticial de AdMob'
              : '¡Tercera apertura de PDF detectada! Anuncio intersticial activo'}
          </span>
        </div>

        {/* Big Sponsor Ad Card (Realistic AdMob Interstitial Layout) */}
        <div className="w-full rounded-3xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 shadow-2xl p-5 sm:p-8 flex flex-col items-center text-center relative overflow-hidden">
          {/* Ambient golden halo */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Ad Creative Icon */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 via-amber-600/30 to-amber-800/40 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-xl mb-4 relative">
            <BookOpen className="w-10 h-10 text-amber-400" />
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-neutral-950">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold font-title text-neutral-100 max-w-md">
            LectorZews Premium & AudioBooks
          </h3>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1.5 max-w-md leading-relaxed">
            Disfruta de la mejor experiencia de lectura en segundo plano con modulación de voz natural y temporizador inteligente.
          </p>

          {/* Real Google Ads ins element slot for interstitial */}
          <div className="w-full my-4 min-h-[60px] flex items-center justify-center overflow-hidden">
            <ins
              ref={insRef}
              className="adsbygoogle"
              style={{
                display: 'block',
                width: '100%',
                maxWidth: '600px',
                height: '60px',
              }}
              data-ad-client={ADMOB_CONFIG.publisherId}
              data-ad-slot={ADMOB_CONFIG.interstitialSlotId}
              data-ad-format="horizontal"
            />
          </div>

          {/* AdMob Configuration Meta */}
          <div className="w-full max-w-md p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 text-[11px] text-neutral-400 space-y-1 mb-5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-neutral-500">ID de Bloque Intersticial:</span>
              <span className="font-mono text-amber-300 font-semibold select-all">
                {ADMOB_CONFIG.interstitialAdUnitId}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-neutral-500">AdMob App ID:</span>
              <span className="font-mono text-neutral-300 select-all truncate ml-2">
                {ADMOB_CONFIG.appId}
              </span>
            </div>
          </div>

          {/* Sponsor Action Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <button
              id="btn-admob-interstitial-cta"
              onClick={() => {
                sounds.playPlay();
                // Opens developer link or official preview
                window.open('https://admob.google.com', '_blank');
              }}
              className="w-full flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm transition shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <span>Descubrir Más</span>
              <ExternalLink className="w-4 h-4 text-neutral-950" />
            </button>

            {canClose && (
              <button
                id="btn-admob-interstitial-skip"
                onClick={handleDismiss}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>Saltar Anuncio</span>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </button>
            )}
          </div>
        </div>

        {/* Document Ready Hint */}
        <p className="text-[11px] text-neutral-500 mt-4 text-center">
          Tu libro <strong className="text-amber-300/90 font-medium">"{pdfTitle}"</strong> está listo para ser leído tras cerrar este anuncio.
        </p>
      </div>

      {/* Bottom Bar */}
      <div className="w-full bg-neutral-900/90 border-t border-neutral-800 p-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Google AdMob Oficial</span>
          </div>

          <div>
            {canClose ? (
              <button
                id="btn-close-interstitial-bottom"
                onClick={handleDismiss}
                className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 cursor-pointer"
              >
                Abrir PDF ahora
              </button>
            ) : (
              <span className="text-neutral-500">
                Podrás saltar el anuncio en {secondsRemaining} segundos
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
