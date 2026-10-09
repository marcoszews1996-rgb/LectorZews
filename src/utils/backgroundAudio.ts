/**
 * BackgroundAudioService:
 * Mantiene la sesión de audio activa en Android y navegadores móviles para que la lectura
 * continúe sin interrupciones con la pantalla bloqueada o en segundo plano, exactamente
 * como un reproductor de música de Android (Spotify, Audible, YouTube Music).
 */

class BackgroundAudioService {
  private audio: HTMLAudioElement | null = null;
  private wakeLockSentinel: any = null;
  private isBackgroundActive = false;
  private carrierBlobUrl: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initCarrierAudio();
    }
  }

  /**
   * Genera en memoria un archivo WAV continuo de 2 segundos con modulación PCM subaudible (1/32768)
   * Esto obliga al motor de audio del sistema operativo Android (AudioFlinger / MediaSession)
   * a clasificar la app como un reproductor de música activo en primer plano, evitando
   * que el sistema suspenda el hilo de JavaScript o detenga la voz al apagar la pantalla.
   */
  private initCarrierAudio() {
    try {
      const sampleRate = 22050;
      const numSamples = sampleRate * 2; // 2 segundos
      const buffer = new ArrayBuffer(44 + numSamples * 2);
      const view = new DataView(buffer);

      // Cabecera RIFF/WAVE
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

      // Muestras alternadas sub-audibles
      let offset = 44;
      for (let i = 0; i < numSamples; i++) {
        view.setInt16(offset, i % 2 === 0 ? 1 : -1, true);
        offset += 2;
      }

      const blob = new Blob([buffer], { type: 'audio/wav' });
      this.carrierBlobUrl = URL.createObjectURL(blob);

      this.audio = new Audio();
      this.audio.src = this.carrierBlobUrl;
      this.audio.loop = true;
      this.audio.volume = 0.05;
      this.audio.preload = 'auto';
      (this.audio as any).playsInline = true;

      this.audio.onerror = () => {
        if (this.audio) {
          // Fallback en Base64
          this.audio.src =
            'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
        }
      };
    } catch (e) {
      console.warn('Error inicializando portadora de audio:', e);
    }
  }

  public async startBackgroundPlayback() {
    if (!this.audio) return;
    try {
      if (this.audio.paused) {
        await this.audio.play();
      }
      this.isBackgroundActive = true;

      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
      await this.requestWakeLock();
    } catch (e) {
      console.warn('No se pudo iniciar portadora de audio en segundo plano:', e);
    }
  }

  public pauseBackgroundPlayback() {
    if (this.audio && !this.audio.paused) {
      try {
        this.audio.pause();
      } catch {}
    }
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
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
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
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
