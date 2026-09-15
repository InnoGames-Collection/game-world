/**
 * Helix Jump Procedural Web Audio Engine
 * Zero external asset dependencies. Generates authentic acoustic bounces,
 * harmonic gap chimes, combo smashes, danger crashes, and fanfare chords.
 */

class HelixJumpAudioEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private bgOscillator: OscillatorNode | null = null;
  private bgGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;

  constructor() {
    // Sound enabled default
    this.soundEnabled = true;
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopAmbientBgm();
    } else {
      this.startAmbientBgm();
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public toggleSound(): boolean {
    const next = !this.soundEnabled;
    this.setSoundEnabled(next);
    return next;
  }

  /**
   * Ball Bounce sound: clean acoustic rubbery bounce thud
   */
  public playBounce() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      // Pitch drop from 280Hz to 130Hz for responsive bounce character
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.09);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Audio error safely ignored
    }
  }

  /**
   * Passing through a gap: harmonic ascending bright bell chime
   */
  public playGapPass(comboLevel: number = 1) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch rises with combo level
      const baseFreq = 523.25; // C5
      const noteFreq = baseFreq * Math.pow(1.122, Math.min(comboLevel, 8));

      osc.type = 'sine';
      osc.frequency.setValueAtTime(noteFreq, now);
      osc.frequency.exponentialRampToValueAtTime(noteFreq * 1.5, now + 0.15);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // Ignore
    }
  }

  /**
   * High combo smash: deep impact shatter when ball breaks through platforms
   */
  public playComboSmash() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Low impact sub-boom
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(160, now);
      subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.25);
      subGain.gain.setValueAtTime(0.6, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.31);

      // Noise burst for shatter
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.45, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      noise.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);
    } catch {
      // Ignore
    }
  }

  /**
   * Danger Collision: ball explodes on red platform
   */
  public playDangerCrash() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Dissonant dual tones
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(140, now);
      osc1.frequency.linearRampToValueAtTime(50, now + 0.35);
      osc2.frequency.setValueAtTime(215, now);
      osc2.frequency.linearRampToValueAtTime(75, now + 0.35);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.42);
      osc2.stop(now + 0.42);
    } catch {
      // Ignore
    }
  }

  /**
   * Level Complete: triumphant multi-tone fanfare
   */
  public playLevelComplete() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      chord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.35, now + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.65);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Crisp UI Button click
   */
  public playButtonClick() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Ignore
    }
  }

  /**
   * Ambient atmospheric hum
   */
  public startAmbientBgm() {
    if (!this.soundEnabled || this.isBgmPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      this.bgOscillator = this.ctx.createOscillator();
      this.bgGain = this.ctx.createGain();

      this.bgOscillator.type = 'sine';
      this.bgOscillator.frequency.setValueAtTime(110, now); // A2 gentle drone

      this.bgGain.gain.setValueAtTime(0.001, now);
      this.bgGain.gain.linearRampToValueAtTime(0.04, now + 2); // Very quiet ambient

      this.bgOscillator.connect(this.bgGain);
      this.bgGain.connect(this.ctx.destination);

      this.bgOscillator.start(now);
      this.isBgmPlaying = true;
    } catch {
      // Ignore
    }
  }

  public stopAmbientBgm() {
    if (this.bgOscillator && this.isBgmPlaying) {
      try {
        this.bgOscillator.stop();
        this.bgOscillator.disconnect();
      } catch {
        // Ignore
      }
      this.bgOscillator = null;
      this.isBgmPlaying = false;
    }
  }
}

export const helixAudio = new HelixJumpAudioEngine();
