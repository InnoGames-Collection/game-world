/**
 * Pop Piano - Polyphonic Acoustic Piano Synthesizer
 * Zero-latency Web Audio API implementation with rich harmonics, hammer attack, and voice management.
 */

// Note Pitch to Frequency (Hz)
export const NOTE_FREQUENCIES: Record<string, number> = {
  // Octave 3
  'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  // Octave 4 (Middle C)
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
  'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  // Octave 5
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
  'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  // Octave 6
  'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51, 'F6': 1396.91,
  'G6': 1567.98, 'A6': 1760.00, 'B6': 1975.53, 'C7': 2093.00,
};

export class PianoSynth {
  private static ctx: AudioContext | null = null;
  private static isMuted: boolean = false;
  private static masterGain: GainNode | null = null;
  private static activeVoicesCount: number = 0;
  private static readonly MAX_CONCURRENT_VOICES = 8;

  public static init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public static setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.85, this.ctx.currentTime);
    }
  }

  public static getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Plays a physical acoustic piano tone with realistic hammer strike and harmonic decay
   */
  public static playPianoNote(freq: number, durationSeconds: number = 1.2, velocity: number = 0.95) {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    if (this.activeVoicesCount > this.MAX_CONCURRENT_VOICES) {
      return; // prevent unbounded voice accumulation
    }

    try {
      const now = ctx.currentTime;
      this.activeVoicesCount++;

      // 1. Fundamental Harmonic (Sine)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      // 2. Bright Second Harmonic (Triangle for acoustic sparkle)
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, now);

      // 3. Sub-harmonic Body (Sine)
      const osc3 = ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(freq * 0.5, now);

      // 4. Low-pass Filter for acoustic damper simulation
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(freq * 5.0, 7200), now);
      filter.frequency.exponentialRampToValueAtTime(Math.min(freq * 1.6, 2000), now + durationSeconds);

      // 5. Volume Envelopes (Fast 6ms hammer attack, smooth decay)
      const gain1 = ctx.createGain();
      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.linearRampToValueAtTime(0.5 * velocity, now + 0.006);
      gain1.gain.exponentialRampToValueAtTime(0.18 * velocity, now + 0.22);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.0001, now);
      gain2.gain.linearRampToValueAtTime(0.25 * velocity, now + 0.008);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + (durationSeconds * 0.65));

      const gain3 = ctx.createGain();
      gain3.gain.setValueAtTime(0.0001, now);
      gain3.gain.linearRampToValueAtTime(0.15 * velocity, now + 0.006);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + (durationSeconds * 0.45));

      // Connect nodes
      osc1.connect(gain1);
      osc2.connect(gain2);
      osc3.connect(gain3);

      gain1.connect(filter);
      gain2.connect(filter);
      gain3.connect(filter);

      filter.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);

      const stopTime = now + durationSeconds + 0.05;
      osc1.stop(stopTime);
      osc2.stop(stopTime);
      osc3.stop(stopTime);

      setTimeout(() => {
        this.activeVoicesCount = Math.max(0, this.activeVoicesCount - 1);
      }, (durationSeconds + 0.05) * 1000);
    } catch {
      this.activeVoicesCount = Math.max(0, this.activeVoicesCount - 1);
    }
  }

  /**
   * Sound effect for Perfect hit (Sparkling chime)
   */
  public static playHitChime() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now);
      osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.12);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  /**
   * Sound effect for Miss (Low thud)
   */
  public static playMissThud() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  /**
   * Harmonious acoustic chord arpeggio for level completion
   */
  public static playLevelCompleteChord() {
    if (this.isMuted) return;
    this.init();
    const chordFrequencies = [523.25, 659.25, 783.99, 1046.50]; // C5 - E5 - G5 - C6
    chordFrequencies.forEach((freq, idx) => {
      setTimeout(() => {
        this.playPianoNote(freq, 1.4, 0.95);
      }, idx * 70);
    });
  }

  /**
   * Stops all sound and resets active voices
   */
  public static stopAll() {
    this.activeVoicesCount = 0;
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
        setTimeout(() => {
          if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
          }
        }, 50);
      } catch {}
    }
  }
}
