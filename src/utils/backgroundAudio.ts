class BackgroundAudioService {
  private audio: HTMLAudioElement | null = null;
  private wakeLockSentinel: any = null;
  private isBackgroundActive = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      // silencio de 0.5 seg que hace que Android crea que es música
      this.audio.src = "https://cdn.pixabay.com/audio/2022/03/24/audio_0d3c9c9a56.mp3";
      this.audio.loop = true;
      this.audio.volume = 0.01;
      this.audio.preload = "auto";

      // Fallback a base64 silencioso en caso de estar offline o sin conexión a internet
      this.audio.onerror = () => {
        if (this.audio) {
          this.audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
        }
      };
    }
  }

  public async startBackgroundPlayback() {
    if (!this.audio) return;
    try {
      await this.audio.play();
      this.isBackgroundActive = true;
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'LectorZews leyendo',
          artist: 'En segundo plano',
          album: 'LectorZews',
          artwork: [
            { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
          ]
        });
      }
      await this.requestWakeLock();
    } catch (e) {
      console.warn('No se pudo iniciar audio fondo', e);
    }
  }

  public pauseBackgroundPlayback() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
  }

  public stopBackgroundPlayback() {
    if (this.audio) {
      this.audio.pause();
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
      if (navWithWakeLock.wakeLock) {
        this.wakeLockSentinel = await navWithWakeLock.wakeLock.request('screen');
      }
    } catch {}
  }

  private releaseWakeLock() {
    if (this.wakeLockSentinel) {
      try { this.wakeLockSentinel.release?.(); } catch {}
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
        navigator.mediaSession.metadata = new MediaMetadata({
          title: params.title || 'LectorZews leyendo',
          artist: `Pág. ${params.page} de ${params.totalPages || 1} • En segundo plano`,
          album: params.sentenceText
            ? params.sentenceText.slice(0, 100) + (params.sentenceText.length > 100 ? '...' : '')
            : 'LectorZews',
          artwork: [
            { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
          ]
        });
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
        if (callbacks.onPlay) navigator.mediaSession.setActionHandler('play', callbacks.onPlay);
        if (callbacks.onPause) navigator.mediaSession.setActionHandler('pause', callbacks.onPause);
        if (callbacks.onPrevSentence) {
          navigator.mediaSession.setActionHandler('previoustrack', callbacks.onPrevSentence);
          navigator.mediaSession.setActionHandler('seekbackward', callbacks.onPrevSentence);
        }
        if (callbacks.onNextSentence) {
          navigator.mediaSession.setActionHandler('nexttrack', callbacks.onNextSentence);
          navigator.mediaSession.setActionHandler('seekforward', callbacks.onNextSentence);
        }
        if (callbacks.onStop) navigator.mediaSession.setActionHandler('stop', callbacks.onStop);
      } catch {}
    }
  }
}

export const backgroundAudioService = new BackgroundAudioService();
export default backgroundAudioService;
