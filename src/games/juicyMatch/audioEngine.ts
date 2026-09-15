/**
 * Juicy Match - Procedural Web Audio Engine & Haptics
 * 100% original tropical sounds & cheerful marimba music loop.
 * Zero external audio assets required.
 */

class JuicyAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicGainNode: GainNode | null = null;
  private musicInterval: any = null;
  private isMusicPlaying: boolean = false;

  constructor() {
    // Initialized lazily on first user interaction
  }

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
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = muted ? 0 : 0.18;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'celebrate') {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        if (type === 'light') navigator.vibrate(12);
        else if (type === 'medium') navigator.vibrate(28);
        else if (type === 'heavy') navigator.vibrate([35, 40, 60]);
        else if (type === 'celebrate') navigator.vibrate([40, 50, 40, 50, 100]);
      } catch {
        // Haptics not allowed or unsupported
      }
    }
  }

  // 1. Fruit Select / Tap
  public playSelect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(780, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // 2. Fruit Swap (Smooth whoosh)
  public playSwap() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(480, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  // 3. Invalid Swap (Gentle soft spring bounce)
  public playInvalidSwap() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('light');

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.16);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  // 4. Juicy Match Pop (Pitch rises with cascade count!)
  public playMatch(cascadeIndex = 1) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('light');

    const baseFreqs = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    const pitch = baseFreqs[Math.min(cascadeIndex - 1, baseFreqs.length - 1)];

    // Fruit Pop sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.14);

    // Juice Squish droplet
    const droplet = this.ctx.createOscillator();
    const dropGain = this.ctx.createGain();
    droplet.type = 'triangle';
    droplet.frequency.setValueAtTime(pitch * 2, this.ctx.currentTime);
    droplet.frequency.exponentialRampToValueAtTime(pitch * 0.8, this.ctx.currentTime + 0.08);

    dropGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    dropGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    droplet.connect(dropGain);
    dropGain.connect(this.ctx.destination);
    droplet.start();
    droplet.stop(this.ctx.currentTime + 0.08);
  }

  // 5. Special Fruit Created (Match 4 or 5 magic sparkle)
  public playSpecialCreate() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('medium');

    const notes = [659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.04);

      gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.04 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.04);
      osc.stop(this.ctx.currentTime + idx * 0.04 + 0.25);
    });
  }

  // 6. Striped Fruit Line Blast
  public playStripedBeam() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('medium');

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.22);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  // 7. Fruit Bomb Explosion
  public playBombExplosion() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('heavy');

    // Deep sub thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.38);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.38);

    // Juice splash burst noise
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.25);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start();
  }

  // 8. Rainbow Super Fruit Activation
  public playRainbowLaser() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('heavy');

    const chords = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    chords.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime + i * 0.05);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.05 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + i * 0.05);
      osc.stop(this.ctx.currentTime + i * 0.05 + 0.4);
    });
  }

  // 9. Crate Break / Crack
  public playCrateBreak() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('light');

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.14);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.14);
  }

  // 10. Juice Splash / Puddle Clear
  public playJuiceClear() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(950, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // 11. Combo Celebrations (GOOD, AMAZING, JUICY MATCH!)
  public playComboFanfare(tier: 'good' | 'great' | 'amazing' | 'juicy' | 'juicy_match' | 'well_done') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('medium');

    const majorTriad = tier === 'good' ? [523.25, 659.25, 783.99] :
      tier === 'amazing' ? [587.33, 739.99, 880, 1174.66] :
      [523.25, 659.25, 783.99, 1046.5, 1318.51];

    majorTriad.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.05 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.05);
      osc.stop(this.ctx.currentTime + idx * 0.05 + 0.35);
    });
  }

  // 12. Level Complete Fanfare
  public playLevelComplete() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('celebrate');

    const melody = [
      { f: 523.25, t: 0.0 },
      { f: 659.25, t: 0.12 },
      { f: 783.99, t: 0.24 },
      { f: 1046.5, t: 0.36 },
      { f: 1046.5, t: 0.54 },
      { f: 1318.51, t: 0.72 },
    ];

    melody.forEach((note) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, this.ctx.currentTime + note.t);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + note.t + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + note.t);
      osc.stop(this.ctx.currentTime + note.t + 0.3);
    });
  }

  // 13. Level Fail sound
  public playLevelFail() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [440, 415.3, 392, 369.99];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.15);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.15 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.15);
      osc.stop(this.ctx.currentTime + idx * 0.15 + 0.25);
    });
  }

  // 14. Star Awarded Chime
  public playStarChime(starIndex: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.triggerHaptic('medium');

    const starFreqs = [783.99, 1046.5, 1318.51];
    const freq = starFreqs[Math.min(starIndex - 1, starFreqs.length - 1)];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  // 15. UI Button Click
  public playButtonClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // 16. Cheerful Tropical Marimba Background Music Loop
  public startMusic() {
    if (this.isMusicPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    this.musicGainNode = this.ctx.createGain();
    this.musicGainNode.gain.value = this.isMuted ? 0 : 0.12;
    this.musicGainNode.connect(this.ctx.destination);

    // Tropical marimba scale in C Major (C4, D4, E4, G4, A4, C5, E5, G5)
    const melodySteps = [
      523.25, 659.25, 783.99, 659.25,
      587.33, 659.25, 783.99, 880.00,
      1046.5, 783.99, 659.25, 523.25,
      587.33, 783.99, 659.25, 523.25,
    ];

    let stepIndex = 0;
    this.musicInterval = setInterval(() => {
      if (!this.ctx || !this.isMusicPlaying || this.isMuted) return;

      const freq = melodySteps[stepIndex % melodySteps.length];
      stepIndex++;

      // Marimba struck wooden bar tone
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      noteGain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

      osc.connect(noteGain);
      if (this.musicGainNode) {
        noteGain.connect(this.musicGainNode);
      }
      osc.start();
      osc.stop(this.ctx.currentTime + 0.28);
    }, 280);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundManager = new JuicyAudioEngine();
