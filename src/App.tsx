import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Maximize2, Minimize2, Play, Pause } from 'lucide-react';
import libraryPuppetBg from './assets/images/library_story_doll_1791287871877.jpg';
import {
  Bookmark,
  FavoriteItem,
  PDFDocumentData,
  ThemeMode,
  VoicePresetId,
  SleepTimerState,
  SleepTimerMode,
  BookHistoryItem,
} from './types';
import { SAMPLE_BOOKS } from './data/sampleBooks';
import { parsePdfArrayBuffer, createDocumentFromText } from './utils/pdfParser';
import {
  speechEngine,
  detectLanguage,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
} from './utils/speechEngine';
import { sounds } from './utils/soundEffects';
import { backgroundAudioService } from './utils/backgroundAudio';
import {
  getStoredBookmarks,
  saveBookmark,
  removeBookmark,
  updateBookmarkNote,
  getStoredFavorites,
  toggleFavorite,
  isFavorite,
  getStoredSettings,
  saveStoredSettings,
  getStoredHistory,
  saveHistoryItem,
  removeHistoryItem,
  clearHistory,
  getPdfOpenCount,
  incrementPdfOpenCount,
  hasSeenInterstitial,
  markInterstitialAsSeen,
} from './utils/storage';

import { Header } from './components/Header';
import { DocumentReader } from './components/DocumentReader';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { BookmarksModal } from './components/BookmarksModal';
import { VoiceSelectorModal } from './components/VoiceSelectorModal';
import { SleepTimerModal } from './components/SleepTimerModal';
import { AndroidExportModal } from './components/AndroidExportModal';
import { HistoryModal } from './components/HistoryModal';
import { BackgroundAudioModal } from './components/BackgroundAudioModal';
import { AdMobBanner } from './components/AdMobBanner';
import { AdMobInterstitialModal } from './components/AdMobInterstitialModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { InstallAppModal } from './components/InstallAppModal';
import { InstallAppBanner } from './components/InstallAppBanner';

export default function App() {
  // Settings & Preferences
  const [settings, setSettings] = useState(() => getStoredSettings());
  const [theme, setTheme] = useState<ThemeMode>(() => settings.theme || 'auto');
  const [isSystemDark, setIsSystemDark] = useState<boolean>(false);
  const [soundsEnabled, setSoundsEnabled] = useState<boolean>(() => settings.soundsEnabled ?? true);
  const [speed, setSpeed] = useState<number>(() => settings.speed || 1.0);
  const [voicePreset, setVoicePreset] = useState<VoicePresetId>(() => settings.voicePreset || 'femenina');
  const [smartRhythm, setSmartRhythm] = useState<boolean>(() => settings.smartRhythm ?? true);
  const [language, setLanguage] = useState<string>(() => settings.language || DEFAULT_LANGUAGE);

  const smartRhythmRef = useRef<boolean>(smartRhythm);
  smartRhythmRef.current = smartRhythm;

  const languageRef = useRef<string>(language);
  languageRef.current = language;

  // Document & Reading State
  const [document, setDocument] = useState<PDFDocumentData | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Bookmarks & Favorites
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => getStoredBookmarks());
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => getStoredFavorites());

  // Reading History (Reloj de historial)
  const [history, setHistory] = useState<BookHistoryItem[]>(() => getStoredHistory());
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Sleep Timer State
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState<boolean>(false);
  const [sleepTimer, setSleepTimer] = useState<SleepTimerState>({
    isActive: false,
    mode: 'duration',
    initialMinutes: 0,
    remainingSeconds: 0,
    targetTimestamp: null,
  });
  const sleepTimerRef = useRef<SleepTimerState>(sleepTimer);
  sleepTimerRef.current = sleepTimer;

  // UI Modals & Feedback
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);
  const [isVoicesOpen, setIsVoicesOpen] = useState<boolean>(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  // PWA & Native App Standalone Hook
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    isFullscreen,
    install: installPWA,
    toggleFullscreen,
  } = usePWAInstall();
  const [pdfOpenCount, setPdfOpenCount] = useState<number>(() => getPdfOpenCount());
  const [isInterstitialOpen, setIsInterstitialOpen] = useState<boolean>(false);
  const [pendingOpenAction, setPendingOpenAction] = useState<(() => void) | null>(null);
  const [interstitialBookTitle, setInterstitialBookTitle] = useState<string>('Documento PDF');
  const [isInterstitialTestPreview, setIsInterstitialTestPreview] = useState<boolean>(false);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modo Inmersivo (Lectura sin distracciones, ocultando Header y AudioBar)
  const [isImmersiveMode, setIsImmersiveMode] = useState<boolean>(false);

  const isReadingRef = useRef<boolean>(false);
  isReadingRef.current = isPlaying;

  // Auto Dark Mode synchronization with system preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsSystemDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Update sound system on state change
  useEffect(() => {
    sounds.setEnabled(soundsEnabled);
  }, [soundsEnabled]);

  // Compute effective dark mode
  const effectiveIsDark = theme === 'dark' || (theme === 'auto' && isSystemDark);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  }, []);

  // Save settings when modified
  const updateSettings = useCallback((updates: Partial<typeof settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      saveStoredSettings(next);
      return next;
    });
  }, []);

  const handleCycleTheme = () => {
    const nextTheme: ThemeMode = theme === 'auto' ? 'dark' : theme === 'dark' ? 'light' : 'auto';
    setTheme(nextTheme);
    updateSettings({ theme: nextTheme });
    showToast(`Modo visual: ${nextTheme === 'auto' ? 'Automático (según sistema)' : nextTheme === 'dark' ? 'Oscuro (ahorro batería)' : 'Claro'}`);
  };

  const handleToggleImmersive = useCallback(
    (forceVal?: boolean) => {
      setIsImmersiveMode((prev) => {
        const next = typeof forceVal === 'boolean' ? forceVal : !prev;
        sounds.playClick(next ? 850 : 500);
        showToast(
          next
            ? '✨ Modo Inmersivo activado: controles ocultos. Pulsa Esc o el botón flotante para salir.'
            : 'Modo normal restaurado: controles visibles.'
        );
        return next;
      });
    },
    [showToast]
  );

  // Allow pressing Escape key to exit immersive mode smoothly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImmersiveMode) {
        handleToggleImmersive(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImmersiveMode, handleToggleImmersive]);

  const handleToggleSounds = () => {
    const next = !soundsEnabled;
    setSoundsEnabled(next);
    sounds.setEnabled(next);
    if (next) sounds.playPlay();
    updateSettings({ soundsEnabled: next });
    showToast(next ? 'Sonidos táctiles activados' : 'Sonidos desactivados');
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    updateSettings({ speed: newSpeed });
    // If currently speaking, restart current sentence with new rate
    if (isPlaying && document) {
      speakSentence(currentPageIndex, currentSentenceIndex, newSpeed, voicePreset);
    }
  };

  const handleSelectVoicePreset = (preset: VoicePresetId) => {
    speechEngine.cancelCurrentSpeech();
    setVoicePreset(preset);
    updateSettings({ voicePreset: preset });

    if (preset === 'femenina') {
      showToast('👩 Voz Femenina seleccionada');
    } else {
      showToast('🎙️ Voz Masculina seleccionada');
    }

    if (isPlaying && document) {
      speakSentence(currentPageIndex, currentSentenceIndex, speed, preset);
    }
  };

  const handleSelectLanguage = (langCode: string) => {
    speechEngine.cancelCurrentSpeech();
    setLanguage(langCode);
    languageRef.current = langCode;
    updateSettings({ language: langCode });

    const langInfo = SUPPORTED_LANGUAGES.find(
      (l) => l.code.toLowerCase() === langCode.toLowerCase()
    );
    const langName = langInfo ? `${langInfo.flag} ${langInfo.name}` : langCode.toUpperCase();
    showToast(`Idioma de lectura: ${langName}`);

    if (isPlaying && document) {
      speakSentence(
        currentPageIndex,
        currentSentenceIndex,
        speed,
        voicePreset,
        false,
        smartRhythmRef.current,
        langCode
      );
    }
  };

  const handleToggleSmartRhythm = () => {
    const next = !smartRhythm;
    setSmartRhythm(next);
    smartRhythmRef.current = next;
    updateSettings({ smartRhythm: next });
    sounds.playClick(next ? 750 : 500);
    showToast(
      next
        ? '✨ Ritmo Inteligente activado: modulación natural según comas y puntuación'
        : 'Ritmo Inteligente desactivado: velocidad estándar fija'
    );
    if (isPlaying && document) {
      speakSentence(currentPageIndex, currentSentenceIndex, speed, voicePreset, false, next);
    }
  };

  // Record Book Progress to Playback History
  const recordBookHistory = useCallback(
    (doc: PDFDocumentData, pageIdx: number, sentenceIdx: number) => {
      const totalPages = doc.totalPages || 1;
      const pageSentencesCount = Math.max(1, doc.pages[pageIdx]?.sentences.length || 1);
      const rawProgress = ((pageIdx + (sentenceIdx + 1) / pageSentencesCount) / totalPages) * 100;
      const progress = Math.min(100, Math.max(1, Math.round(rawProgress)));

      const sampleMatch = SAMPLE_BOOKS.find(
        (b) => b.doc.fileName === doc.fileName || b.title === doc.title
      );

      const updated = saveHistoryItem({
        fileName: doc.fileName,
        title: doc.title,
        totalPages: doc.totalPages,
        lastPageIndex: pageIdx,
        lastSentenceIndex: sentenceIdx,
        progressPercent: progress,
        isSample: !!sampleMatch,
        sampleId: sampleMatch?.id,
        author: sampleMatch?.author,
      });
      setHistory(updated);
    },
    []
  );

  // Main Speech Dispatcher
  const speakSentence = useCallback(
    (
      pageIdx: number,
      sentenceIdx: number,
      currSpeed = speed,
      currPreset = voicePreset,
      isSequential = false,
      currSmartRhythm = smartRhythmRef.current,
      currLang = languageRef.current
    ) => {
      if (!document) return;
      const page = document.pages[pageIdx];
      if (!page) {
        setIsPlaying(false);
        speechEngine.stop();
        return;
      }

      const sentence = page.sentences[sentenceIdx];
      if (!sentence) {
        // Page completed, advance to next page if available
        if (pageIdx + 1 < document.totalPages) {
          setCurrentPageIndex(pageIdx + 1);
          setCurrentSentenceIndex(0);
          speakSentence(pageIdx + 1, 0, currSpeed, currPreset, true, currSmartRhythm, currLang);
        } else {
          // Document finished!
          setIsPlaying(false);
          setIsPaused(false);
          speechEngine.stop();
          backgroundAudioService.stopBackgroundPlayback();
          sounds.playDocumentLoaded();
          showToast('Lectura del documento completada');
        }
        return;
      }

      setIsPlaying(true);
      setIsPaused(false);
      recordBookHistory(document, pageIdx, sentenceIdx);

      // Start background keep-alive audio session and update lock-screen notification metadata
      backgroundAudioService.startBackgroundPlayback();
      backgroundAudioService.updateMetadata({
        title: document.title,
        page: pageIdx + 1,
        totalPages: document.totalPages,
        sentenceText: sentence,
      });

      speechEngine.speak(sentence, {
        speed: currSpeed,
        presetId: currPreset,
        lang: currLang,
        isSequential,
        smartRhythm: currSmartRhythm,
        onStart: () => {
          // onStart
        },
        onEnd: () => {
          // onEnd -> advance to next sentence smoothly
          if (isReadingRef.current) {
            const nextSentenceIdx = sentenceIdx + 1;
            if (nextSentenceIdx < page.sentences.length) {
              setCurrentSentenceIndex(nextSentenceIdx);
              speakSentence(pageIdx, nextSentenceIdx, currSpeed, currPreset, true, currSmartRhythm, currLang);
            } else if (pageIdx + 1 < document.totalPages) {
              // Check if Sleep Timer is waiting for end of current page
              if (sleepTimerRef.current.isActive && sleepTimerRef.current.mode === 'end_of_page') {
                setIsPlaying(false);
                setIsPaused(true);
                speechEngine.stop();
                backgroundAudioService.pauseBackgroundPlayback();
                setSleepTimer({
                  isActive: false,
                  mode: 'end_of_page',
                  initialMinutes: 0,
                  remainingSeconds: 0,
                  targetTimestamp: null,
                });
                sounds.playSleepTimerEnd();
                showToast('🌙 Temporizador: Lectura pausada al finalizar la página para ahorrar batería.');
                return;
              }
              setCurrentPageIndex(pageIdx + 1);
              setCurrentSentenceIndex(0);
              sounds.playSkip(true);
              speakSentence(pageIdx + 1, 0, currSpeed, currPreset, true, currSmartRhythm, currLang);
            } else {
              setIsPlaying(false);
              setIsPaused(false);
              backgroundAudioService.stopBackgroundPlayback();
              if (sleepTimerRef.current.isActive) {
                setSleepTimer({
                  isActive: false,
                  mode: 'duration',
                  initialMinutes: 0,
                  remainingSeconds: 0,
                  targetTimestamp: null,
                });
              }
              sounds.playDocumentLoaded();
              showToast('Fin del libro');
            }
          }
        },
        onError: (err) => {
          console.warn('Speech error:', err);
          setIsPlaying(false);
          backgroundAudioService.pauseBackgroundPlayback();
          showToast('Aviso: Asegúrate de que el volumen de audio multimedia esté activo.');
        },
      });
    },
    [document, speed, voicePreset, showToast]
  );

  // Sleep Timer interval countdown and automatic pause trigger
  useEffect(() => {
    if (!sleepTimer.isActive || sleepTimer.mode !== 'duration' || !sleepTimer.targetTimestamp) {
      return;
    }

    const intervalId = setInterval(() => {
      const diffMs = sleepTimer.targetTimestamp! - Date.now();
      const remaining = Math.max(0, Math.ceil(diffMs / 1000));

      if (remaining <= 0) {
        clearInterval(intervalId);
        setSleepTimer({
          isActive: false,
          mode: 'duration',
          initialMinutes: 0,
          remainingSeconds: 0,
          targetTimestamp: null,
        });

        // Pause audio playback smoothly to save battery
        speechEngine.stop();
        setIsPlaying(false);
        setIsPaused(true);
        backgroundAudioService.pauseBackgroundPlayback();
        sounds.playSleepTimerEnd();
        showToast('🌙 Temporizador de reposo: Lectura pausada para ahorrar batería.');
      } else {
        setSleepTimer((prev) => ({
          ...prev,
          remainingSeconds: remaining,
        }));
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [sleepTimer.isActive, sleepTimer.mode, sleepTimer.targetTimestamp, showToast]);

  const handleStartSleepTimer = (minutes: number, mode: SleepTimerMode = 'duration') => {
    if (mode === 'end_of_page') {
      setSleepTimer({
        isActive: true,
        mode: 'end_of_page',
        initialMinutes: 0,
        remainingSeconds: 0,
        targetTimestamp: null,
      });
      showToast('🌙 Temporizador: La lectura se pausará al terminar esta página');
    } else {
      const totalSec = minutes * 60;
      setSleepTimer({
        isActive: true,
        mode: 'duration',
        initialMinutes: minutes,
        remainingSeconds: totalSec,
        targetTimestamp: Date.now() + totalSec * 1000,
      });
      showToast(`🌙 Temporizador activado: ${minutes} minutos. Se pausará para ahorrar batería.`);
    }
  };

  const handleCancelSleepTimer = () => {
    setSleepTimer({
      isActive: false,
      mode: 'duration',
      initialMinutes: 0,
      remainingSeconds: 0,
      targetTimestamp: null,
    });
    showToast('Temporizador de reposo desactivado');
  };

  const handleAddTimerMinutes = (minutes: number) => {
    setSleepTimer((prev) => {
      if (!prev.isActive || prev.mode !== 'duration') return prev;
      const addMs = minutes * 60 * 1000;
      const newTarget = (prev.targetTimestamp || Date.now()) + addMs;
      const newRemaining = Math.max(0, Math.ceil((newTarget - Date.now()) / 1000));
      showToast(`🌙 Se han añadido +${minutes} min al temporizador`);
      return {
        ...prev,
        initialMinutes: prev.initialMinutes + minutes,
        remainingSeconds: newRemaining,
        targetTimestamp: newTarget,
      };
    });
  };

  const handlePlayPause = () => {
    if (!document) {
      // Pick first sample book ("El Quijote") and start reading immediately!
      handleSelectSampleBook('quijote', true);
      return;
    }

    if (isPlaying) {
      speechEngine.stop();
      setIsPlaying(false);
      setIsPaused(true);
      backgroundAudioService.pauseBackgroundPlayback();
    } else {
      speakSentence(currentPageIndex, currentSentenceIndex);
    }
  };

  const handleSentenceClick = (sentenceIdx: number) => {
    setCurrentSentenceIndex(sentenceIdx);
    speakSentence(currentPageIndex, sentenceIdx);
  };

  const handlePrevSentence = () => {
    if (!document) return;
    if (currentSentenceIndex > 0) {
      const nextIdx = currentSentenceIndex - 1;
      setCurrentSentenceIndex(nextIdx);
      if (isPlaying) {
        speakSentence(currentPageIndex, nextIdx);
      }
    } else if (currentPageIndex > 0) {
      const prevPage = currentPageIndex - 1;
      const prevPageSentences = document.pages[prevPage].sentences;
      const lastSentenceIdx = Math.max(0, prevPageSentences.length - 1);
      setCurrentPageIndex(prevPage);
      setCurrentSentenceIndex(lastSentenceIdx);
      if (isPlaying) {
        speakSentence(prevPage, lastSentenceIdx);
      }
    }
  };

  const handleNextSentence = () => {
    if (!document) return;
    const page = document.pages[currentPageIndex];
    if (page && currentSentenceIndex + 1 < page.sentences.length) {
      const nextIdx = currentSentenceIndex + 1;
      setCurrentSentenceIndex(nextIdx);
      if (isPlaying) {
        speakSentence(currentPageIndex, nextIdx);
      }
    } else if (currentPageIndex + 1 < document.totalPages) {
      const nextPage = currentPageIndex + 1;
      setCurrentPageIndex(nextPage);
      setCurrentSentenceIndex(0);
      if (isPlaying) {
        speakSentence(nextPage, 0);
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      const prevPage = currentPageIndex - 1;
      setCurrentPageIndex(prevPage);
      setCurrentSentenceIndex(0);
      if (isPlaying) {
        speakSentence(prevPage, 0);
      }
    }
  };

  const handleNextPage = () => {
    if (document && currentPageIndex + 1 < document.totalPages) {
      const nextPage = currentPageIndex + 1;
      setCurrentPageIndex(nextPage);
      setCurrentSentenceIndex(0);
      if (isPlaying) {
        speakSentence(nextPage, 0);
      }
    }
  };

  const handleRestartPage = () => {
    setCurrentSentenceIndex(0);
    if (isPlaying) {
      speakSentence(currentPageIndex, 0);
    }
  };

  // Sync background audio refs with state for lock-screen MediaSession actions
  const docRef = useRef(document);
  docRef.current = document;
  const currentPageRef = useRef(currentPageIndex);
  currentPageRef.current = currentPageIndex;
  const currentSentenceRef = useRef(currentSentenceIndex);
  currentSentenceRef.current = currentSentenceIndex;
  const handlePrevSentenceRef = useRef(handlePrevSentence);
  handlePrevSentenceRef.current = handlePrevSentence;
  const handleNextSentenceRef = useRef(handleNextSentence);
  handleNextSentenceRef.current = handleNextSentence;
  const handlePrevPageRef = useRef(handlePrevPage);
  handlePrevPageRef.current = handlePrevPage;
  const handleNextPageRef = useRef(handleNextPage);
  handleNextPageRef.current = handleNextPage;
  const speakSentenceRef = useRef(speakSentence);
  speakSentenceRef.current = speakSentence;

  // Register native Android / desktop MediaSession event handlers
  useEffect(() => {
    backgroundAudioService.registerCallbacks({
      onPlay: () => {
        if (docRef.current) {
          speakSentenceRef.current(currentPageRef.current, currentSentenceRef.current);
        }
      },
      onPause: () => {
        speechEngine.stop();
        setIsPlaying(false);
        setIsPaused(true);
        backgroundAudioService.pauseBackgroundPlayback();
      },
      onPrevSentence: () => {
        handlePrevSentenceRef.current();
      },
      onNextSentence: () => {
        handleNextSentenceRef.current();
      },
      onPrevPage: () => {
        handlePrevPageRef.current();
      },
      onNextPage: () => {
        handleNextPageRef.current();
      },
      onStop: () => {
        speechEngine.stop();
        setIsPlaying(false);
        setIsPaused(false);
        backgroundAudioService.stopBackgroundPlayback();
      },
    });
  }, []);

  // Bookmark Operations
  const handleAddCurrentBookmark = (customNote?: string) => {
    if (!document) return;
    const page = document.pages[currentPageIndex];
    const snippet =
      page && page.sentences[currentSentenceIndex]
        ? page.sentences[currentSentenceIndex]
        : `Página ${currentPageIndex + 1} de ${document.title}`;

    const newBm = saveBookmark({
      docTitle: document.title,
      docFileName: document.fileName,
      pageNumber: currentPageIndex + 1,
      sentenceIndex: currentSentenceIndex,
      snippet,
      note: customNote,
    });

    setBookmarks(getStoredBookmarks());
    sounds.playPlay();
    showToast(`Marcador guardado en Página ${currentPageIndex + 1}`);
  };

  const handleDeleteBookmark = (id: string) => {
    const updated = removeBookmark(id);
    setBookmarks(updated);
    showToast('Marcador eliminado');
  };

  const handleUpdateBookmarkNote = (id: string, note: string) => {
    const updated = updateBookmarkNote(id, note);
    setBookmarks(updated);
    showToast('Nota actualizada');
  };

  const handleJumpToBookmark = (bm: Bookmark) => {
    // Check if current doc matches bookmark
    if (document && (document.fileName === bm.docFileName || document.title === bm.docTitle)) {
      const targetPage = Math.min(document.totalPages - 1, Math.max(0, bm.pageNumber - 1));
      const targetSentence = Math.max(0, bm.sentenceIndex || 0);
      setCurrentPageIndex(targetPage);
      setCurrentSentenceIndex(targetSentence);
      speakSentence(targetPage, targetSentence);
      showToast(`Saltando a Pág. ${bm.pageNumber}`);
    } else {
      // Find among sample books or inform user
      const sample = SAMPLE_BOOKS.find(
        (b) => b.doc.fileName === bm.docFileName || b.title === bm.docTitle
      );
      if (sample) {
        setDocument(sample.doc);
        const targetPage = Math.min(sample.doc.totalPages - 1, Math.max(0, bm.pageNumber - 1));
        const targetSentence = Math.max(0, bm.sentenceIndex || 0);
        setCurrentPageIndex(targetPage);
        setCurrentSentenceIndex(targetSentence);
        speakSentence(targetPage, targetSentence);
        showToast(`Cargando "${sample.title}" en Pág. ${bm.pageNumber}`);
      } else {
        showToast(
          `Abre primero el archivo "${bm.docFileName}" para saltar a este marcador.`
        );
      }
    }
  };

  // Favorites Operations
  const handleToggleFavoriteDoc = (doc: PDFDocumentData) => {
    const isNowFav = toggleFavorite({
      id: doc.fileName,
      fileName: doc.fileName,
      title: doc.title,
      totalPages: doc.totalPages,
    });
    setFavorites(getStoredFavorites());
    sounds.playTick();
    showToast(
      isNowFav
        ? `"${doc.title}" añadido a Favoritos`
        : `"${doc.title}" eliminado de Favoritos`
    );
  };

  // Interstitial Ad Trigger: Activates strictly when user opens a PDF for the 3rd time
  const triggerPdfOpenWithAdCheck = (bookTitle: string, openCallback: () => void) => {
    const newCount = incrementPdfOpenCount();
    setPdfOpenCount(newCount);

    // Activates on the 3rd PDF opening
    if (newCount === 3 && !hasSeenInterstitial()) {
      setInterstitialBookTitle(bookTitle);
      setPendingOpenAction(() => openCallback);
      setIsInterstitialTestPreview(false);
      setIsInterstitialOpen(true);
    } else {
      openCallback();
    }
  };

  const handleCloseInterstitial = () => {
    markInterstitialAsSeen();
    setIsInterstitialOpen(false);
    if (pendingOpenAction) {
      const action = pendingOpenAction;
      setPendingOpenAction(null);
      action();
    }
  };

  const handlePreviewInterstitial = () => {
    setInterstitialBookTitle('Vista de Prueba AdMob Intersticial');
    setPendingOpenAction(null);
    setIsInterstitialTestPreview(true);
    setIsInterstitialOpen(true);
  };

  const handleSelectFavorite = (fav: FavoriteItem) => {
    const sample = SAMPLE_BOOKS.find((b) => b.doc.fileName === fav.fileName || b.title === fav.title);
    if (sample) {
      triggerPdfOpenWithAdCheck(sample.title, () => {
        setDocument(sample.doc);
        setCurrentPageIndex(0);
        setCurrentSentenceIndex(0);
        sounds.playDocumentLoaded();
        showToast(`Cargado favorito: ${sample.title}`);
      });
    } else if (document && document.fileName === fav.fileName) {
      showToast(`Ya estás leyendo este documento.`);
    } else {
      showToast(`Para abrir este favorito, carga su archivo ${fav.fileName}.`);
    }
  };

  // Load Sample Book
  const handleSelectSampleBook = (sampleId: string, autoPlay: boolean = false) => {
    const sample = SAMPLE_BOOKS.find((b) => b.id === sampleId);
    if (sample) {
      triggerPdfOpenWithAdCheck(sample.title, () => {
        speechEngine.stop();
        setIsPlaying(false);
        setDocument(sample.doc);
        setCurrentPageIndex(0);
        setCurrentSentenceIndex(0);
        const bookLang = sample.language || DEFAULT_LANGUAGE;
        setLanguage(bookLang);
        languageRef.current = bookLang;
        updateSettings({ language: bookLang });
        sounds.playDocumentLoaded();
        recordBookHistory(sample.doc, 0, 0);

        const langInfo = SUPPORTED_LANGUAGES.find(
          (l) => l.code.toLowerCase() === bookLang.toLowerCase()
        );
        const langLabel = langInfo ? ` • ${langInfo.flag} ${langInfo.name}` : '';
        showToast(`Cargado "${sample.title}"${langLabel}`);

        if (autoPlay) {
          setTimeout(() => {
            speakSentence(0, 0, speed, voicePreset, false, smartRhythm, bookLang);
          }, 100);
        }
      });
    }
  };

  // Handle PDF/TXT file upload
  const handleFileUpload = async (file: File) => {
    const bookTitle = file.name.replace(/\.[^/.]+$/, '');
    triggerPdfOpenWithAdCheck(bookTitle, async () => {
      setIsLoadingFile(true);
      speechEngine.stop();
      setIsPlaying(false);

      try {
        let parsedDoc: PDFDocumentData;
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          const arrayBuffer = await file.arrayBuffer();
          parsedDoc = await parsePdfArrayBuffer(arrayBuffer, file.name);
        } else {
          const text = await file.text();
          parsedDoc = createDocumentFromText(file.name.replace(/\.[^/.]+$/, ''), text);
        }

        setDocument(parsedDoc);
        setCurrentPageIndex(0);
        setCurrentSentenceIndex(0);

        // Auto-detect language from book sample text with fallback to Spanish default
        const sampleText =
          parsedDoc.pages[0]?.sentences.slice(0, 8).join(' ') ||
          parsedDoc.pages[0]?.text ||
          '';
        const detected = detectLanguage(sampleText);
        setLanguage(detected);
        languageRef.current = detected;
        updateSettings({ language: detected });

        sounds.playDocumentLoaded();
        recordBookHistory(parsedDoc, 0, 0);

        const langInfo = SUPPORTED_LANGUAGES.find(
          (l) => l.code.toLowerCase() === detected.toLowerCase()
        );
        const langLabel = langInfo ? ` • Idioma: ${langInfo.flag} ${langInfo.name}` : '';
        showToast(`"${parsedDoc.title}" cargado (${parsedDoc.totalPages} págs.)${langLabel}`);
      } catch (err) {
        console.error('Error loading file:', err);
        sounds.playPause();
        showToast('Error al leer el archivo. Asegúrate de que no esté corrupto ni protegido por contraseña.');
      } finally {
        setIsLoadingFile(false);
      }
    });
  };

  // Return to Menu / Library View (Boton de volver al menú)
  const handleReturnToMenu = () => {
    speechEngine.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setIsImmersiveMode(false);
    backgroundAudioService.stopBackgroundPlayback();
    if (document) {
      recordBookHistory(document, currentPageIndex, currentSentenceIndex);
    }
    setDocument(null);
    sounds.playClick(450);
    showToast('Has vuelto al menú principal y biblioteca de libros');
  };

  // Resume Book from Playback History
  const handleResumeBookFromHistory = (item: BookHistoryItem) => {
    // If currently active doc matches
    if (document && (document.fileName === item.fileName || document.title === item.title)) {
      const targetPage = Math.min(document.totalPages - 1, Math.max(0, item.lastPageIndex));
      const targetSentence = Math.max(0, item.lastSentenceIndex || 0);
      setCurrentPageIndex(targetPage);
      setCurrentSentenceIndex(targetSentence);
      speakSentence(targetPage, targetSentence);
      showToast(`Reanudando "${document.title}" (Pág. ${targetPage + 1})`);
      setIsHistoryOpen(false);
      return;
    }

    triggerPdfOpenWithAdCheck(item.title, () => {
      // Try finding in sample books
      const sample = SAMPLE_BOOKS.find(
        (b) =>
          b.doc.fileName === item.fileName ||
          b.title === item.title ||
          b.id === item.sampleId ||
          b.id === item.id
      );
      if (sample) {
        setDocument(sample.doc);
        const targetPage = Math.min(sample.doc.totalPages - 1, Math.max(0, item.lastPageIndex));
        const targetSentence = Math.max(0, item.lastSentenceIndex || 0);
        setCurrentPageIndex(targetPage);
        setCurrentSentenceIndex(targetSentence);
        setLanguage(sample.language);
        updateSettings({ language: sample.language });
        speakSentence(targetPage, targetSentence);
        sounds.playDocumentLoaded();
        showToast(`Reanudando "${sample.title}" en Pág. ${targetPage + 1}`);
        setIsHistoryOpen(false);
      } else {
        showToast(`Para continuar con "${item.title}", carga su archivo "${item.fileName}".`);
      }
    });
  };

  // Remove single history item
  const handleRemoveHistoryItem = (id: string) => {
    const updated = removeHistoryItem(id);
    setHistory(updated);
    sounds.playTick();
    showToast('Elemento eliminado del historial');
  };

  // Clear all history
  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    sounds.playTick();
    showToast('Historial vaciado');
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      sounds.playDocumentLoaded();
      handleFileUpload(file);
    }
  };

  // Bookmarked sentences set for fast page lookups
  const bookmarkedSentencesOnPage = React.useMemo(() => {
    const set = new Set<number>();
    if (!document) return set;
    const pageNum = currentPageIndex + 1;
    bookmarks.forEach((bm) => {
      if (
        (bm.docFileName === document.fileName || bm.docTitle === document.title) &&
        bm.pageNumber === pageNum
      ) {
        set.add(bm.sentenceIndex);
      }
    });
    return set;
  }, [bookmarks, document, currentPageIndex]);

  const isCurrentSentenceBookmarked = bookmarkedSentencesOnPage.has(currentSentenceIndex);

  const activeSentenceText =
    document && document.pages[currentPageIndex]?.sentences[currentSentenceIndex]
      ? document.pages[currentPageIndex].sentences[currentSentenceIndex]
      : '';

  return (
    <div
      id="app-root"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`min-h-screen w-full relative flex flex-col font-sans-clean select-none transition-colors duration-300 ${
        effectiveIsDark ? 'text-neutral-100' : 'text-neutral-900'
      }`}
    >
      {/* Nostalgic Giant Library with Center Microphone & Reading Cloth Puppet Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={libraryPuppetBg}
          alt="Biblioteca gigante con un micrófono en medio y un muñeco de tela leyendo un libro con ese micrófono"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-center transform scale-105 transition-all duration-700 ${
            effectiveIsDark ? 'brightness-[0.50] contrast-[1.06]' : 'brightness-[0.75] contrast-[1.02]'
          }`}
          loading="eager"
        />
        {/* Warm golden vignette & subtle dark overlay for crisp legibility and low battery consumption */}
        <div
          className={`absolute inset-0 transition-colors duration-500 ${
            effectiveIsDark
              ? 'bg-neutral-950/65 mix-blend-multiply'
              : 'bg-amber-950/15 mix-blend-soft-light'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-neutral-950/75" />
      </div>

      {/* Floating PWA Install & Native App Mode Banner (Dismissible, only shown when running in browser) */}
      {!isImmersiveMode && (
        <InstallAppBanner
          isInstalled={isInstalled}
          isInstallable={isInstallable}
          onOpenModal={() => setIsInstallModalOpen(true)}
          onInstall={installPWA}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
      )}

      {/* Main Header - Hidden in Immersive Mode */}
      {!isImmersiveMode && (
        <Header
          appName="LectorZews"
          theme={theme}
          onCycleTheme={handleCycleTheme}
          soundsEnabled={soundsEnabled}
          onToggleSounds={handleToggleSounds}
          onOpenBookmarks={() => setIsBookmarksOpen(true)}
          bookmarksCount={bookmarks.length}
          voicePreset={voicePreset}
          onOpenVoicesModal={() => setIsVoicesOpen(true)}
          onFileUpload={handleFileUpload}
          isLoadingFile={isLoadingFile}
          hasDocument={!!document}
          sleepTimerState={sleepTimer}
          onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
          onOpenAndroidExport={() => setIsAndroidModalOpen(true)}
          onReturnToMenu={handleReturnToMenu}
          onOpenHistory={() => setIsHistoryOpen(true)}
          historyCount={history.length}
          isImmersiveMode={isImmersiveMode}
          onToggleImmersiveMode={() => handleToggleImmersive()}
          onOpenBackgroundAudio={() => setIsBackgroundModalOpen(true)}
          isPlaying={isPlaying}
          isInstalled={isInstalled}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
      )}

      {/* Floating Immersive Mode Controls (Exit button & playback indicator) */}
      {isImmersiveMode && (
        <div
          id="immersive-floating-controls"
          className="fixed top-4 right-4 sm:top-5 sm:right-6 z-50 flex items-center gap-2 animate-fadeIn"
        >
          {/* Quick Play/Pause button in immersive mode */}
          {document && (
            <button
              id="btn-immersive-floating-play"
              onClick={() => {
                if (isPlaying) {
                  sounds.playPause();
                } else {
                  sounds.playPlay();
                }
                handlePlayPause();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-900 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-xl text-xs font-medium transition active:scale-95 opacity-80 hover:opacity-100"
              title={isPlaying ? 'Pausar audio' : 'Continuar escuchando en segundo plano'}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-amber-300" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-amber-300" />
              )}
              <span className="hidden sm:inline font-mono">
                {isPlaying ? 'Pausar' : 'Escuchar'} (Pág. {currentPageIndex + 1}/{document.totalPages})
              </span>
            </button>
          )}

          {/* Button to Exit Immersive Mode */}
          <button
            id="btn-exit-immersive-floating"
            onClick={() => handleToggleImmersive(false)}
            className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900/90 hover:bg-neutral-900 text-neutral-200 hover:text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-2xl text-xs font-semibold transition-all duration-200 active:scale-95 opacity-80 hover:opacity-100"
            title="Salir del Modo Inmersivo (Esc)"
          >
            <Minimize2 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Salir de Modo Inmersivo</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] rounded bg-neutral-800 border border-neutral-700 text-neutral-400 font-mono">
              Esc
            </kbd>
          </button>
        </div>
      )}

      {/* Drag overlay indicator */}
      {isDragging && (
        <div
          id="global-drag-overlay"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-amber-950/85 backdrop-blur-md border-4 border-dashed border-amber-400 p-8 text-amber-200 pointer-events-none animate-pulse"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-300 mb-4">
            <span className="text-3xl">📄</span>
          </div>
          <h3 className="text-2xl font-bold font-title">Suelta tu archivo PDF aquí</h3>
          <p className="text-sm text-amber-300/80 mt-1">LectorZews lo preparará al instante</p>
        </div>
      )}

      {/* Main Document Reader Content */}
      <main className="flex-1 relative z-10 overflow-y-auto">
        <DocumentReader
          document={document}
          currentPageIndex={currentPageIndex}
          currentSentenceIndex={currentSentenceIndex}
          isPlaying={isPlaying}
          onSentenceClick={handleSentenceClick}
          onBookmarkSentence={(sIdx) => {
            setCurrentSentenceIndex(sIdx);
            handleAddCurrentBookmark();
          }}
          bookmarkedSentencesOnPage={bookmarkedSentencesOnPage}
          onSelectSampleBook={handleSelectSampleBook}
          onUploadClick={() => {
            const input = window.document.getElementById('hidden-file-input') as HTMLInputElement;
            if (input) input.click();
          }}
          isDragging={isDragging}
          fontSize="md"
          onReturnToMenu={handleReturnToMenu}
          history={history}
          onResumeBook={handleResumeBookFromHistory}
          onOpenHistory={() => setIsHistoryOpen(true)}
          isImmersiveMode={isImmersiveMode}
          onToggleImmersiveMode={() => handleToggleImmersive()}
        />
      </main>

      {/* Google AdMob Banner */}
      {!isImmersiveMode && (
        <div
          id="admob-banner-dock"
          className={`w-full z-20 pointer-events-none transition-all ${
            document
              ? 'fixed bottom-[78px] sm:bottom-[76px] left-0 right-0'
              : 'relative mt-4 mb-6'
          }`}
        >
          <AdMobBanner
            hasAudioPlayer={!!document}
            isImmersiveMode={isImmersiveMode}
            pdfOpenCount={pdfOpenCount}
            onOpenInterstitialPreview={handlePreviewInterstitial}
          />
        </div>
      )}

      {/* Minimalist Rounded Audio Player Dock - Hidden in Immersive Mode */}
      {!isImmersiveMode && document && (
        <AudioPlayerBar
          isPlaying={isPlaying}
          isPaused={isPaused}
          onPlayPause={handlePlayPause}
          onPrevSentence={handlePrevSentence}
          onNextSentence={handleNextSentence}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          onRestartPage={handleRestartPage}
          currentPage={currentPageIndex + 1}
          totalPages={document.totalPages}
          currentSentence={currentSentenceIndex}
          totalSentencesInPage={document.pages[currentPageIndex]?.sentences.length || 0}
          currentSpeed={speed}
          onSpeedChange={handleSpeedChange}
          onAddBookmark={() => handleAddCurrentBookmark()}
          isCurrentSentenceBookmarked={isCurrentSentenceBookmarked}
          activeSentenceText={activeSentenceText}
          sleepTimerState={sleepTimer}
          onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
          smartRhythm={smartRhythm}
          onToggleSmartRhythm={handleToggleSmartRhythm}
          onReturnToMenu={handleReturnToMenu}
          onOpenHistory={() => setIsHistoryOpen(true)}
          isImmersiveMode={isImmersiveMode}
          onToggleImmersiveMode={() => handleToggleImmersive()}
          onOpenBackgroundAudio={() => setIsBackgroundModalOpen(true)}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-neutral-900/95 border border-amber-500/40 text-amber-200 text-xs font-medium shadow-2xl backdrop-blur-md flex items-center gap-2 animate-fadeIn"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bookmarks and Favorites Dedicated Modal */}
      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        favorites={favorites}
        currentDoc={document}
        currentPage={currentPageIndex + 1}
        currentSentence={currentSentenceIndex}
        onJumpToBookmark={handleJumpToBookmark}
        onDeleteBookmark={handleDeleteBookmark}
        onUpdateNote={handleUpdateBookmarkNote}
        onAddCurrentBookmark={handleAddCurrentBookmark}
        onSelectFavorite={handleSelectFavorite}
        onToggleFavoriteDoc={handleToggleFavoriteDoc}
        isCurrentDocFavorite={document ? isFavorite(document.fileName) : false}
      />

      {/* Voices Selector Modal (Femenina & Masculina) */}
      <VoiceSelectorModal
        isOpen={isVoicesOpen}
        onClose={() => setIsVoicesOpen(false)}
        currentVoicePreset={voicePreset}
        onSelectVoicePreset={handleSelectVoicePreset}
        speed={speed}
        onSpeedChange={handleSpeedChange}
        smartRhythm={smartRhythm}
        onToggleSmartRhythm={handleToggleSmartRhythm}
      />

      {/* Sleep Timer Dedicated Modal */}
      <SleepTimerModal
        isOpen={isSleepTimerOpen}
        onClose={() => setIsSleepTimerOpen(false)}
        timerState={sleepTimer}
        onStartTimer={handleStartSleepTimer}
        onCancelTimer={handleCancelSleepTimer}
        onAddMinutes={handleAddTimerMinutes}
        isDarkMode={effectiveIsDark}
        onEnableDarkMode={() => {
          setTheme('dark');
          updateSettings({ theme: 'dark' });
          showToast('Modo oscuro activado para mayor confort visual y ahorro de batería');
        }}
      />

      {/* Reading Playback History Modal (Reloj) */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onResumeBook={handleResumeBookFromHistory}
        onRemoveHistoryItem={handleRemoveHistoryItem}
        onClearHistory={handleClearHistory}
      />

      {/* Android Export & Installation Modal */}
      <AndroidExportModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        appUrl={
          typeof window !== 'undefined'
            ? window.location.href.split('?')[0].split('#')[0]
            : 'https://ais-pre-cxm7wkta7spmumbtfoypxx-461780136931.us-west2.run.app'
        }
      />

      {/* Background Audio Modal */}
      <BackgroundAudioModal
        isOpen={isBackgroundModalOpen}
        onClose={() => setIsBackgroundModalOpen(false)}
        isPlaying={isPlaying}
        onTogglePlay={handlePlayPause}
        bookTitle={document?.title}
      />

      {/* Google AdMob Full-Screen Interstitial Ad Modal (Active on 3rd PDF opening) */}
      <AdMobInterstitialModal
        isOpen={isInterstitialOpen}
        onClose={handleCloseInterstitial}
        pdfTitle={interstitialBookTitle}
        isTestPreview={isInterstitialTestPreview}
      />

      {/* Standalone Native App Installation Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        isInstalled={isInstalled}
        isInstallable={isInstallable}
        isIOS={isIOS}
        isAndroid={isAndroid}
        isFullscreen={isFullscreen}
        onInstall={installPWA}
        onToggleFullscreen={toggleFullscreen}
        onOpenAndroidExport={() => setIsAndroidModalOpen(true)}
      />
    </div>
  );
}
