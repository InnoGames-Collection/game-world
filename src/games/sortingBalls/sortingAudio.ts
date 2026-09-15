/**
 * SORTING BALLS - Procedural Web Audio Sound Engine
 * Zero external audio files, pure browser Web Audio API synthesis.
 * Sophisticated acoustic design: crystal resonances, warm overtone chords,
 * tactile glass taps, and uplifting celebratory fanfares.
 */

class SortingAudioEngine {
  private ctx: AudioContext | null = null;
  public isAudioEnabled: boolean = true;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Source Selection: Crisp, light tactile glass tap
   */
  public playSelect() {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // High subtle crystal ping + quick pop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.05);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Sequential Ball Launch: Clean subtle tone that pitches up with each successive ball
   * Automatic same-color sequence:
   * Ball 1 -> soft tone (440 Hz)
   * Ball 2 -> slightly higher tone (523.25 Hz)
   * Ball 3 -> slightly higher tone (659.25 Hz)
   * Ball 4 -> slightly higher tone (783.99 Hz)
   * Communicates: "Good — keep going."
   */
  public playSequentialBallLaunch(stepIndex: number = 0) {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Soft harmonious pentatonic progression
      const progressionFreqs = [440.0, 523.25, 659.25, 783.99];
      const freq = progressionFreqs[Math.min(stepIndex, progressionFreqs.length - 1)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // Gentle subtle swell and fade, never harsh or blaring
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Ball Settle: Soft glass/plastic click
   * Tactile, muted marble seating into place
   */
  public playBallSettle(stepIndex: number = 0) {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Dual resonant body for natural acoustic plastic/glass click
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.045);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Single move: Soft tactile puzzle sound
   */
  public playDrop() {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(392.0, now); // G4 warm tone
      osc.frequency.exponentialRampToValueAtTime(349.23, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.10, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Group Move: Richer satisfying multi-tone chord
   * Plays harmonic chord based on group size (2, 3, or 4 balls!)
   */
  public playGroupMove(count: number = 2) {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Chords: 2 balls = Major third; 3 balls = Major triad; 4 balls = Major 7th
      const baseFreq = 440; // A4
      const intervals = count >= 4 ? [1, 1.25, 1.5, 1.875] : count === 3 ? [1, 1.25, 1.5] : [1, 1.25];

      intervals.forEach((ratio, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.035; // Slight staggered sweep

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * ratio, startTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * ratio * 1.05, startTime + 0.18);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.22);
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Combo Reward: Pleasant ascending crystal flourish for huge group transfers
   */
  public playCombo(count?: number) {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + idx * 0.055;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.16, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.18);
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Tube Completion: Pure resonant chord when a tube is completely sorted
   */
  public playTubeComplete() {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Majestic chord: C5 + E5 + G5 + C6
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.03;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Invalid Move Feedback: Soft, muted gentle bump (never harsh or annoying)
   */
  public playInvalid() {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(95, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Rewind chirp when undoing a move
   */
  public playUndo() {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.11);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Rewarding short musical phrase when level is completed
   * Subtle, pleasant, non-irritating harmonic cadence
   */
  public playWin() {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [
        { freq: 523.25, time: 0.00 }, // C5
        { freq: 659.25, time: 0.10 }, // E5
        { freq: 783.99, time: 0.20 }, // G5
        { freq: 1046.5, time: 0.32 }, // C6
      ];

      notes.forEach(({ freq, time }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + time;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
    } catch {
      // Audio fallback
    }
  }

  public playLevelWin() {
    this.playWin();
  }

  /**
   * Clean UI button tap
   */
  public playButton() {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio fallback
    }
  }
}

export const sortingAudio = new SortingAudioEngine();
