/**
 * Solitaire Procedural Web Audio Engine & Haptics
 * High-fidelity card acoustics: soft paper rustles, crisp felt snaps, rising foundation chords,
 * and soothing ambient acoustic guitar/piano music loop.
 * 100% original, zero external asset dependencies.
 */

class SolitaireAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private musicGainNode: GainNode | null = null;
  private musicTimer: any = null;
  private isMusicPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public setSoundEnabled(enabled: boolean) {
    this.isMuted = !enabled;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMusicMuted(muted: boolean) {
    this.isMusicMuted = muted;
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(muted ? 0 : 0.08, this.ctx.currentTime);
    }
  }

  public setMusicEnabled(enabled: boolean) {
    this.setMusicMuted(!enabled);
  }

  public getMusicMuted(): boolean {
    return this.isMusicMuted;
  }

  public triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'celebrate') {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        if (type === 'light') navigator.vibrate(10);
        else if (type === 'medium') navigator.vibrate(22);
        else if (type === 'heavy') navigator.vibrate([25, 30, 40]);
        else if (type === 'celebrate') navigator.vibrate([40, 60, 40, 60, 120]);
      } catch {
        // Haptics not allowed
      }
    }
  }

  // 1. Button Tap
  public playButton() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(820, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  // 2. Card Pickup / Lift
  public playCardPickup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('light');

    // High filtered noise burst for crisp paper rustle
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  // 3. Card Placement / Snap on Felt
  public playCardPlace() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('light');

    const now = this.ctx.currentTime;
    // Low body tap (felt thump)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.06);

    oscGain.gain.setValueAtTime(0.2, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);

    // High paper click
    const osc2 = this.ctx.createOscillator();
    const osc2Gain = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1200, now);
    osc2.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    osc2Gain.gain.setValueAtTime(0.1, now);
    osc2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    osc2.connect(osc2Gain);
    osc2Gain.connect(this.ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.045);
  }

  // 4. Card Flip (reveal hidden card)
  public playCardFlip() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('medium');

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  // 5. Foundation Placement Chord (Harmonic chime based on card rank 1..13)
  public playFoundation(rank: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('medium');

    const now = this.ctx.currentTime;
    // Scale frequencies (C major / pentatonic chord progression ascending)
    const baseFreqs = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880.00];
    const freq = baseFreqs[Math.min(rank - 1, baseFreqs.length - 1)] || 440;

    // Harmonic bell
    [1, 2, 3].forEach((mult, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq * mult, now);

      const amp = 0.15 / (idx + 1);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35 + idx * 0.05);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    });
  }

  // 6. Invalid Move / Error
  public playInvalid() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('light');

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.12);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  // 7. Stock Deal Slide
  public playStockDraw() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('light');

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.07);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // 8. Stock Recycle / Shuffle
  public playShuffle() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300 + Math.random() * 300, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      }, i * 35);
    }
  }

  // 9. Undo Move
  public playUndo() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.09);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // 10. Auto-Complete Cascade Note
  public playCascadeTick(index: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3, 659.3];
    const freq = notes[index % notes.length];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // 11. Level Victory Fanfare
  public playWin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('celebrate');

    const melody = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.14 }, // G5
      { f: 1046.5, d: 0.35 }, // C6
    ];

    let delay = 0;
    melody.forEach((note) => {
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + note.d);
      }, delay * 1000);
      delay += note.d * 0.85;
    });
  }

  // 12. Gentle Acoustic Ambient Lounge Background Music Loop
  public startMusic() {
    if (this.isMusicPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    this.musicGainNode = this.ctx.createGain();
    this.musicGainNode.gain.setValueAtTime(this.isMusicMuted ? 0 : 0.07, this.ctx.currentTime);
    this.musicGainNode.connect(this.ctx.destination);

    // Warm relaxing chord arpeggio loop: Am7 -> Fmaj7 -> C -> G
    const chords = [
      [220.0, 261.63, 329.63, 392.0], // A3, C4, E4, G4
      [174.61, 220.0, 261.63, 329.63], // F3, A3, C4, E4
      [261.63, 329.63, 392.0, 523.25], // C4, E4, G4, C5
      [196.0, 246.94, 293.66, 392.0],  // G3, B3, D4, G4
    ];

    let step = 0;
    this.musicTimer = setInterval(() => {
      if (!this.ctx || !this.isMusicPlaying || this.isMusicMuted) return;
      const now = this.ctx.currentTime;

      const chordIndex = Math.floor(step / 4) % chords.length;
      const noteIndex = step % 4;
      const freq = chords[chordIndex][noteIndex];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      osc.connect(gain);
      if (this.musicGainNode) {
        gain.connect(this.musicGainNode);
      }
      osc.start(now);
      osc.stop(now + 0.75);

      step++;
    }, 400);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  public startAmbientMusic() {
    this.startMusic();
  }

  public stopAmbientMusic() {
    this.stopMusic();
  }

  // 13. Hint Chime
  public playHint() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('light');

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5
    osc.frequency.setValueAtTime(1174.66, this.ctx.currentTime + 0.08); // D6

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  // 14. Fail / Deadlock Sound
  public playFail() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('heavy');

    const notes = [293.66, 277.18, 261.63, 220.0]; // D4, C#4, C4, A3
    let timeOffset = 0;
    notes.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + timeOffset);

      gain.gain.setValueAtTime(0.1, this.ctx!.currentTime + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + timeOffset + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(this.ctx!.currentTime + timeOffset);
      osc.stop(this.ctx!.currentTime + timeOffset + 0.25);
      timeOffset += 0.15;
    });
  }
}

export const soundManager = new SolitaireAudioEngine();
