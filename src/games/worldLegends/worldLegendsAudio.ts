/**
 * World Legends - Web Audio Synthesizer
 * Zero-latency tactile audio for word-connect drag, ascending pitches per letter,
 * sparkling word success, level completion fanfares, and coin chimes.
 */

class WorldLegendsAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  // Musical notes for ascending swipe sequence: C4, D4, E4, F4, G4, A4, B4, C5, D5
  private scaleFrequencies: number[] = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33];

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
   * Ascending musical note played as player swipes from letter to letter
   */
  public playTileConnect(letterIndex: number = 0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freqIdx = Math.min(this.scaleFrequencies.length - 1, Math.max(0, letterIndex));
      const baseFreq = this.scaleFrequencies[freqIdx];

      // Warm marimba/wooden chime tone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);

      // Subtle tactile wooden click
      const click = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      click.type = 'sine';
      click.frequency.setValueAtTime(850, now);
      click.frequency.exponentialRampToValueAtTime(200, now + 0.02);

      clickGain.gain.setValueAtTime(0.15, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      click.connect(clickGain);
      clickGain.connect(this.ctx.destination);

      click.start(now);
      click.stop(now + 0.025);
    } catch {
      // Ignore audio failure
    }
  }

  /**
   * Sound when moving backwards to remove a letter
   */
  public playTileRemove() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.055);
    } catch {}
  }

  /**
   * Rich triumphant chime when valid word is discovered
   */
  public playWordSuccess(combo: number = 0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = 523.25 * (1 + Math.min(0.4, combo * 0.08)); // Higher pitch on combos

      // 3-note harmonic arpeggio (Root, Major Third, Fifth)
      const chord = [baseFreq, baseFreq * 1.2599, baseFreq * 1.4983, baseFreq * 2];

      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteTime = now + idx * 0.045;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.24, noteTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.38);
      });
    } catch {}
  }

  /**
   * Subtle low error tone when invalid word is released
   */
  public playWordInvalid() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  /**
   * Bonus word discovered chime
   */
  public playBonusWord() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(784.0, now); // G5
      osc.frequency.setValueAtTime(1046.5, now + 0.08); // C6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  /**
   * Triumphant fanfare when all words in puzzle are completed
   */
  public playLevelComplete() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [
        { f: 523.25, t: 0.00 }, // C5
        { f: 659.25, t: 0.08 }, // E5
        { f: 783.99, t: 0.16 }, // G5
        { f: 1046.50, t: 0.24 }, // C6
      ];

      notes.forEach(({ f, t }) => {
        if (!this.ctx) return;
        const noteTime = now + t;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.28, noteTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.5);
      });
    } catch {}
  }

  /**
   * Letter shuffle sound
   */
  public playShuffle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      for (let i = 0; i < 4; i++) {
        const timeOffset = now + i * 0.035;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300 + Math.random() * 200, timeOffset);
        osc.frequency.exponentialRampToValueAtTime(120, timeOffset + 0.03);

        gain.gain.setValueAtTime(0.12, timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, timeOffset + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(timeOffset);
        osc.stop(timeOffset + 0.035);
      }
    } catch {}
  }

  /**
   * Clean UI button tap
   */
  public playButton() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {}
  }

  /**
   * Sparkling bell chime when hint reveals a letter
   */
  public playHintReveal() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [587.33, 880.00].forEach((f, idx) => {
        if (!this.ctx) return;
        const noteTime = now + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.22, noteTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.3);
      });
    } catch {}
  }

  /**
   * Subtle button/tile tap sound
   */
  public playTileTap() {
    this.playTileConnect(0);
  }

  /**
   * Game Over tournament conclusion tone
   */
  public playGameOver() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chord = [392.00, 329.63, 261.63];
      chord.forEach((f, idx) => {
        if (!this.ctx) return;
        const noteTime = now + idx * 0.12;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.55);
      });
    } catch {}
  }
}

export const WorldLegendsAudio = new WorldLegendsAudioSynthesizer();
