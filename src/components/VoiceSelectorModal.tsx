import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Volume2,
  Check,
  Play,
  Square,
  Sparkles,
  User,
  Globe,
  Activity,
  Flame,
  ChevronDown,
} from 'lucide-react';
import { VoicePresetId, LanguageOption } from '../types';
import { VOICE_PRESETS, speechEngine, DEFAULT_LANGUAGE } from '../utils/speechEngine';
import { sounds } from '../utils/soundEffects';

interface VoiceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVoicePreset: VoicePresetId;
  onSelectVoicePreset: (presetId: VoicePresetId) => void;
  currentLanguage?: string;
  onSelectLanguage?: (langCode: string) => void;
  speed: number;
  onSpeedChange?: (speed: number) => void;
  smartRhythm?: boolean;
  onToggleSmartRhythm?: () => void;
}

const SAMPLE_GREETINGS: Record<string, { female: string; male: string }> = {
  es: {
    female: 'Hola, soy tu narradora en LectorZews. ¿Lo notas? Con comas y pausas bien medidas, la lectura cobra vida.',
    male: 'Hola, soy tu narrador en LectorZews. Con el Ritmo Inteligente, cada pausa y cada frase suenan con cadencia humana.',
  },
  en: {
    female: 'Hello! I am your narrator in LectorZews. With natural pacing, your audiobooks come alive.',
    male: 'Hello! I am your narrator in LectorZews. Enjoy clear and smooth narration in English.',
  },
  fr: {
    female: 'Bonjour, je suis votre narratrice dans LectorZews. Profitez d’une lecture fluide et naturelle.',
    male: 'Bonjour, je suis votre narrateur dans LectorZews. Écoute claire et reposante en français.',
  },
  de: {
    female: 'Hallo, ich bin Ihre Vorleserin in LectorZews. Natürlicher Sprachfluss für Ihre Bücher.',
    male: 'Hallo, ich bin Ihr Vorleser in LectorZews. Angenehmes und klares Vorlesen auf Deutsch.',
  },
  it: {
    female: 'Ciao, sono la tua narratrice in LectorZews. Una lettura fluida, chiara e rilassante.',
    male: 'Ciao, sono il tuo narratore in LectorZews. Con ritmo naturale per ogni libro in italiano.',
  },
  pt: {
    female: 'Olá, sou sua narradora no LectorZews. Uma leitura fluida, calorosa e agradável.',
    male: 'Olá, sou seu narrador no LectorZews. Ritmo inteligente e voz clara em português.',
  },
  ja: {
    female: 'こんにちは、LectorZewsのナレーターです。自然なリズムで読書をお楽しみください。',
    male: 'こんにちは、LectorZewsの朗読ナレーターです。快適な音声をお届けします。',
  },
  zh: {
    female: '您好，我是LectorZews的朗读者。自然生动的韵律，为您带来舒适的听书体验。',
    male: '您好，我是LectorZews的朗读者。为您提供沉浸且富有节奏感的朗读。',
  },
  ru: {
    female: 'Здравствуйте, я ваш диктор в LectorZews. Наслаждайтесь плавным и естественным чтением.',
    male: 'Здравствуйте, я ваш диктор в LectorZews. Чистый голос и естественный ритм чтения.',
  },
};

export const VoiceSelectorModal: React.FC<VoiceSelectorModalProps> = ({
  isOpen,
  onClose,
  currentVoicePreset,
  onSelectVoicePreset,
  currentLanguage = DEFAULT_LANGUAGE,
  onSelectLanguage,
  speed,
  onSpeedChange,
  smartRhythm = true,
  onToggleSmartRhythm,
}) => {
  const [previewingId, setPreviewingId] = useState<VoicePresetId | null>(null);
  const [showAllLanguages, setShowAllLanguages] = useState<boolean>(false);

  const availableLanguages: LanguageOption[] = useMemo(() => {
    return speechEngine.getAllAvailableLanguages();
  }, [isOpen]);

  const activeLangInfo = useMemo(() => {
    const found = availableLanguages.find(
      (l) => l.code.toLowerCase() === currentLanguage.toLowerCase()
    );
    return (
      found || {
        code: currentLanguage,
        name: currentLanguage.toUpperCase(),
        flag: '🌐',
        nativeName: currentLanguage,
      }
    );
  }, [availableLanguages, currentLanguage]);

  if (!isOpen) return null;

  const handlePreview = (presetId: VoicePresetId, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick(650);

    if (previewingId === presetId) {
      speechEngine.cancelCurrentSpeech();
      setPreviewingId(null);
      return;
    }

    speechEngine.cancelCurrentSpeech();
    setPreviewingId(presetId);

    const langGreetings = SAMPLE_GREETINGS[currentLanguage.toLowerCase()] || SAMPLE_GREETINGS.es;
    const sampleText =
      presetId === 'femenina' ? langGreetings.female : langGreetings.male;

    speechEngine.speak(sampleText, {
      presetId,
      speed,
      lang: currentLanguage,
      smartRhythm,
      onStart: () => setPreviewingId(presetId),
      onEnd: () => setPreviewingId(null),
      onError: () => setPreviewingId(null),
    });
  };

  const handleSelectPreset = (presetId: VoicePresetId) => {
    sounds.playVoiceChange();
    onSelectVoicePreset(presetId);
  };

  const handleSelectLang = (langCode: string) => {
    sounds.playClick(600);
    speechEngine.cancelCurrentSpeech();
    setPreviewingId(null);
    if (onSelectLanguage) {
      onSelectLanguage(langCode);
    }
  };

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  // Top quick languages
  const quickLanguages = availableLanguages.slice(0, 8);
  const otherLanguages = availableLanguages.slice(8);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm">
        {/* Backdrop click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            speechEngine.cancelCurrentSpeech();
            setPreviewingId(null);
            sounds.playClick(400);
            onClose();
          }}
          className="absolute inset-0"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-800/80 bg-stone-900/90 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-stone-100 font-serif tracking-wide">
                  Voces e Idiomas de Lectura
                </h2>
                <p className="text-xs text-stone-400">
                  Español predeterminado • Compatible con cualquier idioma
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                speechEngine.cancelCurrentSpeech();
                setPreviewingId(null);
                sounds.playClick(400);
                onClose();
              }}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800/70 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
            {/* Language Selector Section */}
            <div className="p-4 rounded-xl bg-stone-850/70 border border-stone-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-stone-200 uppercase tracking-wider">
                      Idioma de Narración
                    </span>
                    <p className="text-[11px] text-stone-400">
                      El sintetizador pronunciará con acento y fonética nativa.
                    </p>
                  </div>
                </div>

                {/* Default badge */}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {currentLanguage === 'es' ? '🇪🇸 Predeterminado' : `${activeLangInfo.flag} Activo`}
                </span>
              </div>

              {/* Quick Language Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickLanguages.map((lang) => {
                  const isSelected =
                    currentLanguage.toLowerCase() === lang.code.toLowerCase();
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLang(lang.code)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20 scale-[1.02]'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700/60'
                      }`}
                    >
                      <span className="text-sm leading-none">{lang.flag}</span>
                      <span>{lang.name}</span>
                      {lang.isDefault && !isSelected && (
                        <span className="text-[9px] opacity-75 font-mono">(Predet.)</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Toggle to view all detected system languages */}
              {otherLanguages.length > 0 && (
                <div className="pt-2 border-t border-stone-800/80">
                  <button
                    onClick={() => setShowAllLanguages(!showAllLanguages)}
                    className="flex items-center gap-1.5 text-xs text-amber-400/90 hover:text-amber-300 transition-colors"
                  >
                    <span>
                      {showAllLanguages
                        ? 'Ocultar idiomas adicionales'
                        : `Ver más idiomas del dispositivo (${otherLanguages.length} adicionales)`}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        showAllLanguages ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {showAllLanguages && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2.5 max-h-40 overflow-y-auto pr-1">
                      {otherLanguages.map((lang) => {
                        const isSelected =
                          currentLanguage.toLowerCase() === lang.code.toLowerCase();
                        return (
                          <button
                            key={lang.code}
                            onClick={() => handleSelectLang(lang.code)}
                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors text-left truncate ${
                              isSelected
                                ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300 font-semibold'
                                : 'bg-stone-800/60 hover:bg-stone-700/70 text-stone-300 border border-stone-800'
                            }`}
                          >
                            <span className="text-sm shrink-0">{lang.flag}</span>
                            <span className="truncate">{lang.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Voice Cards (Femenina & Masculina) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  Voz de Lectura ({activeLangInfo.name})
                </span>
                <span className="text-[11px] text-stone-400">
                  Calibración de timbre acústico
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['femenina', 'masculina'] as VoicePresetId[]).map((presetKey) => {
                  const preset = VOICE_PRESETS[presetKey];
                  const isSelected = currentVoicePreset === presetKey;
                  const isPlaying = previewingId === presetKey;

                  return (
                    <div
                      key={presetKey}
                      onClick={() => handleSelectPreset(presetKey)}
                      className={`relative cursor-pointer rounded-xl p-4 transition-all duration-200 flex flex-col justify-between border ${
                        isSelected
                          ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/30'
                          : 'bg-stone-800/40 hover:bg-stone-800/70 border-stone-800'
                      }`}
                    >
                      <div>
                        {/* Top row */}
                        <div className="flex items-center justify-between mb-2.5">
                          <span
                            className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-stone-700/50 text-stone-300 border border-stone-700'
                            }`}
                          >
                            {preset.badge}
                          </span>

                          {isSelected && (
                            <span className="flex items-center gap-1 text-xs font-medium text-amber-400">
                              <Check className="w-3.5 h-3.5" />
                              Activa
                            </span>
                          )}
                        </div>

                        {/* Name & Icon */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <div
                            className={`p-1.5 rounded-lg ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-stone-800 text-stone-400'
                            }`}
                          >
                            <User className="w-4 h-4" />
                          </div>
                          <h3 className="text-base font-semibold text-stone-100 font-serif">
                            {preset.name}
                          </h3>
                        </div>

                        <p className="text-xs text-stone-400 leading-relaxed min-h-[38px]">
                          {preset.description}
                        </p>
                      </div>

                      {/* Preview Button */}
                      <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => handlePreview(presetKey, e)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isPlaying
                              ? 'bg-amber-500 text-stone-950 font-semibold'
                              : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
                          }`}
                        >
                          {isPlaying ? (
                            <>
                              <Square className="w-3 h-3 fill-current" />
                              Detener
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current" />
                              Escuchar en {activeLangInfo.name}
                            </>
                          )}
                        </button>

                        <span className="text-[11px] text-stone-400 font-mono">
                          {preset.gender === 'female' ? 'Tono Suave' : 'Tono Grave'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Smart Rhythm (Ritmo Inteligente) Card */}
            <div className="p-4 rounded-xl bg-stone-850/60 border border-stone-800 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl border transition-colors ${
                      smartRhythm
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-stone-800 text-stone-400 border-stone-700'
                    }`}
                  >
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-stone-100 font-serif">
                        Ritmo Inteligente
                      </h4>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                          smartRhythm
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-stone-800 text-stone-400 border-stone-700'
                        }`}
                      >
                        {smartRhythm ? 'HUMANO' : 'FIJO'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Ajusta la velocidad y cadencia automáticamente según comas, puntos y preguntas en cualquier idioma.
                    </p>
                  </div>
                </div>

                {onToggleSmartRhythm && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick(smartRhythm ? 500 : 750);
                      onToggleSmartRhythm();
                    }}
                    className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      smartRhythm ? 'bg-amber-500 shadow-md shadow-amber-500/30' : 'bg-stone-700'
                    }`}
                    role="switch"
                    aria-checked={smartRhythm}
                    aria-label="Activar o desactivar Ritmo Inteligente"
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-stone-950 shadow-md ring-0 transition duration-200 ease-in-out ${
                        smartRhythm ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                )}
              </div>

              {smartRhythm && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2.5 border-t border-stone-800/80 text-[11px] text-stone-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>Comas e incisos: respiración natural</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>Preguntas: inflexión melódica</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Speed Controls */}
            {onSpeedChange && (
              <div className="pt-2 border-t border-stone-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-stone-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Velocidad de narración
                  </span>
                  <span className="text-xs font-mono font-semibold text-amber-400">
                    {speed.toFixed(2)}x
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {speedOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        sounds.playClick(500);
                        onSpeedChange(s);
                      }}
                      className={`flex-1 py-1.5 text-xs font-mono rounded-lg transition-all border ${
                        Math.abs(speed - s) < 0.05
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                          : 'bg-stone-800/50 border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sample Hint */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-stone-850 to-stone-800/50 border border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs text-stone-300">
                  ¿Quieres probar lectura en otro idioma?
                </span>
              </div>
              <span className="text-[11px] font-medium text-amber-400">
                Carga libros en inglés, francés, etc.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 bg-stone-900 border-t border-stone-800/80 flex items-center justify-between">
            <span className="text-xs text-stone-400">
              Idioma actual: <strong className="text-stone-200">{activeLangInfo.flag} {activeLangInfo.name}</strong>
            </span>
            <button
              onClick={() => {
                speechEngine.cancelCurrentSpeech();
                setPreviewingId(null);
                sounds.playClick(400);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium text-sm transition-colors shadow-sm"
            >
              Aceptar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
