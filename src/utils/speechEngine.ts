import { VoicePreset, VoicePresetId, LanguageOption } from '../types';

export const DEFAULT_LANGUAGE = 'es';

export const VOICE_PRESETS: Record<VoicePresetId, VoicePreset> = {
  femenina: {
    id: 'femenina',
    name: 'Voz Femenina',
    badge: 'Narradora',
    description: 'Voz suave, clara y expresiva. Ideal para una lectura fluida, cálida y descansada.',
    pitch: 1.20,
    rateMultiplier: 1.0,
    gender: 'female',
  },
  masculina: {
    id: 'masculina',
    name: 'Voz Masculina',
    badge: 'Narrador',
    description: 'Voz cálida, profunda y sobria. Excelente modulación y presencia acústica.',
    pitch: 0.78,
    rateMultiplier: 0.96,
    gender: 'male',
  },
};

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸', fullCode: 'es-ES', isDefault: true },
  { code: 'en', name: 'Inglés', nativeName: 'English', flag: '🇺🇸', fullCode: 'en-US' },
  { code: 'fr', name: 'Francés', nativeName: 'Français', flag: '🇫🇷', fullCode: 'fr-FR' },
  { code: 'de', name: 'Alemán', nativeName: 'Deutsch', flag: '🇩🇪', fullCode: 'de-DE' },
  { code: 'it', name: 'Italiano', nativeName: 'Italiano', flag: '🇮🇹', fullCode: 'it-IT' },
  { code: 'pt', name: 'Portugués', nativeName: 'Português', flag: '🇧🇷', fullCode: 'pt-BR' },
  { code: 'ja', name: 'Japonés', nativeName: '日本語', flag: '🇯🇵', fullCode: 'ja-JP' },
  { code: 'zh', name: 'Chino', nativeName: '中文', flag: '🇨🇳', fullCode: 'zh-CN' },
  { code: 'ru', name: 'Ruso', nativeName: 'Русский', flag: '🇷🇺', fullCode: 'ru-RU' },
  { code: 'ko', name: 'Coreano', nativeName: '한국어', flag: '🇰🇷', fullCode: 'ko-KR' },
  { code: 'nl', name: 'Holandés', nativeName: 'Nederlands', flag: '🇳🇱', fullCode: 'nl-NL' },
  { code: 'pl', name: 'Polaco', nativeName: 'Polski', flag: '🇵🇱', fullCode: 'pl-PL' },
  { code: 'sv', name: 'Sueco', nativeName: 'Svenska', flag: '🇸🇪', fullCode: 'sv-SE' },
  { code: 'tr', name: 'Turco', nativeName: 'Türkçe', flag: '🇹🇷', fullCode: 'tr-TR' },
  { code: 'ar', name: 'Árabe', nativeName: 'العربية', flag: '🇸🇦', fullCode: 'ar-SA' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', fullCode: 'hi-IN' },
  { code: 'el', name: 'Griego', nativeName: 'Ελληνικά', flag: '🇬🇷', fullCode: 'el-GR' },
  { code: 'ca', name: 'Catalán', nativeName: 'Català', flag: '🇪🇸', fullCode: 'ca-ES' },
  { code: 'eu', name: 'Euskera', nativeName: 'Euskara', flag: '🇪🇸', fullCode: 'eu-ES' },
  { code: 'gl', name: 'Gallego', nativeName: 'Galego', flag: '🇪🇸', fullCode: 'gl-ES' },
];

export const FEMALE_VOICE_KEYWORDS: string[] = [
  'female',
  'femenin',
  'mujer',
  'woman',
  'helena',
  'laura',
  'monica',
  'mónica',
  'paulina',
  'lucia',
  'lucía',
  'sabina',
  'dalia',
  'elvira',
  'salome',
  'salomé',
  'paloma',
  'daniela',
  'maría',
  'maria',
  'carmen',
  'rosa',
  'sofia',
  'sofía',
  'victoria',
  'mia',
  'mía',
  'camila',
  'valentina',
  'isabella',
  'andrea',
  'penelope',
  'penélope',
  'hilda',
  'francisca',
  'marina',
  'alicia',
  'esperanza',
  'conchita',
  'juana',
  'catalina',
  'teresa',
  'irene',
  'ana',
  'lourdes',
  'lupe',
  'patricia',
  'clara',
  'elena',
  'esmeralda',
  'zira',
];

export const MALE_VOICE_KEYWORDS: string[] = [
  'male',
  'masculin',
  'hombre',
  'man',
  'pablo',
  'miguel',
  'diego',
  'jorge',
  'carlos',
  'gonzalo',
  'alvaro',
  'álvaro',
  'juan',
  'manuel',
  'antonio',
  'enrique',
  'pedro',
  'alberto',
  'fernando',
  'javier',
  'david',
  'raul',
  'raúl',
  'mario',
  'mateo',
  'lucas',
  'gabriel',
  'alejandro',
  'sergio',
  'rodrigo',
  'adrian',
  'adrián',
  'hugo',
  'ignacio',
  'ramon',
  'ramón',
  'hector',
  'héctor',
  'jose',
  'josé',
  'alonso',
  'luis',
  'andres',
  'andrés',
  'emilio',
  'marcos',
  'julio',
  'cesar',
  'césar',
  'david',
  'tomas',
  'tomás',
  'guillermo',
];

export interface SpeakOptions {
  presetId?: VoicePresetId;
  speed?: number;
  lang?: string;
  isSequential?: boolean;
  smartRhythm?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Heurística de detección automática de idioma para libros o textos subidos.
 * Por defecto devuelve 'es' (Español).
 */
export function detectLanguage(text: string): string {
  if (!text || text.trim().length === 0) return 'es';
  const clean = text.toLowerCase();

  // Caracteres y alfabetos no latinos
  if (/[\u3040-\u30ff]/.test(clean)) return 'ja'; // Japonés
  if (/[\u4e00-\u9fa5]/.test(clean)) return 'zh'; // Chino
  if (/[\uac00-\ud7af]/.test(clean)) return 'ko'; // Coreano
  if (/[\u0400-\u04ff]/.test(clean)) return 'ru'; // Ruso (Cirílico)
  if (/[\u0600-\u06ff]/.test(clean)) return 'ar'; // Árabe
  if (/[\u0900-\u097f]/.test(clean)) return 'hi'; // Hindi (Devanagari)

  const esMatches = (clean.match(/\b(el|la|los|las|de|del|en|para|por|con|una|uno|unos|unas|que|es|son|había|más|pero|este|esta|al|su|sus|como)\b/gi) || []).length;
  const enMatches = (clean.match(/\b(the|and|of|to|in|is|that|for|it|as|was|with|are|be|this|from|at|have|not|you|his|her|which|they|by)\b/gi) || []).length;
  const frMatches = (clean.match(/\b(le|la|les|des|du|dans|un|une|pour|avec|sur|sont|est|que|qui|ce|cette|pas|mais|nous|vous)\b/gi) || []).length;
  const deMatches = (clean.match(/\b(der|die|das|und|in|den|von|zu|mit|ist|im|dem|nicht|eine|einer|auf|des|sich|sie|ein|es)\b/gi) || []).length;
  const itMatches = (clean.match(/\b(di|il|la|in|che|per|del|dei|con|non|ed|da|sono|un|una|uno|della|degli|nel|gli)\b/gi) || []).length;
  const ptMatches = (clean.match(/\b(de|da|do|dos|das|em|um|uma|para|com|não|os|as|no|na|se|por|mais|como|que|ele)\b/gi) || []).length;

  const scores = [
    { lang: 'es', score: esMatches * 1.15 }, // Predeterminado: español
    { lang: 'en', score: enMatches },
    { lang: 'fr', score: frMatches },
    { lang: 'de', score: deMatches },
    { lang: 'it', score: itMatches },
    { lang: 'pt', score: ptMatches },
  ];

  scores.sort((a, b) => b.score - a.score);
  if (scores[0].score >= 3) {
    return scores[0].lang;
  }
  return 'es';
}

/**
 * Ritmo Inteligente:
 * Modula la cadencia acústica (rate) y la inflexión tonal (pitch) de acuerdo
 * a la estructura de puntuación (comas, dos puntos, puntos, preguntas y exclamaciones),
 * logrando una narración mucho más humana, viva y expresiva.
 */
export function computeSmartRhythm(
  text: string,
  baseSpeed: number,
  basePitch: number
): {
  rate: number;
  pitch: number;
  processedText: string;
} {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Puntuaciones
  const commaCount = (trimmed.match(/,/g) || []).length;
  const semicolonCount = (trimmed.match(/;/g) || []).length;
  const colonCount = (trimmed.match(/:/g) || []).length;
  const questionCount = (trimmed.match(/[¿?]/g) || []).length;
  const exclamationCount = (trimmed.match(/[¡!]/g) || []).length;
  const isDialogue = /^[-—–«"“]/.test(trimmed) || /[-—–]/.test(trimmed);

  let speedFactor = 1.0;
  let pitchOffset = 0.0;

  // 1. Preguntas (inflexión ascendente e inquisitiva sutil)
  if (questionCount > 0) {
    speedFactor *= 0.96;
    pitchOffset += 0.05;
  }

  // 2. Exclamaciones y suspenso vivo (mayor convicción y vivacidad)
  if (exclamationCount > 0) {
    speedFactor *= 1.05;
    pitchOffset += 0.03;
  }

  // 3. Cláusulas densas con comas (enumeraciones o incisos)
  const punctuationCount = commaCount + semicolonCount + colonCount;
  const punctuationDensity = punctuationCount / Math.max(1, wordCount);

  if (punctuationDensity >= 0.16) {
    // Alta densidad de comas/incisos: ritmo pausado para que el oyente respire cada cláusula
    speedFactor *= 0.92;
  } else if (punctuationDensity >= 0.08) {
    // Densidad media de comas
    speedFactor *= 0.96;
  } else if (wordCount >= 18 && punctuationCount === 0) {
    // Cláusula larga y continua sin comas: ritmo más dinámico para no aplanar la voz
    speedFactor *= 1.05;
  } else if (wordCount <= 4 && questionCount === 0 && exclamationCount === 0) {
    // Frase muy concisa: ritmo firme y deliberado
    speedFactor *= 0.96;
  }

  // 4. Diálogo de personajes
  if (isDialogue && questionCount === 0 && exclamationCount === 0) {
    speedFactor *= 0.98;
    pitchOffset += 0.02;
  }

  // Asegurar espaciado prolijo tras signos para que el motor TTS ejecute micro-pausas naturales
  const processedText = trimmed
    .replace(/,([^\s\d])/g, ', $1')
    .replace(/\.([^\s\d])/g, '. $1')
    .replace(/;([^\s])/g, '; $1')
    .replace(/:([^\s])/g, ': $1');

  return {
    rate: Math.max(0.5, Math.min(2.0, baseSpeed * speedFactor)),
    pitch: Math.max(0.4, Math.min(1.8, basePitch + pitchOffset)),
    processedText,
  };
}

declare global {
  interface Window {
    AndroidTTS?: {
      isAvailable: () => boolean;
      speak: (text: string, rate: number, pitch: number, langCode: string, utteranceId: string) => void;
      stop: () => void;
      isSpeaking: () => boolean;
      getVoicesJson: () => string;
    };
    __onAndroidTTSStart?: (utteranceId: string) => void;
    __onAndroidTTSDone?: (utteranceId: string) => void;
    __onAndroidTTSError?: (utteranceId: string, error: string) => void;
    __onAndroidTTSReady?: () => void;
  }
}

export class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingActive: boolean = false;
  private isPausedState: boolean = false;
  private keepAliveInterval: number | null = null;
  private watchdogTimeout: number | null = null;
  private dispatchTimeout: number | null = null;
  private activeUtteranceRetainer: Set<SpeechSynthesisUtterance> = new Set();
  private androidCallbacks: Map<
    string,
    { onStart?: () => void; onEnd?: () => void; onError?: (err: unknown) => void }
  > = new Map();
  private currentAndroidUttId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
      this.initVoices();
      this.initAndroidBridge();
    }
  }

  private initAndroidBridge() {
    if (typeof window === 'undefined') return;

    window.__onAndroidTTSStart = (id: string) => {
      this.isSpeakingActive = true;
      this.isPausedState = false;
      const cb = this.androidCallbacks.get(id);
      cb?.onStart?.();
    };

    window.__onAndroidTTSDone = (id: string) => {
      this.isSpeakingActive = false;
      this.isPausedState = false;
      const cb = this.androidCallbacks.get(id);
      this.androidCallbacks.delete(id);
      if (this.currentAndroidUttId === id) {
        this.currentAndroidUttId = null;
      }
      cb?.onEnd?.();
    };

    window.__onAndroidTTSError = (id: string, error: string) => {
      this.isSpeakingActive = false;
      this.isPausedState = false;
      const cb = this.androidCallbacks.get(id);
      this.androidCallbacks.delete(id);
      if (this.currentAndroidUttId === id) {
        this.currentAndroidUttId = null;
      }
      cb?.onError?.(new Error(error || 'Error en síntesis nativa'));
    };

    window.__onAndroidTTSReady = () => {
      this.initVoices();
    };
  }

  private initVoices() {
    const fetchVoices = () => {
      let voiceList: SpeechSynthesisVoice[] = [];
      if (this.synth) {
        try {
          const list = this.synth.getVoices();
          if (list && list.length > 0) {
            voiceList = list;
          }
        } catch {}
      }

      // Check if native AndroidTTS provides installed voices
      if (typeof window !== 'undefined' && window.AndroidTTS) {
        try {
          if (window.AndroidTTS.isAvailable()) {
            const jsonStr = window.AndroidTTS.getVoicesJson();
            const nativeVoices = JSON.parse(jsonStr || '[]');
            if (Array.isArray(nativeVoices) && nativeVoices.length > 0) {
              const mapped = nativeVoices.map((v: { name: string; lang: string }) => ({
                default: false,
                lang: v.lang || 'es-ES',
                localService: true,
                name: v.name || 'Voz Android Nativa',
                voiceURI: v.name,
              })) as unknown as SpeechSynthesisVoice[];
              voiceList = [...mapped, ...voiceList];
            }
          }
        } catch {}
      }

      if (voiceList.length > 0) {
        this.voices = voiceList;
      }
    };

    fetchVoices();

    if (this.synth) {
      if (typeof this.synth.onvoiceschanged !== 'undefined') {
        this.synth.onvoiceschanged = fetchVoices;
      }
      try {
        this.synth.addEventListener?.('voiceschanged', fetchVoices);
      } catch {}
    }

    // Polling retry for initial delay
    if (typeof window !== 'undefined') {
      window.setTimeout(fetchVoices, 100);
      window.setTimeout(fetchVoices, 500);
      window.setTimeout(fetchVoices, 1200);
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (this.voices.length === 0) {
      try {
        const list = this.synth.getVoices();
        if (list && list.length > 0) {
          this.voices = list;
        }
      } catch {}
    }
    return this.voices;
  }

  /**
   * Obtiene todos los idiomas disponibles, combinando la lista estándar con cualquier
   * idioma soportado por las voces instaladas en el dispositivo/navegador.
   * El español (es) siempre se posiciona en primer lugar como predeterminado.
   */
  public getAllAvailableLanguages(): LanguageOption[] {
    const voices = this.getAvailableVoices();
    const map = new Map<string, LanguageOption>();

    // Agregar lista estándar
    SUPPORTED_LANGUAGES.forEach((lang) => {
      map.set(lang.code.toLowerCase(), { ...lang });
    });

    // Detectar idiomas adicionales de las voces del sistema
    voices.forEach((v) => {
      const bcp = (v.lang || '').replace('_', '-');
      const prefix = bcp.split('-')[0].toLowerCase();
      if (prefix && !map.has(prefix)) {
        let name = prefix.toUpperCase();
        try {
          if (typeof Intl !== 'undefined' && (Intl as unknown as { DisplayNames?: unknown }).DisplayNames) {
            const dn = new Intl.DisplayNames(['es'], { type: 'language' });
            const resolved = dn.of(prefix);
            if (resolved) {
              name = resolved.charAt(0).toUpperCase() + resolved.slice(1);
            }
          }
        } catch {}

        map.set(prefix, {
          code: prefix,
          name,
          nativeName: name,
          flag: '🌐',
          fullCode: bcp,
        });
      }
    });

    const list = Array.from(map.values());
    list.sort((a, b) => {
      if (a.code === 'es') return -1;
      if (b.code === 'es') return 1;
      return a.name.localeCompare(b.name, 'es');
    });

    return list;
  }

  /**
   * Resuelve el código BCP-47 completo para el sintetizador (ej. 'es' -> 'es-ES').
   */
  public getFullLangCode(langCode: string = 'es'): string {
    const clean = (langCode || 'es').toLowerCase().trim();
    const found = SUPPORTED_LANGUAGES.find(
      (l) => l.code.toLowerCase() === clean || l.fullCode?.toLowerCase() === clean
    );
    if (found?.fullCode) return found.fullCode;
    if (clean.includes('-')) return clean;

    const defaults: Record<string, string> = {
      es: 'es-ES',
      en: 'en-US',
      fr: 'fr-FR',
      de: 'de-DE',
      it: 'it-IT',
      pt: 'pt-BR',
      ja: 'ja-JP',
      zh: 'zh-CN',
      ru: 'ru-RU',
      ko: 'ko-KR',
      nl: 'nl-NL',
      pl: 'pl-PL',
      sv: 'sv-SE',
      tr: 'tr-TR',
      ar: 'ar-SA',
      hi: 'hi-IN',
    };
    return defaults[clean] || `${clean}-${clean.toUpperCase()}`;
  }

  /**
   * Obtiene las voces disponibles para un idioma específico.
   */
  public getVoicesForLanguage(langCode: string = 'es'): SpeechSynthesisVoice[] {
    const all = this.getAvailableVoices();
    const clean = (langCode || 'es').toLowerCase().trim();

    return all.filter((v) => {
      const vLang = (v.lang || '').toLowerCase().replace('_', '-');
      const vName = (v.name || '').toLowerCase();

      // Coincidencia por etiqueta BCP-47
      if (vLang === clean || vLang.startsWith(clean + '-') || clean.startsWith(vLang.split('-')[0])) {
        return true;
      }

      // Atajos heurísticos para nombres de voz comunes
      if (clean === 'es' && (vLang.includes('spa') || vName.includes('spanish') || vName.includes('español') || vName.includes('espanol'))) {
        return true;
      }
      if (clean === 'en' && (vLang.includes('eng') || vName.includes('english'))) {
        return true;
      }
      if (clean === 'fr' && (vLang.includes('fra') || vName.includes('french') || vName.includes('français'))) {
        return true;
      }
      if (clean === 'de' && (vLang.includes('deu') || vName.includes('german') || vName.includes('deutsch'))) {
        return true;
      }
      return false;
    });
  }

  /**
   * Filtra estrictamente solo las voces en español.
   */
  public getSpanishVoices(): SpeechSynthesisVoice[] {
    return this.getVoicesForLanguage('es');
  }

  /**
   * Selecciona la voz ideal para cualquier idioma según el preset (femenina o masculina).
   * Si no encuentra voz en ese idioma, recurre al español o a la primera voz disponible.
   */
  public getVoiceForLanguageAndPreset(
    langCode: string = 'es',
    presetId: VoicePresetId = 'femenina'
  ): {
    voice: SpeechSynthesisVoice | null;
    isNativeMatch: boolean;
  } {
    const lang = (langCode || 'es').toLowerCase();
    const langVoices = this.getVoicesForLanguage(lang);

    if (langVoices.length === 0) {
      // Fallback 1: Si no hay voz para el idioma pedido, intentar español si el pedido no era español
      if (lang !== 'es') {
        const esVoices = this.getSpanishVoices();
        if (esVoices.length > 0) {
          const res = this.getVoiceForLanguageAndPreset('es', presetId);
          return { voice: res.voice, isNativeMatch: false };
        }
      }
      // Fallback 2: Cualquier voz disponible
      const all = this.getAvailableVoices();
      return { voice: all.length > 0 ? all[0] : null, isNativeMatch: false };
    }

    const femaleKeywords = [
      ...FEMALE_VOICE_KEYWORDS,
      'female', 'woman', 'susan', 'samantha', 'victoria', 'karen', 'amelie', 'anna',
      'petra', 'yuka', 'ting-ting', 'femme', 'weiblich', 'donna', 'mulher', 'catherine',
      'claire', 'alice', 'stephanie', 'kyoko', 'yuna', 'sin-ji'
    ];
    const maleKeywords = [
      ...MALE_VOICE_KEYWORDS,
      'male', 'man', 'david', 'george', 'thomas', 'daniel', 'alex', 'fred',
      'claude', 'stefan', 'luca', 'jorge', 'homme', 'männlich', 'uomo', 'homem',
      'oliver', 'paul', 'mark', 'michael', 'kenji', 'otojiro', 'danny'
    ];

    const femaleCandidates = langVoices.filter((v) => {
      const name = v.name.toLowerCase();
      return femaleKeywords.some((kw) => name.includes(kw));
    });

    const maleCandidates = langVoices.filter((v) => {
      const name = v.name.toLowerCase();
      return maleKeywords.some((kw) => name.includes(kw));
    });

    if (presetId === 'femenina') {
      if (femaleCandidates.length > 0) {
        return { voice: femaleCandidates[0], isNativeMatch: true };
      }
      const nonMale = langVoices.find((v) => !maleCandidates.includes(v));
      return { voice: nonMale || langVoices[0], isNativeMatch: false };
    } else {
      if (maleCandidates.length > 0) {
        return { voice: maleCandidates[0], isNativeMatch: true };
      }
      const nonFemale = langVoices.find((v) => !femaleCandidates.includes(v));
      return { voice: nonFemale || langVoices[0], isNativeMatch: false };
    }
  }

  /**
   * Selecciona la voz ideal en español según el preset (femenina o masculina).
   */
  public getVoiceForPreset(presetId: VoicePresetId): {
    voice: SpeechSynthesisVoice | null;
    isNativeMatch: boolean;
  } {
    return this.getVoiceForLanguageAndPreset('es', presetId);
  }

  private clearTimers() {
    if (this.keepAliveInterval !== null) {
      window.clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
    if (this.watchdogTimeout !== null) {
      window.clearTimeout(this.watchdogTimeout);
      this.watchdogTimeout = null;
    }
    if (this.dispatchTimeout !== null) {
      window.clearTimeout(this.dispatchTimeout);
      this.dispatchTimeout = null;
    }
  }

  /**
   * Heartbeat para evitar que Chromium desktop pause la voz en oraciones extremadamente largas (> 13s).
   * En móviles y WebView de Android se omite, ya que pausar y reanudar provoca tartamudeo y latencia acústica.
   */
  private startKeepAlive() {
    this.clearTimers();

    const isMobile =
      typeof navigator !== 'undefined' &&
      /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);

    if (isMobile) return;

    this.keepAliveInterval = window.setTimeout(() => {
      if (this.synth && this.synth.speaking && !this.synth.paused && !this.isPausedState) {
        try {
          this.synth.pause();
          this.synth.resume();
        } catch {}
      }
    }, 13000);
  }

  public cancelCurrentSpeech() {
    this.clearTimers();
    if (typeof window !== 'undefined' && window.AndroidTTS && window.AndroidTTS.isAvailable()) {
      try {
        window.AndroidTTS.stop();
      } catch {}
      this.androidCallbacks.clear();
      this.currentAndroidUttId = null;
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {}
    }
    this.isSpeakingActive = false;
    this.isPausedState = false;
    this.currentUtterance = null;
    this.activeUtteranceRetainer.clear();
  }

  /**
   * Reproduce una oración de texto con la voz seleccionada (Femenina o Masculina).
   * Soporta tanto llamada con objeto de opciones como llamada posicional tradicional.
   */
  public speak(
    text: string,
    speedOrOptions: number | SpeakOptions = 1.0,
    presetIdArg: VoicePresetId = 'femenina',
    _langCodeArg: string = 'es',
    onStartArg: () => void = () => {},
    onEndArg: () => void = () => {},
    onErrorArg: (error: unknown) => void = () => {}
  ) {
    let speed = 1.0;
    let presetId: VoicePresetId = 'femenina';
    let lang = 'es';
    let isSequential = false;
    let smartRhythm = true;
    let onStart = () => {};
    let onEnd = () => {};
    let onError = (_err: unknown) => {};

    if (typeof speedOrOptions === 'object' && speedOrOptions !== null) {
      speed = speedOrOptions.speed ?? 1.0;
      presetId = speedOrOptions.presetId ?? 'femenina';
      lang = speedOrOptions.lang || 'es';
      isSequential = speedOrOptions.isSequential ?? false;
      smartRhythm = speedOrOptions.smartRhythm ?? true;
      onStart = speedOrOptions.onStart ?? (() => {});
      onEnd = speedOrOptions.onEnd ?? (() => {});
      onError = speedOrOptions.onError ?? (() => {});
    } else {
      speed = typeof speedOrOptions === 'number' ? speedOrOptions : 1.0;
      presetId = presetIdArg || 'femenina';
      lang = _langCodeArg || 'es';
      smartRhythm = true;
      onStart = onStartArg || (() => {});
      onEnd = onEndArg || (() => {});
      onError = onErrorArg || (() => {});
    }

    const hasAndroidTTS =
      typeof window !== 'undefined' &&
      !!window.AndroidTTS &&
      window.AndroidTTS.isAvailable();

    if (!hasAndroidTTS && !this.synth) {
      onError(new Error('El sintetizador de voz no está disponible en este dispositivo.'));
      return;
    }

    // Si NO es una transición secuencial natural (ej. clic manual del usuario, cambio de pista),
    // cancelamos la locución previa
    if (!isSequential) {
      this.cancelCurrentSpeech();
    } else {
      // Limpiamos únicamente temporizadores watchdog de la oración anterior
      this.clearTimers();
    }

    // Optimización de prosodia para fluidez natural:
    // Sustituir puntos suspensivos o rayas múltiples que provocan silencios de 2 segundos en el sintetizador
    const cleanText = text
      .replace(/[*_~`#>[\]]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\.{2,}|…/g, ', ') // Puntos suspensivos causan pausas muy largas -> convertir a coma breve
      .replace(/\s*[-—–]{2,}\s*/g, ', ') // Rayas largas
      .replace(/^[-—–«"“]\s*/gm, '') // Quitar guiones o comillas al inicio que detienen la entonación
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      onEnd();
      return;
    }

    const { voice, isNativeMatch } = this.getVoiceForLanguageAndPreset(lang, presetId);

    // Configuración acústica calibrada para fluidez y naturalidad (Femenina vs Masculina)
    let finalPitch: number;
    let finalRate: number;

    if (presetId === 'femenina') {
      // Voz femenina ágil, fluida y melódica
      finalPitch = isNativeMatch ? 1.10 : 1.20;
      finalRate = 1.08 * speed;
    } else {
      // Voz masculina con presencia, firme pero sin lentitud
      finalPitch = isNativeMatch ? 0.86 : 0.76;
      finalRate = 1.05 * speed;
    }

    let textToSpeak = cleanText;

    // Modulación dinámica de Ritmo Inteligente según la puntuación
    if (smartRhythm) {
      const rhythmResult = computeSmartRhythm(cleanText, finalRate, finalPitch);
      finalRate = rhythmResult.rate;
      finalPitch = rhythmResult.pitch;
      textToSpeak = rhythmResult.processedText;
    }

    // Prioridad 1: Si estamos ejecutando en la App Nativa de Android, usamos el motor nativo TextToSpeech
    if (hasAndroidTTS && window.AndroidTTS) {
      const uttId = 'utt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      this.androidCallbacks.set(uttId, { onStart, onEnd, onError });
      this.currentAndroidUttId = uttId;
      this.isSpeakingActive = true;
      this.isPausedState = false;

      const langFull = this.getFullLangCode(lang);
      try {
        window.AndroidTTS.speak(textToSpeak, finalRate, finalPitch, langFull, uttId);
      } catch (e) {
        this.androidCallbacks.delete(uttId);
        onError(e);
      }
      return;
    }

    // Prioridad 2: Web Speech API para navegadores estándar
    if (!this.synth) {
      onError(new Error('Sintetizador web no disponible'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    this.activeUtteranceRetainer.add(utterance);
    (window as unknown as { __lectorActiveUtterance?: SpeechSynthesisUtterance }).__lectorActiveUtterance = utterance;

    // Asignación de voz e idioma
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || this.getFullLangCode(lang);
    } else {
      utterance.voice = null;
      utterance.lang = this.getFullLangCode(lang);
    }

    utterance.pitch = Math.max(0.4, Math.min(1.8, finalPitch));
    utterance.rate = Math.max(0.5, Math.min(2.0, finalRate));

    let hasHandledEnd = false;
    const finishUtterance = () => {
      if (hasHandledEnd) return;
      hasHandledEnd = true;
      this.clearTimers();
      this.isSpeakingActive = false;
      this.isPausedState = false;
      this.activeUtteranceRetainer.delete(utterance);
      if (this.currentUtterance === utterance) {
        this.currentUtterance = null;
      }
      onEnd();
    };

    utterance.onstart = () => {
      this.isSpeakingActive = true;
      this.isPausedState = false;
      this.startKeepAlive();
      onStart();
    };

    utterance.onend = () => {
      finishUtterance();
    };

    utterance.onerror = (e) => {
      if (e.error === 'canceled' || e.error === 'interrupted') {
        this.clearTimers();
        this.isSpeakingActive = false;
        this.isPausedState = false;
        this.activeUtteranceRetainer.delete(utterance);
        return;
      }
      this.clearTimers();
      this.isSpeakingActive = false;
      this.isPausedState = false;
      this.activeUtteranceRetainer.delete(utterance);
      this.currentUtterance = null;
      onError(e);
    };

    // Watchdog de seguridad tolerante para no cortar oraciones largas
    const wordCount = cleanText.split(/\s+/).length;
    const estimatedDurationMs = Math.max(
      8000,
      Math.ceil((wordCount / (90 * finalRate)) * 60 * 1000) + 6000
    );

    this.watchdogTimeout = window.setTimeout(() => {
      if (this.isSpeakingActive && !this.isPausedState) {
        if (!this.synth?.speaking) {
          this.cancelCurrentSpeech();
          finishUtterance();
        }
      }
    }, estimatedDurationMs);

    this.currentUtterance = utterance;

    // Despacho de audio:
    // Si es transición secuencial o la aplicación está en segundo plano (document.hidden),
    // disparamos inmediatamente sin setTimeout para que el navegador no atrase la narración
    const isHidden = typeof document !== 'undefined' && document.hidden;

    if (isSequential || isHidden) {
      try {
        if (this.synth.paused) {
          this.synth.resume();
        }
        this.synth.speak(utterance);
      } catch (err) {
        finishUtterance();
        onError(err);
      }
    } else {
      // Disparo inicial tras micro-pausa de estabilización (15ms)
      this.dispatchTimeout = window.setTimeout(() => {
        try {
          if (this.synth?.paused) {
            this.synth.resume();
          }
          this.synth?.speak(utterance);
        } catch (err) {
          finishUtterance();
          onError(err);
        }
      }, 15);
    }
  }

  public pause() {
    if (typeof window !== 'undefined' && window.AndroidTTS && window.AndroidTTS.isAvailable()) {
      try {
        window.AndroidTTS.stop();
      } catch {}
      this.isPausedState = true;
      this.isSpeakingActive = false;
      this.clearTimers();
      return;
    }
    if (this.synth && this.synth.speaking) {
      try {
        this.synth.pause();
      } catch {}
      this.isPausedState = true;
      this.clearTimers();
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && window.AndroidTTS && window.AndroidTTS.isAvailable()) {
      this.isPausedState = false;
      return;
    }
    if (this.synth && (this.synth.paused || this.isPausedState)) {
      try {
        this.synth.resume();
      } catch {}
      this.isPausedState = false;
      this.startKeepAlive();
    }
  }

  public stop() {
    this.cancelCurrentSpeech();
  }

  public isSpeaking(): boolean {
    if (typeof window !== 'undefined' && window.AndroidTTS && window.AndroidTTS.isAvailable()) {
      try {
        return window.AndroidTTS.isSpeaking() || (this.isSpeakingActive && !this.isPausedState);
      } catch {}
    }
    return !!(this.synth && this.synth.speaking && !this.isPausedState);
  }

  public isPaused(): boolean {
    return this.isPausedState;
  }
}

export const speechEngine = new SpeechEngine();
