/**
 * BackgroundAudioService:
 * Mantiene la sesión de audio activa en Android (TWA, PWA y navegadores móviles) para que la lectura
 * continúe sin interrupciones con la pantalla bloqueada, apagada o en segundo plano, exactamente
 * como un reproductor de música nativo de Android (Spotify, Audible, YouTube Music).
 */

class BackgroundAudioService {
  private audio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private oscillatorNode: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private wakeLockSentinel: any = null;
  private isBackgroundActive = false;
  private worker: Worker | null = null;
  private heartbeatListeners: Set<() => void> = new Set();
  private carrierBlobUrl: string | null = null;
  private isUnlocked = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initCarrierAudio();
      this.initWebWorkerHeartbeat();
      this.setupGlobalUnlockListener();
    }
  }

  /**
   * Desbloquea de forma proactiva el AudioContext y el elemento HTML5 Audio
   * en el primer toque/clic del usuario, evitando restricciones de autoplay en Android.
   */
  private setupGlobalUnlockListener() {
    if (typeof window === 'undefined') return;

    const handleUnlock = () => {
      this.unlock();
      window.removeEventListener('click', handleUnlock);
      window.removeEventListener('touchstart', handleUnlock);
      window.removeEventListener('keydown', handleUnlock);
    };

    window.addEventListener('click', handleUnlock, { passive: true });
    window.addEventListener('touchstart', handleUnlock, { passive: true });
    window.addEventListener('keydown', handleUnlock, { passive: true });
  }

  public unlock() {
    if (this.isUnlocked) return;
    this.isUnlocked = true;

    // 1. Desbloquear Web Audio API
    this.initAudioContext();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    // 2. Precargar audio carrier
    if (this.audio) {
      this.audio.play().then(() => {
        if (!this.isBackgroundActive) {
          this.audio?.pause();
        }
      }).catch(() => {});
    }
  }

  /**
   * Genera un búfer continuo PCM WAV con modulación acústica de baja frecuencia (55Hz a ganancia 0.005)
   * que registra actividad legítima ante el subsistema AudioFlinger de Android.
   */
  private initCarrierAudio() {
    try {
      const sampleRate = 22050;
      const numSamples = sampleRate * 3; // 3 segundos continuos
      const buffer = new ArrayBuffer(44 + numSamples * 2);
      const view = new DataView(buffer);

      // Cabecera RIFF/WAVE estándar
      view.setUint32(0, 0x52494646, false); // "RIFF"
      view.setUint32(4, 36 + numSamples * 2, true);
      view.setUint32(8, 0x57415645, false); // "WAVE"
      view.setUint32(12, 0x666d7420, false); // "fmt "
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM
      view.setUint16(22, 1, true); // Mono
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      view.setUint32(36, 0x64617461, false); // "data"
      view.setUint32(40, numSamples * 2, true);

      // Onda sinusoidal suave de 55 Hz (tono casi imperceptible que mantiene el DAC abierto)
      let offset = 44;
      const freq = 55;
      for (let i = 0; i < numSamples; i++) {
        const sample = Math.sin((2 * Math.PI * freq * i) / sampleRate) * 12; // Amplitud muy baja
        view.setInt16(offset, Math.floor(sample), true);
        offset += 2;
      }

      const blob = new Blob([buffer], { type: 'audio/wav' });
      this.carrierBlobUrl = URL.createObjectURL(blob);

      this.audio = new Audio();
      this.audio.src = this.carrierBlobUrl;
      this.audio.loop = true;
      this.audio.volume = 0.08;
      this.audio.preload = 'auto';
      (this.audio as any).playsInline = true;

      this.audio.onerror = () => {
        if (this.audio) {
          this.audio.src =
            'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
        }
      };
    } catch (e) {
      console.warn('Error inicializando portadora de audio:', e);
    }
  }

  /**
   * Inicializa un AudioContext persistente con oscilador inaudible.
   * Esto retiene AudioFocus de Android de manera constante.
   */
  private initAudioContext() {
    if (typeof window === 'undefined') return;
    if (!this.audioContext) {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
          this.gainNode = this.audioContext.createGain();
          this.gainNode.gain.setValueAtTime(0.001, this.audioContext.currentTime);

          this.oscillatorNode = this.audioContext.createOscillator();
          this.oscillatorNode.type = 'sine';
          this.oscillatorNode.frequency.setValueAtTime(40, this.audioContext.currentTime); // 40 Hz inaudible
          this.oscillatorNode.connect(this.gainNode);
          this.gainNode.connect(this.audioContext.destination);
          this.oscillatorNode.start();
        }
      } catch (e) {
        console.warn('Error inicializando WebAudio context:', e);
      }
    }
  }

  /**
   * Web Worker Heartbeat:
   * En Android, los timers de la ventana principal (setInterval) se suspenden al bloquear la pantalla.
   * Un Web Worker en segundo plano NO se congela y emite pulsos cada 250ms que reactivan
   * la síntesis de voz si Chromium intentó pausarla.
   */
  private initWebWorkerHeartbeat() {
    try {
      const workerScript = `
        let timer = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            if (!timer) {
              timer = setInterval(function() {
                self.postMessage('tick');
              }, 250);
            }
          } else if (e.data === 'stop') {
            if (timer) {
              clearInterval(timer);
              timer = null;
            }
          }
        };
      `;
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));
      this.worker.onmessage = () => {
        // En cada tick, invocar oyentes registrados
        this.heartbeatListeners.forEach((listener) => {
          try {
            listener();
          } catch {}
        });
      };
    } catch (e) {
      console.warn('Error inicializando worker heartbeat:', e);
    }
  }

  public onHeartbeat(listener: () => void): () => void {
    this.heartbeatListeners.add(listener);
    return () => {
      this.heartbeatListeners.delete(listener);
    };
  }

  public async startBackgroundPlayback() {
    this.unlock();
    this.isBackgroundActive = true;

    // Iniciar Web Worker heartbeat
    if (this.worker) {
      try {
        this.worker.postMessage('start');
      } catch {}
    }

    // Iniciar portadora de audio HTML5
    if (this.audio) {
      try {
        if (this.audio.paused) {
          await this.audio.play();
        }
      } catch (e) {
        console.warn('No se pudo reproducir audio carrier HTML5:', e);
      }
    }

    // Iniciar AudioContext
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch {}
    }

    // Activar estado de reproducción en MediaSession
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'playing';
      } catch {}
    }

    await this.requestWakeLock();
  }

  public pauseBackgroundPlayback() {
    if (this.audio && !this.audio.paused) {
      try {
        this.audio.pause();
      } catch {}
    }
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'paused';
      } catch {}
    }
    if (this.worker) {
      try {
        this.worker.postMessage('stop');
      } catch {}
    }
  }

  public stopBackgroundPlayback() {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch {}
    }
    this.isBackgroundActive = false;
    if (this.worker) {
      try {
        this.worker.postMessage('stop');
      } catch {}
    }
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'none';
      } catch {}
    }
    this.releaseWakeLock();
  }

  private async requestWakeLock() {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    try {
      const navWithWakeLock = navigator as any;
      if (navWithWakeLock.wakeLock && !this.wakeLockSentinel) {
        this.wakeLockSentinel = await navWithWakeLock.wakeLock.request('screen');
        this.wakeLockSentinel.addEventListener('release', () => {
          this.wakeLockSentinel = null;
        });
      }
    } catch {}
  }

  private releaseWakeLock() {
    if (this.wakeLockSentinel) {
      try {
        this.wakeLockSentinel.release?.();
      } catch {}
      this.wakeLockSentinel = null;
    }
  }

  public isBackgroundModeActive(): boolean {
    return this.isBackgroundActive;
  }

  public updateMetadata(params: {
    title: string;
    page: number;
    totalPages: number;
    sentenceText?: string;
  }) {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        const sentenceSnippet = params.sentenceText
          ? params.sentenceText.slice(0, 90) + (params.sentenceText.length > 90 ? '...' : '')
          : 'LectorZews';

        navigator.mediaSession.metadata = new MediaMetadata({
          title: params.title || 'LectorZews',
          artist: `Pág. ${params.page} de ${params.totalPages || 1} • LectorZews`,
          album: sentenceSnippet,
          artwork: [
            { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          ],
        });
        navigator.mediaSession.playbackState = 'playing';
      } catch {}
    }
  }

  public registerCallbacks(callbacks: {
    onPlay?: () => void;
    onPause?: () => void;
    onPrevSentence?: () => void;
    onNextSentence?: () => void;
    onPrevPage?: () => void;
    onNextPage?: () => void;
    onStop?: () => void;
  }) {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        if (callbacks.onPlay) {
          navigator.mediaSession.setActionHandler('play', () => {
            this.startBackgroundPlayback();
            callbacks.onPlay?.();
          });
        }
        if (callbacks.onPause) {
          navigator.mediaSession.setActionHandler('pause', () => {
            this.pauseBackgroundPlayback();
            callbacks.onPause?.();
          });
        }
        if (callbacks.onPrevSentence) {
          navigator.mediaSession.setActionHandler('previoustrack', callbacks.onPrevSentence);
          navigator.mediaSession.setActionHandler('seekbackward', callbacks.onPrevSentence);
        }
        if (callbacks.onNextSentence) {
          navigator.mediaSession.setActionHandler('nexttrack', callbacks.onNextSentence);
          navigator.mediaSession.setActionHandler('seekforward', callbacks.onNextSentence);
        }
        if (callbacks.onStop) {
          navigator.mediaSession.setActionHandler('stop', () => {
            this.stopBackgroundPlayback();
            callbacks.onStop?.();
          });
        }
      } catch (e) {
        console.warn('Error configurando MediaSession handlers:', e);
      }
    }
  }
}

export const backgroundAudioService = new BackgroundAudioService();
export default backgroundAudioService;
