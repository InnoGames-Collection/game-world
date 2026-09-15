/**
 * EMOJI SORTING BALL - Procedural Web Audio Sound Engine
 * Zero external audio files, pure browser Web Audio API synthesis.
 * Sophisticated acoustic design: tactile bubbly pops, cheerful harmonic drops,
 * glass tube resonances, and uplifting celebratory fanfares.
 */

class EmojiSortingAudioEngine {
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
   * Source Selection: Bubbly tactile pop
   */
  public playSelect() {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.exponentialRampToValueAtTime(1280, now + 0.06);

      gain.gain.setValueAtTime(0.15, now);
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
   * Sequential Ball Launch: Clean subtle chime ascending with each successive ball
   */
  public playSequentialBallLaunch(stepIndex: number = 0) {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const freq = freqs[Math.min(stepIndex, freqs.length - 1)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.015);
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
   * Ball Settle: Tactile vinyl toy ball seating into place
   */
  public playBallSettle(stepIndex: number = 0) {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 420 - stepIndex * 25;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.05);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Standard Single Ball Drop
   */
  public playDrop() {
    this.playBallSettle(0);
  }

  /**
   * Coordinated Group Move: Harmonic chord
   */
  public playGroupMove(count: number) {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const chord = count >= 3 ? [523.25, 659.25, 783.99] : [523.25, 659.25];
      chord.forEach((freq, idx) => {
        const now = this.ctx!.currentTime + idx * 0.04;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + 0.16);
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Combo celebration
   */
  public playCombo(count: number) {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [659.25, 783.99, 1046.5, 1318.51];
      notes.slice(0, Math.min(count + 1, notes.length)).forEach((freq, idx) => {
        const now = this.ctx!.currentTime + idx * 0.06;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.10, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + 0.20);
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Tube Complete: Joyful chime
   */
  public playTubeComplete() {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      arpeggio.forEach((freq, idx) => {
        const now = this.ctx!.currentTime + idx * 0.055;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + 0.35);
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Level Complete Fanfare
   */
  public playLevelWin() {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const melody = [
        { f: 523.25, d: 0.12, t: 0.0 },
        { f: 659.25, d: 0.12, t: 0.12 },
        { f: 783.99, d: 0.14, t: 0.24 },
        { f: 1046.5, d: 0.35, t: 0.38 },
        { f: 880.00, d: 0.12, t: 0.65 },
        { f: 1046.5, d: 0.55, t: 0.78 },
      ];

      melody.forEach(({ f, d, t }) => {
        const now = this.ctx!.currentTime + t;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + d);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + d);
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Invalid Move: Soft muted bump
   */
  public playInvalid() {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(170, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.12);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Undo Move: Soft reverse whoosh
   */
  public playUndo() {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.14);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Standard UI Button Click
   */
  public playButton() {
    if (!this.isAudioEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.04);

      gain.gain.setValueAtTime(0.10, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Audio fallback
    }
  }
}

export const emojiSortingAudio = new EmojiSortingAudioEngine();
