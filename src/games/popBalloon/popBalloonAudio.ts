/**
 * Pop Balloon Audio Synthesizer
 * Zero-latency Web Audio sound synthesizer for popping balloons, misses, wrong taps, countdowns, and UI.
 */

class PopBalloonAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private popNoteIndex: number = 0;

  // Harmonious pitch multiplier offsets to make rapid pops sound melodious rather than repetitive
  private readonly POP_PITCH_INTERVALS = [1.0, 1.06, 1.14, 1.22, 1.32, 1.25, 1.18, 1.08];

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Premium, soft organic balloon pop sound
   * Clean pitch variation so rapid taps sound natural and pleasing without machine-gun harshness.
   */
  public playPop(comboCount: number = 0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Cycle through harmonious intervals + micro variation + slight combo boost
      const scaleOffset = this.POP_PITCH_INTERVALS[this.popNoteIndex % this.POP_PITCH_INTERVALS.length];
      this.popNoteIndex = (this.popNoteIndex + 1) % this.POP_PITCH_INTERVALS.length;

      const comboMod = Math.min(1.35, 1.0 + comboCount * 0.015);
      const microJitter = 1.0 + (Math.random() - 0.5) * 0.03;
      const pitchMultiplier = scaleOffset * comboMod * microJitter;

      // 1. Primary Tonal Body - Smooth acoustic pop sine drop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const startFreq = 540 * pitchMultiplier;
      const endFreq = 180 * pitchMultiplier;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.085);

      // Soft envelope: 1.5ms attack, 85ms smooth decay
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.32, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.085);

      // 2. Subtle Resonant Plop / Bubble layer (warm, non-harsh)
      const bubbleOsc = this.ctx.createOscillator();
      const bubbleGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      bubbleOsc.type = 'triangle';
      bubbleOsc.frequency.setValueAtTime(320 * pitchMultiplier, now);
      bubbleOsc.frequency.exponentialRampToValueAtTime(140 * pitchMultiplier, now + 0.06);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(460 * pitchMultiplier, now);
      filter.Q.setValueAtTime(2.5, now);

      bubbleGain.gain.setValueAtTime(0.0001, now);
      bubbleGain.gain.linearRampToValueAtTime(0.18, now + 0.003);
      bubbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      bubbleOsc.connect(filter);
      filter.connect(bubbleGain);
      bubbleGain.connect(this.ctx.destination);

      bubbleOsc.start(now);
      bubbleOsc.stop(now + 0.06);
    } catch {
      // Ignore audio errors
    }
  }

  /**
   * Countdown beep sound
   */
  public playCountdownBeep(isGo: boolean = false) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isGo ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isGo ? 880 : 440, now);

      const duration = isGo ? 0.25 : 0.12;
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Ignore audio errors
    }
  }

  /**
   * Wrong tap / empty space error sound
   */
  public playWrongTap() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.22);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Ignore audio errors
    }
  }

  /**
   * Balloon missed / reached bottom sound
   */
  public playMiss() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Ignore audio errors
    }
  }

  /**
   * Level Complete celebratory harmonic chime
   * Pleasant ascending chord (C5, E5, G5, C6) with soft shimmer
   */
  public playLevelComplete() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.24, now + idx * 0.09 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.35);
      });
    } catch {
      // Ignore audio errors
    }
  }

  /**
   * Gentle chime when advancing to next level
   */
  public playLevelStart() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.14); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // Ignore audio errors
    }
  }

  /**
   * Game Over harmonic tone
   */
  public playGameOver() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [349.23, 311.13, 277.18, 220]; // F4, Eb4, Db4, A3
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.22, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.28);
      });
    } catch {
      // Ignore audio errors
    }
  }
}

export const PopBalloonAudio = new PopBalloonAudioSynthesizer();
