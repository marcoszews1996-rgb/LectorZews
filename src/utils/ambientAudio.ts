import { AmbientTrack, AmbientTrackId } from '../types';

export const AMBIENT_TRACKS: AmbientTrack[] = [
  {
    id: 'none',
    name: 'Solo Voz (Sin música)',
    badge: 'Silencio',
    description: 'Reproduce exclusivamente la voz del narrador con total nitidez y sin música.',
    icon: 'VolumeX',
  },
  {
    id: 'biblioteca',
    name: 'Biblioteca Acústica & Piano Cálido',
    badge: 'Acogedor',
    description: 'Armonías suaves de piano y pads analógicos cálidos. Ideal para concentración y lectura relajada.',
    icon: 'Library',
  },
  {
    id: 'lluvia',
    name: 'Lluvia Serena & Drones Meditativos',
    badge: 'Meditativo',
    description: 'Gotas de lluvia suave sobre la ventana con ondas armónicas zen a 432 Hz para inmersión profunda.',
    icon: 'CloudRain',
  },
];

class AmbientAudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentTrack: AmbientTrackId = 'none';
  private volume: number = 0.25;
  private isRunning: boolean = false;
  private activeNodes: { stop: () => void }[] = [];
  private loopTimer: number | null = null;
  private rainSource: AudioNode | null = null;

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setTrack(track: AmbientTrackId) {
    this.currentTrack = track;
    if (this.isRunning) {
      this.stop();
      if (track !== 'none') {
        this.start();
      }
    }
  }

  public getTrack(): AmbientTrackId {
    return this.currentTrack;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public isPlaying(): boolean {
    return this.isRunning;
  }

  public async start() {
    if (this.currentTrack === 'none') {
      this.stop();
      return;
    }

    const ctx = this.initContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {}
    }

    this.stopNodes();
    this.isRunning = true;

    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(ctx.currentTime);
      this.masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.01, this.volume), ctx.currentTime + 1.2);
    }

    if (this.currentTrack === 'biblioteca') {
      this.startBibliotecaTrack(ctx);
    } else if (this.currentTrack === 'lluvia') {
      this.startLluviaTrack(ctx);
    }
  }

  public pause() {
    this.stop();
  }

  public stop() {
    this.isRunning = false;
    if (this.masterGain && this.ctx && this.ctx.state !== 'closed') {
      try {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.2);
      } catch {}
    }
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        if (!this.isRunning) {
          this.stopNodes();
        }
      }, 350);
    } else {
      this.stopNodes();
    }
  }

  private stopNodes() {
    if (this.loopTimer !== null) {
      window.clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    this.activeNodes.forEach((n) => {
      try {
        n.stop();
      } catch {}
    });
    this.activeNodes = [];
    this.rainSource = null;
  }

  /**
   * Track 1: Biblioteca Acústica & Piano Cálido
   * Genera progresiones de acordes jazz/lo-fi cálidos y relajantes (Fmaj7, Cmaj7, Dm7, Am7, G6)
   * con envolventes suaves que recuerdan a un piano acústico en un salón espacioso.
   */
  private startBibliotecaTrack(ctx: AudioContext) {
    if (!this.masterGain) return;

    // Chords frequencies: [root, 3rd, 5th, 7th/9th]
    const chords = [
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [130.81, 196.00, 246.94, 329.63], // Cmaj7
      [146.83, 220.00, 261.63, 349.23], // Dm7
      [110.00, 164.81, 246.94, 293.66], // Am7 / Em
      [196.00, 246.94, 293.66, 392.00], // G6
    ];

    let chordIndex = 0;

    const playNextChord = () => {
      if (!this.isRunning || !this.ctx || this.ctx.state === 'closed') return;

      const currentChord = chords[chordIndex % chords.length];
      chordIndex++;

      const chordGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, ctx.currentTime);
      filter.Q.setValueAtTime(1.2, ctx.currentTime);

      chordGain.connect(filter);
      if (this.masterGain) {
        filter.connect(this.masterGain);
      }

      const now = ctx.currentTime;
      const duration = 5.2; // 5.2 segundos por acorde para cadencia pausada

      chordGain.gain.setValueAtTime(0.0001, now);
      chordGain.gain.exponentialRampToValueAtTime(0.18, now + 0.9);
      chordGain.gain.exponentialRampToValueAtTime(0.09, now + 3.0);
      chordGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      currentChord.forEach((freq, idx) => {
        // Oscilador principal cálido (triángulo suave)
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Ligero detune sutil estilo vintage tape
        osc.detune.setValueAtTime((idx - 1.5) * 4, now);

        osc.connect(chordGain);
        osc.start(now);
        osc.stop(now + duration + 0.1);

        this.activeNodes.push({
          stop: () => {
            try { osc.stop(); } catch {}
          },
        });
      });

      // Programar siguiente acorde con solapamiento suave
      this.loopTimer = window.setTimeout(playNextChord, 4600);
    };

    playNextChord();
  }

  /**
   * Track 2: Lluvia Serena & Drones Meditativos
   * Genera el sonido sutil de lluvia continua sobre cristales combinado con
   * un drone armónico zen a 432 Hz y 216 Hz que induce calma instantánea.
   */
  private startLluviaTrack(ctx: AudioContext) {
    if (!this.masterGain) return;

    // 1. Generador de lluvia basado en Pink Noise
    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filtro de lluvia (bandpass suave para simular gotas y agua exterior)
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(1100, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.22, ctx.currentTime);

    whiteNoise.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(this.masterGain);

    whiteNoise.start();
    this.rainSource = whiteNoise;
    this.activeNodes.push({
      stop: () => {
        try { whiteNoise.stop(); } catch {}
      },
    });

    // 2. Drone armónico Zen (432 Hz y 216 Hz) con modulación lenta de volumen
    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.08, ctx.currentTime);
    droneGain.connect(this.masterGain);

    [216, 324, 432].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.detune.setValueAtTime(idx * 2 - 2, ctx.currentTime);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.06 / (idx + 1), ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(droneGain);
      osc.start();

      this.activeNodes.push({
        stop: () => {
          try { osc.stop(); } catch {}
        },
      });
    });
  }
}

export const ambientAudioService = new AmbientAudioService();
