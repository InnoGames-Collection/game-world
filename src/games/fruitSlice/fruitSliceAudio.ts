import { FruitType } from './types';

/**
 * Pure Web Audio API Synthesizer for Fruit Slice
 * 100% reliable, zero external network downloads, zero latency.
 */
class FruitSliceAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private fuseOsc: OscillatorNode | null = null;
  private fuseGain: GainNode | null = null;
  private isFusePlaying: boolean = false;

  constructor() {
    // Lazy AudioContext initialization
  }

  private initCtx(): AudioContext | null {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    } catch {
      // AudioContext unavailable
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted && this.isFusePlaying) {
      this.stopBombFuse();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Fast Katana Blade Whoosh Swing
   */
  public playWhoosh(speedFactor: number = 1.0): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const duration = Math.max(0.08, Math.min(0.22, 0.18 / speedFactor));
      const now = ctx.currentTime;

      // Filtered Noise for airy air-cut friction
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800 * speedFactor, now);
      filter.frequency.exponentialRampToValueAtTime(2600 * speedFactor, now + duration * 0.4);
      filter.frequency.exponentialRampToValueAtTime(400, now + duration);
      filter.Q.setValueAtTime(2.8, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + duration * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Low blade whistle tone
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240 * speedFactor, now);
      osc.frequency.exponentialRampToValueAtTime(480 * speedFactor, now + duration * 0.35);
      osc.frequency.exponentialRampToValueAtTime(160, now + duration);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.linearRampToValueAtTime(0.08, now + duration * 0.3);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      whiteNoise.start(now);
      osc.start(now);
      whiteNoise.stop(now + duration);
      osc.stop(now + duration);
    } catch {
      // Audio node failure fallback
    }
  }

  /**
   * Squelchy, crunchy, juicy fruit slice impact
   */
  public playSlice(fruitType: FruitType): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      let baseFreq = 340;
      let snapFreq = 1800;
      let wetDecay = 0.18;

      switch (fruitType) {
        case 'watermelon':
          baseFreq = 220;
          snapFreq = 1200;
          wetDecay = 0.24;
          break;
        case 'apple':
        case 'pear':
          baseFreq = 480;
          snapFreq = 2600;
          wetDecay = 0.14;
          break;
        case 'coconut':
          baseFreq = 180;
          snapFreq = 950;
          wetDecay = 0.22;
          break;
        case 'orange':
        case 'lemon':
        case 'lime':
          baseFreq = 380;
          snapFreq = 2100;
          wetDecay = 0.20;
          break;
        case 'banana':
        case 'kiwi':
          baseFreq = 320;
          snapFreq = 1400;
          wetDecay = 0.19;
          break;
        case 'dragonfruit':
        case 'pomegranate':
          baseFreq = 290;
          snapFreq = 1900;
          wetDecay = 0.22;
          break;
        default:
          baseFreq = 350;
          snapFreq = 1600;
          wetDecay = 0.18;
      }

      // 1. Blade Contact Sharp Snap
      const snapOsc = ctx.createOscillator();
      snapOsc.type = 'triangle';
      snapOsc.frequency.setValueAtTime(snapFreq, now);
      snapOsc.frequency.exponentialRampToValueAtTime(180, now + 0.06);

      const snapGain = ctx.createGain();
      snapGain.gain.setValueAtTime(0.45, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);
      snapOsc.start(now);
      snapOsc.stop(now + 0.08);

      // 2. Juicy Squelch Burst (Noise with resonant filter)
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * wetDecay, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
      }
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(snapFreq * 1.5, now);
      filter.frequency.exponentialRampToValueAtTime(baseFreq, now + wetDecay);
      filter.Q.setValueAtTime(3.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.38, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + wetDecay);

      noiseSrc.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseSrc.start(now);
      noiseSrc.stop(now + wetDecay);

      // 3. Body resonance thump
      const bodyOsc = ctx.createOscillator();
      bodyOsc.type = 'sine';
      bodyOsc.frequency.setValueAtTime(baseFreq, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(60, now + wetDecay * 0.9);

      const bodyGain = ctx.createGain();
      bodyGain.gain.setValueAtTime(0.35, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + wetDecay * 0.9);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(ctx.destination);
      bodyOsc.start(now);
      bodyOsc.stop(now + wetDecay * 0.9);
    } catch {
      // Fallback
    }
  }

  /**
   * Ascending Chime Chords for Multi-Fruit Combos (2, 3, 4, 5+ combos)
   */
  public playCombo(comboCount: number): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High bright pentatonic frequencies
      const baseScale = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98]; // C5, E5, G5, C6, E6, G6
      const count = Math.min(6, Math.max(2, comboCount));

      for (let i = 0; i < count; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const noteFreq = baseScale[i % baseScale.length] * (comboCount > 4 ? 1.12 : 1.0);
        osc.frequency.setValueAtTime(noteFreq, now + i * 0.05);

        gain.gain.setValueAtTime(0.001, now + i * 0.05);
        gain.gain.linearRampToValueAtTime(0.24, now + i * 0.05 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.35);
      }
    } catch {
      // Fallback
    }
  }

  /**
   * High-Register Critical Sparkle Chime (+10 Points)
   */
  public playCritical(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const pitches = [1046.5, 1318.5, 1567.98, 2093.0]; // C6, E6, G6, C7

      pitches.forEach((p, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(p, now + idx * 0.04);

        gain.gain.setValueAtTime(0.001, now + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.04 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.45);
      });
    } catch {
      // Fallback
    }
  }

  /**
   * Dull Thud / Buzzer on Missed Fruit
   */
  public playMiss(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.22);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Fallback
    }
  }

  /**
   * Sizzling Bomb Fuse Audio (Continuous crackle while bomb airborne)
   */
  public startBombFuse(): void {
    if (this.isMuted || this.isFusePlaying) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      this.isFusePlaying = true;
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Random clicks and crackles
        output[i] = Math.random() > 0.94 ? (Math.random() * 2 - 1) * 0.7 : 0;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3500, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      (this as unknown as { fuseSource: AudioNode }).fuseSource = noise;
      this.fuseGain = gain;
    } catch {
      // Fallback
    }
  }

  public stopBombFuse(): void {
    this.isFusePlaying = false;
    try {
      const src = (this as unknown as { fuseSource?: AudioBufferSourceNode }).fuseSource;
      if (src) {
        src.stop();
        src.disconnect();
        (this as unknown as { fuseSource?: AudioBufferSourceNode }).fuseSource = undefined;
      }
      if (this.fuseGain) {
        this.fuseGain.disconnect();
        this.fuseGain = null;
      }
    } catch {
      // Fallback
    }
  }

  /**
   * Thunderous Sub-Bass Bomb Explosion
   */
  public playBombExplosion(): void {
    this.stopBombFuse();
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 1.2;

      // 1. Heavy sub-bass drop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.8);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(70, now + 0.9);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);

      // 2. Blast noise burst
      const bufSize = ctx.sampleRate * 0.8;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.18));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(800, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(120, now + 0.8);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.65, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.8);
    } catch {
      // Fallback
    }
  }

  /**
   * Metallic Katana Deflection Ping
   */
  public playBombDeflect(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High resonant steel ring
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2489, now); // D#7
      osc.frequency.exponentialRampToValueAtTime(2200, now + 0.4);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);

      // Secondary overtone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(3729, now); // A#7
      gain2.gain.setValueAtTime(0.25, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.35);
    } catch {
      // Fallback
    }
  }

  /**
   * Level Victory Fanfare
   */
  public playLevelComplete(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { f: 523.25, t: 0.0 }, // C5
        { f: 659.25, t: 0.12 }, // E5
        { f: 783.99, t: 0.24 }, // G5
        { f: 1046.5, t: 0.38 }, // C6
        { f: 1318.5, t: 0.54 }, // E6
      ];

      notes.forEach(({ f, t }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.001, now + t);
        gain.gain.linearRampToValueAtTime(0.25, now + t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + 0.45);
      });
    } catch {
      // Fallback
    }
  }

  /**
   * Game Over Melancholy Sequence
   */
  public playGameOver(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { f: 440.0, t: 0.0 },  // A4
        { f: 415.3, t: 0.18 }, // G#4
        { f: 392.0, t: 0.36 }, // G4
        { f: 329.63, t: 0.58 } // E4
      ];

      notes.forEach(({ f, t }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + t);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now + t);

        gain.gain.setValueAtTime(0.001, now + t);
        gain.gain.linearRampToValueAtTime(0.2, now + t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + 0.5);
      });
    } catch {
      // Fallback
    }
  }

  /**
   * Clean UI Button Click
   */
  public playButtonClick(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Fallback
    }
  }
}

export const fruitAudio = new FruitSliceAudioEngine();
