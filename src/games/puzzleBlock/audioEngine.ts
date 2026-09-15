/**
 * Procedural Web Audio Engine for Puzzle Block
 * 100% synthetic audio, zero external sound files.
 */

class PuzzleBlockAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private musicGainNode: GainNode | null = null;
  private musicInterval: any = null;
  private musicStep: number = 0;

  constructor() {
    // Lazy audio context init
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.isMuted = !enabled;
  }

  public getSoundEnabled(): boolean {
    return !this.isMuted;
  }

  public setMusicEnabled(enabled: boolean) {
    this.isMusicMuted = !enabled;
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(this.isMusicMuted ? 0 : 0.05, this.ctx.currentTime);
    }
    if (enabled) {
      this.startAmbientMusic();
    } else {
      this.stopAmbientMusic();
    }
  }

  public getMusicEnabled(): boolean {
    return !this.isMusicMuted;
  }

  private triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        if (type === 'light') navigator.vibrate(10);
        else if (type === 'medium') navigator.vibrate(25);
        else if (type === 'heavy') navigator.vibrate([30, 40, 30]);
      } catch {
        // Ignore haptic failures
      }
    }
  }

  // 1. Button Tap
  public playButtonTap() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('light');

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  // 2. Piece Pickup
  public playPiecePickup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('light');

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(520, this.ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // 3. Piece Placement (Wooden snap click)
  public playPiecePlace() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('medium');

    const now = this.ctx.currentTime;
    
    // Wooden knock body
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.07);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);

    // Subtle wooden click burst
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(900, now);
    clickGain.gain.setValueAtTime(0.1, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    clickOsc.connect(clickGain);
    clickGain.connect(this.ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.02);
  }

  // 4. Invalid Placement (Rejection thud)
  public playInvalid() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('heavy');

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.14);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // 5. Line Clear (Bright ascending harmonic chime)
  public playLineClear(linesCount: number = 1) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('medium');

    const baseNotes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const count = Math.min(linesCount * 2 + 2, 7);

    for (let i = 0; i < count; i++) {
      const freq = (baseNotes[i % baseNotes.length] || 523.25) * Math.pow(1.05946, Math.floor(i / 4) * 12);
      const startTime = this.ctx.currentTime + i * 0.06;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.14, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.28);
    }
  }

  // 6. Combo Fanfare
  public playCombo(comboLevel: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('heavy');

    const chords = [
      [523.25, 659.25, 783.99], // C Major
      [587.33, 739.99, 880.0],  // D Major
      [659.25, 830.61, 987.77], // E Major
      [783.99, 987.77, 1174.66, 1567.98], // G Major + Octave
    ];

    const chord = chords[Math.min(comboLevel - 1, chords.length - 1)] || chords[0];
    const now = this.ctx.currentTime;

    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.12, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + 0.45);
    });
  }

  // 7. Blocker Hit / Destroy (Wood crackle / Ice shatter)
  public playBlockerHit(type: 'wood' | 'ice' | 'stone') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'ice') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.12);
      gain.gain.setValueAtTime(0.18, now);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
    }

    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // 8. Special Block (Bomb explosion or Laser zap)
  public playSpecial(type: 'bomb' | 'line') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('heavy');

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'bomb') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.linearRampToValueAtTime(1800, now + 0.2);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + (type === 'bomb' ? 0.4 : 0.25));
  }

  // 9. Reshuffle Whoosh
  public playReshuffle() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.25);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  // 10. Level Complete Fanfare
  public playLevelComplete() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('heavy');

    const melody = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.14 }, // G5
      { f: 1046.5, d: 0.35 }, // C6
    ];

    let offset = 0;
    melody.forEach(note => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, this.ctx!.currentTime + offset);

      gain.gain.setValueAtTime(0.18, this.ctx!.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + offset + note.d);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(this.ctx!.currentTime + offset);
      osc.stop(this.ctx!.currentTime + offset + note.d);
      offset += note.d * 0.85;
    });
  }

  // 11. Game Over (Mournful descending chord)
  public playGameOver() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('heavy');

    const notes = [392.0, 369.99, 329.63, 261.63]; // G4, F#4, E4, C4
    let offset = 0;
    notes.forEach(f => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx!.currentTime + offset);

      gain.gain.setValueAtTime(0.12, this.ctx!.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + offset + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(this.ctx!.currentTime + offset);
      osc.stop(this.ctx!.currentTime + offset + 0.35);
      offset += 0.18;
    });
  }

  // 12. Ambient Background Music (Marimba rhythm pattern)
  public startAmbientMusic() {
    if (this.musicInterval) return;
    this.initCtx();
    if (!this.ctx) return;

    this.musicGainNode = this.ctx.createGain();
    this.musicGainNode.gain.setValueAtTime(this.isMusicMuted ? 0 : 0.04, this.ctx.currentTime);
    this.musicGainNode.connect(this.ctx.destination);

    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // C D E G A C
    const pattern = [0, 2, 4, 3, 2, 0, 4, 5, 3, 1, 0, 2];

    this.musicInterval = setInterval(() => {
      if (this.isMusicMuted || !this.ctx || this.ctx.state !== 'running') return;
      const noteIdx = pattern[this.musicStep % pattern.length];
      const freq = scale[noteIdx];
      this.musicStep++;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.musicGainNode!);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    }, 420);
  }

  public stopAmbientMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const puzzleBlockAudio = new PuzzleBlockAudioEngine();
