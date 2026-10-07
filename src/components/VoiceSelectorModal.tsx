import React, { useState, useMemo, useEffect } from 'react';
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
  ChevronDown,
  Music,
  CloudRain,
  BookOpen,
  VolumeX,
  Sliders,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { VoicePresetId, LanguageOption, AmbientTrackId } from '../types';
import { VOICE_PRESETS, speechEngine, DEFAULT_LANGUAGE } from '../utils/speechEngine';
import { sounds } from '../utils/soundEffects';
import { ambientAudioService, AMBIENT_TRACKS } from '../utils/ambientAudio';

interface VoiceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVoicePreset: VoicePresetId;
  onSelectVoicePreset: (presetId: VoicePresetId) => void;
  selectedVoiceURI: string | null;
  onSelectVoiceURI: (voiceURI: string | null) => void;
  currentLanguage?: string;
  onSelectLanguage?: (langCode: string) => void;
  speed: number;
  onSpeedChange?: (speed: number) => void;
  smartRhythm?: boolean;
  onToggleSmartRhythm?: () => void;
  ambientTrack: AmbientTrackId;
  onSelectAmbientTrack: (track: AmbientTrackId) => void;
  ambientVolume: number;
  onAmbientVolumeChange: (vol: number) => void;
}

export const VoiceSelectorModal: React.FC<VoiceSelectorModalProps> = ({
  isOpen,
  onClose,
  currentVoicePreset,
  onSelectVoicePreset,
  selectedVoiceURI,
  onSelectVoiceURI,
  currentLanguage = DEFAULT_LANGUAGE,
  onSelectLanguage,
  speed,
  onSpeedChange,
  smartRhythm = true,
  onToggleSmartRhythm,
  ambientTrack,
  onSelectAmbientTrack,
  ambientVolume,
  onAmbientVolumeChange,
}) => {
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [previewingAmbient, setPreviewingAmbient] = useState<AmbientTrackId | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [scannedVoicesList, setScannedVoicesList] = useState(() => speechEngine.getScannedVoices());
  const [showAllLanguages, setShowAllLanguages] = useState<boolean>(false);

  // Scan voices reactively and subscribe to system changes
  useEffect(() => {
    if (!isOpen) return;

    const refresh = () => {
      setScannedVoicesList(speechEngine.getScannedVoices());
    };

    refresh();
    const unsub = speechEngine.onVoicesChanged(refresh);

    // Periodic check for delayed browser voice engines (e.g. Chrome / Android)
    const t1 = setTimeout(refresh, 200);
    const t2 = setTimeout(refresh, 800);
    const t3 = setTimeout(refresh, 1800);

    return () => {
      unsub();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen]);

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

  // Filtered scanned voices
  const filteredVoices = useMemo(() => {
    if (!searchTerm.trim()) return scannedVoicesList;
    const term = searchTerm.toLowerCase().trim();
    return scannedVoicesList.filter(
      (item) =>
        item.label.toLowerCase().includes(term) ||
        item.langName.toLowerCase().includes(term) ||
        item.voice.name.toLowerCase().includes(term)
    );
  }, [scannedVoicesList, searchTerm]);

  // Grouped into Spanish vs Other languages
  const spanishVoices = useMemo(() => {
    return filteredVoices.filter((v) => v.isSpanish);
  }, [filteredVoices]);

  const otherVoices = useMemo(() => {
    return filteredVoices.filter((v) => !v.isSpanish);
  }, [filteredVoices]);

  if (!isOpen) return null;

  // Stop any active previews when closing or switching
  const stopAllPreviews = () => {
    speechEngine.cancelCurrentSpeech();
    setPreviewingId(null);
    if (previewingAmbient) {
      ambientAudioService.stop();
      setPreviewingAmbient(null);
    }
  };

  const handleModalClose = () => {
    stopAllPreviews();
    sounds.playClick(400);
    onClose();
  };

  // Preview Voice Preset (Femenina or Masculina)
  const handlePreviewPreset = (presetId: VoicePresetId, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick(650);

    if (previewingId === presetId) {
      speechEngine.cancelCurrentSpeech();
      setPreviewingId(null);
      return;
    }

    speechEngine.cancelCurrentSpeech();
    setPreviewingId(presetId);

    const sampleText =
      presetId === 'femenina'
        ? 'Hola, soy tu narradora en LectorZews. ¿Lo notas? Con comas y pausas bien medidas, la lectura cobra vida.'
        : 'Hola, soy tu narrador en LectorZews. Con el Ritmo Inteligente, cada pausa y cada frase suenan con cadencia humana.';

    speechEngine.speak(sampleText, {
      presetId,
      voiceURI: null, // Test preset calibration
      speed,
      lang: currentLanguage,
      smartRhythm,
      onStart: () => setPreviewingId(presetId),
      onEnd: () => setPreviewingId(null),
      onError: () => setPreviewingId(null),
    });
  };

  // Preview Specific Scanned Voice
  const handlePreviewSpecificVoice = (voiceURI: string, voiceName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick(650);

    if (previewingId === voiceURI) {
      speechEngine.cancelCurrentSpeech();
      setPreviewingId(null);
      return;
    }

    speechEngine.cancelCurrentSpeech();
    setPreviewingId(voiceURI);

    const sampleText = `Hola, esta es una prueba de mi voz (${voiceName}) en LectorZews. ¿Cómo se escucha esta entonación?`;

    speechEngine.speak(sampleText, {
      voiceURI,
      speed,
      lang: currentLanguage,
      smartRhythm,
      onStart: () => setPreviewingId(voiceURI),
      onEnd: () => setPreviewingId(null),
      onError: () => setPreviewingId(null),
    });
  };

  // Select Preset Voice (resets specific URI)
  const handleSelectPreset = (presetId: VoicePresetId) => {
    sounds.playVoiceChange();
    onSelectVoicePreset(presetId);
    onSelectVoiceURI(null);
  };

  // Select Specific Scanned Voice
  const handleSelectSpecificVoice = (voiceURI: string | null) => {
    sounds.playVoiceChange();
    onSelectVoiceURI(voiceURI);
  };

  // Ambient Instrumental Preview
  const handleTogglePreviewAmbient = (trackId: AmbientTrackId, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick(500);

    if (previewingAmbient === trackId) {
      ambientAudioService.stop();
      setPreviewingAmbient(null);
      return;
    }

    if (trackId === 'none') {
      ambientAudioService.stop();
      setPreviewingAmbient(null);
      return;
    }

    ambientAudioService.setVolume(ambientVolume);
    ambientAudioService.setTrack(trackId);
    ambientAudioService.start();
    setPreviewingAmbient(trackId);
  };

  // Ambient Instrumental Select
  const handleSelectAmbient = (trackId: AmbientTrackId) => {
    sounds.playClick(600);
    onSelectAmbientTrack(trackId);
    ambientAudioService.setTrack(trackId);
    ambientAudioService.setVolume(ambientVolume);
  };

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
  const quickLanguages = availableLanguages.slice(0, 8);
  const otherLanguages = availableLanguages.slice(8);

  const currentlyChosenVoice = scannedVoicesList.find(
    (v) => v.voice.voiceURI === selectedVoiceURI || v.voice.name === selectedVoiceURI
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
        {/* Backdrop click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleModalClose}
          className="absolute inset-0"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-neutral-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 max-h-[92vh] text-neutral-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-title text-neutral-100">
                  Selector de Voces e Instrumentales
                </h2>
                <p className="text-xs text-neutral-400">
                  Escanea las voces de tu dispositivo y personaliza música de fondo
                </p>
              </div>
            </div>

            <button
              onClick={handleModalClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-7 space-y-6 overflow-y-auto">
            {/* SECTION 1: MENÚ DESPLEGABLE / SELECTOR DE TODAS LAS VOCES DISPONIBLES */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-neutral-950 to-neutral-950 border-2 border-amber-500/40 shadow-xl space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-amber-300">
                      Menú Desplegable de Voces del Dispositivo
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Elige directamente entre todas las voces instaladas en tu sistema o navegador
                    </p>
                  </div>
                </div>

                <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 whitespace-nowrap">
                  🎙️ {scannedVoicesList.length} voces detectadas
                </span>
              </div>

              {/* Native Dropdown Selector <select> */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                  <span>Seleccionar voz activa para narración:</span>
                  {selectedVoiceURI && (
                    <button
                      type="button"
                      onClick={() => handleSelectSpecificVoice(null)}
                      className="text-[10px] text-amber-400 hover:text-amber-300 underline font-medium"
                    >
                      Volver a preset automático
                    </button>
                  )}
                </label>

                <div className="relative">
                  <select
                    id="dropdown-device-voices"
                    value={selectedVoiceURI || 'preset_auto'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'preset_auto') {
                        handleSelectSpecificVoice(null);
                      } else {
                        handleSelectSpecificVoice(val);
                      }
                    }}
                    className="w-full appearance-none px-3.5 py-3 rounded-xl bg-neutral-900 border border-amber-500/50 text-neutral-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 pr-10 cursor-pointer shadow-inner"
                  >
                    <option value="preset_auto" className="bg-neutral-900 text-amber-300 font-bold py-1">
                      ✨ Calibración Automática Recomendada ({currentVoicePreset === 'femenina' ? 'Voz Femenina' : 'Voz Masculina'})
                    </option>

                    {spanishVoices.length > 0 && (
                      <optgroup label="🇪🇸 Voces en Español Detectadas (Recomendadas)" className="bg-neutral-900 font-semibold text-amber-400">
                        {spanishVoices.map((v) => (
                          <option
                            key={v.voice.voiceURI || v.voice.name}
                            value={v.voice.voiceURI || v.voice.name}
                            className="bg-neutral-900 text-neutral-100 font-normal py-1"
                          >
                            {v.label}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {otherVoices.length > 0 && (
                      <optgroup label="🌐 Otras Voces del Sistema / Internacionales" className="bg-neutral-900 font-semibold text-neutral-400">
                        {otherVoices.map((v) => (
                          <option
                            key={v.voice.voiceURI || v.voice.name}
                            value={v.voice.voiceURI || v.voice.name}
                            className="bg-neutral-900 text-neutral-100 font-normal py-1"
                          >
                            {v.label}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>

                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-amber-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Active Voice Info & Live Preview Button */}
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <p className="text-xs font-semibold text-neutral-200 truncate">
                      {selectedVoiceURI
                        ? `Voz Seleccionada: ${currentlyChosenVoice?.label || selectedVoiceURI}`
                        : `Voz Automática Activa: ${currentVoicePreset === 'femenina' ? 'Narradora Femenina' : 'Narrador Masculino'}`}
                    </p>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {selectedVoiceURI
                      ? `Idioma: ${currentlyChosenVoice?.langName || 'Detectado'}`
                      : 'Modulación de pitch acústico con ritmo inteligente'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      if (selectedVoiceURI) {
                        handlePreviewSpecificVoice(
                          selectedVoiceURI,
                          currentlyChosenVoice?.label || selectedVoiceURI,
                          e
                        );
                      } else {
                        handlePreviewPreset(currentVoicePreset, e);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-md active:scale-95 ${
                      previewingId
                        ? 'bg-amber-400 text-neutral-950 shadow-amber-400/30'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950'
                    }`}
                  >
                    {previewingId ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Detener prueba</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Probar cómo suena</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Optional Search filter if many voices exist */}
              {scannedVoicesList.length > 5 && (
                <div className="pt-1">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Filtrar voces por nombre o país (ej. México, España, Google, Helena)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: 2 INSTRUMENTALES AMBIENTALES DE FONDO INMERSIVO */}
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-emerald-500/40 shadow-lg space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-emerald-300">
                      Instrumentales Ambientales de Fondo Inmersivo
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Música relajante y paisajes sonoros mientras se reproduce cualquier PDF
                    </p>
                  </div>
                </div>

                <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 whitespace-nowrap">
                  2 Pistas Disponibles
                </span>
              </div>

              {/* Ambient Instrumental Cards Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {AMBIENT_TRACKS.map((track) => {
                  const isSelected = ambientTrack === track.id;
                  const isTrackPreviewing = previewingAmbient === track.id;

                  return (
                    <div
                      key={track.id}
                      onClick={() => handleSelectAmbient(track.id)}
                      className={`relative cursor-pointer rounded-xl p-3.5 transition-all duration-200 flex flex-col justify-between border ${
                        isSelected
                          ? 'bg-emerald-950/30 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/40'
                          : 'bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800'
                      }`}
                    >
                      <div>
                        {/* Top row */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                            }`}
                          >
                            {track.badge}
                          </span>

                          {isSelected && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Activo
                            </span>
                          )}
                        </div>

                        {/* Title & Icon */}
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`p-1.5 rounded-lg ${
                              isSelected
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {track.id === 'biblioteca' ? (
                              <BookOpen className="w-3.5 h-3.5" />
                            ) : track.id === 'lluvia' ? (
                              <CloudRain className="w-3.5 h-3.5" />
                            ) : (
                              <VolumeX className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-neutral-100 truncate">
                            {track.name}
                          </h4>
                        </div>

                        <p className="text-[11px] text-neutral-400 leading-relaxed min-h-[36px]">
                          {track.description}
                        </p>
                      </div>

                      {/* Preview Button (except for 'none') */}
                      {track.id !== 'none' ? (
                        <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={(e) => handleTogglePreviewAmbient(track.id, e)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                              isTrackPreviewing
                                ? 'bg-emerald-400 text-neutral-950'
                                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                            }`}
                          >
                            {isTrackPreviewing ? (
                              <>
                                <Square className="w-2.5 h-2.5 fill-current" />
                                <span>Pausar</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-2.5 h-2.5 fill-current" />
                                <span>Escuchar pista</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3 pt-2.5 border-t border-neutral-800 text-[10px] text-neutral-500 italic">
                          Sin música ambiental
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Volume Slider for Ambient Instrumentals */}
              {ambientTrack !== 'none' && (
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-xs font-semibold text-neutral-200">
                        Volumen del Instrumental de Fondo:
                      </span>
                      <p className="text-[10px] text-neutral-400">
                        Nivel calibrado suave para no tapar la voz de la lectura
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.05"
                      max="1.0"
                      step="0.05"
                      value={ambientVolume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onAmbientVolumeChange(val);
                        ambientAudioService.setVolume(val);
                      }}
                      className="w-32 accent-emerald-400 cursor-pointer"
                    />
                    <span className="font-mono text-xs font-bold text-emerald-400 w-9 text-right">
                      {Math.round(ambientVolume * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: PRESETS RÁPIDOS (FEMENINA Y MASCULINA) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Presets de Timbre Rápido
                </span>
                <span className="text-[11px] text-neutral-400">
                  Optimización de agudos y graves
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['femenina', 'masculina'] as VoicePresetId[]).map((presetKey) => {
                  const preset = VOICE_PRESETS[presetKey];
                  const isSelected = !selectedVoiceURI && currentVoicePreset === presetKey;
                  const isPlaying = previewingId === presetKey;

                  return (
                    <div
                      key={presetKey}
                      onClick={() => handleSelectPreset(presetKey)}
                      className={`relative cursor-pointer rounded-xl p-4 transition-all duration-200 flex flex-col justify-between border ${
                        isSelected
                          ? 'bg-amber-950/30 border-amber-500/50 shadow-lg ring-1 ring-amber-500/30'
                          : 'bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                            }`}
                          >
                            {preset.badge}
                          </span>

                          {isSelected && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                              <Check className="w-3.5 h-3.5" />
                              Activo
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-1.5">
                          <div
                            className={`p-1.5 rounded-lg ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            <User className="w-4 h-4" />
                          </div>
                          <h4 className="text-base font-semibold text-neutral-100 font-serif">
                            {preset.name}
                          </h4>
                        </div>

                        <p className="text-xs text-neutral-400 leading-relaxed min-h-[38px]">
                          {preset.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => handlePreviewPreset(presetKey, e)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            isPlaying
                              ? 'bg-amber-500 text-neutral-950 font-bold'
                              : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                          }`}
                        >
                          {isPlaying ? (
                            <>
                              <Square className="w-3 h-3 fill-current" />
                              <span>Detener</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current" />
                              <span>Escuchar muestra</span>
                            </>
                          )}
                        </button>

                        <span className="text-[11px] text-neutral-400 font-mono">
                          {preset.gender === 'female' ? 'Tono Suave' : 'Tono Grave'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 4: IDIOMA & VELOCIDAD */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                      Idioma de Narración
                    </span>
                    <p className="text-[11px] text-neutral-400">
                      Español por defecto • Compatible con libros multilingües
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {currentLanguage === 'es' ? '🇪🇸 Predeterminado' : `${activeLangInfo.flag} Activo`}
                </span>
              </div>

              {/* Quick Language Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickLanguages.map((lang) => {
                  const isSelected = currentLanguage.toLowerCase() === lang.code.toLowerCase();
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        sounds.playClick(600);
                        stopAllPreviews();
                        onSelectLanguage?.(lang.code);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                        isSelected
                          ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700/60'
                      }`}
                    >
                      <span className="text-sm leading-none">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  );
                })}
              </div>

              {otherLanguages.length > 0 && (
                <div className="pt-2 border-t border-neutral-800">
                  <button
                    onClick={() => setShowAllLanguages(!showAllLanguages)}
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300"
                  >
                    <span>
                      {showAllLanguages
                        ? 'Ocultar idiomas adicionales'
                        : `Ver más idiomas (${otherLanguages.length} adicionales)`}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllLanguages ? 'rotate-180' : ''}`} />
                  </button>

                  {showAllLanguages && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2 max-h-36 overflow-y-auto pr-1">
                      {otherLanguages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            sounds.playClick(600);
                            stopAllPreviews();
                            onSelectLanguage?.(lang.code);
                          }}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-left truncate"
                        >
                          <span>{lang.flag}</span>
                          <span className="truncate">{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Smart Rhythm Card */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl border transition-colors ${
                    smartRhythm
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-semibold text-neutral-100 font-serif">
                      Ritmo Inteligente
                    </h4>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                        smartRhythm
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      {smartRhythm ? 'HUMANO' : 'FIJO'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Modula respiraciones y entonación en comas y signos de interrogación.
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
                    smartRhythm ? 'bg-amber-500 shadow-md shadow-amber-500/30' : 'bg-neutral-700'
                  }`}
                  role="switch"
                  aria-checked={smartRhythm}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-neutral-950 shadow-md ring-0 transition duration-200 ease-in-out ${
                      smartRhythm ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              )}
            </div>

            {/* Quick Speed Controls */}
            {onSpeedChange && (
              <div className="pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Velocidad de narración
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">
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
                          : 'bg-neutral-800/60 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              Voz activa: <strong className="text-amber-300">{currentlyChosenVoice?.label || (currentVoicePreset === 'femenina' ? 'Femenina' : 'Masculina')}</strong>
              {ambientTrack !== 'none' && (
                <span className="ml-2 text-emerald-400">• Música: {ambientTrack === 'biblioteca' ? 'Biblioteca' : 'Lluvia'}</span>
              )}
            </span>
            <button
              onClick={handleModalClose}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs sm:text-sm transition shadow-md active:scale-95"
            >
              Aplicar y Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
