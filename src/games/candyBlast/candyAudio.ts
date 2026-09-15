/**
 * Candy Blast - Dedicated Audio Synthesizer
 * Commercial mobile-game quality Web Audio engine.
 * 
 * Features:
 * - Master Dynamics Compressor & Gain Limiter (prevents any distortion / clipping)
 * - Strict Audio Priority & Dynamic Ducking (Special explosions take precedence over minor pops)
 * - Layered, multi-phase synthesis for:
 *   1. Special Candy Creation (Energy Charge -> Confirmation Chime)
 *   2. Special Candy Activation (Rising Energy Anticipation -> Strong Impact / Explosion -> Crisp Destruction Cascade)
 *   3. Special + Special Combos (Anticipation Tether -> Massive Multilayer Detonation)
 *   4. Grouped Destruction Pops (prevents audio pileup / cacophony)
 *   5. Progressive Chain Reaction Chimes
 * - Complete Audio Lifecycle Management (instant cleanup on pause, game over, or exit)
 */

export type AudioPriority = 1 | 2 | 3 | 4;

class CandyAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private isMuted: boolean = false;
  private lastPlayTimes: Map<string, number> = new Map();
  private popVariationIndex: number = 0;
  private currentPriorityLockTime: number = 0;
  private currentPriorityLevel: AudioPriority = 1;
  private activeNodes: Set<AudioNode> = new Set();
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {}

  /**
   * Generates or retrieves a procedural high-quality acoustic texture noise buffer
   */
  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (!this.noiseBuffer || this.noiseBuffer.sampleRate !== ctx.sampleRate) {
      const bufferSize = Math.floor(ctx.sampleRate * 1.5);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Warm organic 3-pole filtered pink/brown noise
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        const pink = b0 + b1 + b2 + white * 0.5362;
        data[i] = pink * 0.18;
      }
      this.noiseBuffer = buffer;
    }
    return this.noiseBuffer;
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        // Master Compressor to eliminate clipping
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(8, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);

        this.compressor.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.85, this.ctx.currentTime);
    }
    if (muted) {
      this.stopAll();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Immediately terminates active sound nodes and resets state
   */
  public stopAll() {
    this.currentPriorityLockTime = 0;
    this.currentPriorityLevel = 1;
    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {}
    });
    this.activeNodes.clear();
  }

  /**
   * Sound priority checking: if a higher priority sound is currently active,
   * lower priority sounds are suppressed.
   */
  private checkPriority(level: AudioPriority, lockDurationMs: number = 0): boolean {
    if (this.isMuted) return false;
    const now = performance.now();
    if (now < this.currentPriorityLockTime && level < this.currentPriorityLevel) {
      return false; // Suppress lower priority
    }
    if (lockDurationMs > 0) {
      this.currentPriorityLevel = level;
      this.currentPriorityLockTime = now + lockDurationMs;
    }
    return true;
  }

  private shouldThrottle(key: string, minIntervalMs: number): boolean {
    const now = performance.now();
    const last = this.lastPlayTimes.get(key) || 0;
    if (now - last < minIntervalMs) return true;
    this.lastPlayTimes.set(key, now);
    return false;
  }

  private getDestination(): AudioNode | null {
    return this.compressor || this.ctx?.destination || null;
  }

  /**
   * UI Tap / Candy Select
   */
  public playTap() {
    if (!this.checkPriority(1)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(860, ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);

      osc.connect(gain);
      gain.connect(dest);
      this.activeNodes.add(osc);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
      osc.onended = () => {
        this.activeNodes.delete(osc);
      };
    } catch {}
  }

  /**
   * Tile Swap Whoosh
   */
  public playSwap() {
    if (!this.checkPriority(1)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(580, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(dest);
      this.activeNodes.add(osc);
      osc.start();
      osc.stop(ctx.currentTime + 0.075);
      osc.onended = () => {
        this.activeNodes.delete(osc);
      };
    } catch {}
  }

  /**
   * Invalid Swap Rebound (gentle wooden bump)
   */
  public playInvalid() {
    if (!this.checkPriority(1)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(dest);
      this.activeNodes.add(osc);
      osc.start();
      osc.stop(ctx.currentTime + 0.11);
      osc.onended = () => {
        this.activeNodes.delete(osc);
      };
    } catch {}
  }

  /**
   * 3-MATCH: Short, clean, organic tactile candy pop with pentatonic variation
   */
  public playMatch(combo: number = 1) {
    if (!this.checkPriority(1)) return;
    if (this.shouldThrottle('match_pop', 45)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      this.popVariationIndex = (this.popVariationIndex + 1) % 5;
      const baseScale = [523.25, 587.33, 659.25, 783.99, 880.0]; // C5, D5, E5, G5, A5
      const comboOffset = Math.min((combo - 1) * 35, 220);
      const startFreq = baseScale[this.popVariationIndex] + comboOffset;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(startFreq * 1.45, ctx.currentTime + 0.065);

      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.085);

      osc.connect(gain);
      gain.connect(dest);
      this.activeNodes.add(osc);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
      osc.onended = () => {
        this.activeNodes.delete(osc);
      };
    } catch {}
  }

  // =========================================================================
  // SPECIAL CANDY CREATION SEQUENCE
  // =========================================================================

  /**
   * SPECIAL CANDY CREATION - STEP 1: Short energy/charging buildup (anticipation)
   */
  public playSpecialCharge() {
    if (!this.checkPriority(2, 140)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, t);
      osc.frequency.exponentialRampToValueAtTime(780, t + 0.12);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

      osc.connect(gain);
      gain.connect(dest);
      this.activeNodes.add(osc);
      osc.start(t);
      osc.stop(t + 0.14);
      osc.onended = () => {
        this.activeNodes.delete(osc);
      };
    } catch {}
  }

  /**
   * SPECIAL CANDY CREATION - STEP 2: Confirmation sound for Line / Bomb / Color-Bomb
   */
  public playLineFormed() {
    if (!this.checkPriority(2, 150)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const notes = [659.25, 987.77, 1318.5]; // E5, B5, E6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const st = ctx.currentTime + idx * 0.035;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, st);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.08, st + 0.11);

        gain.gain.setValueAtTime(0.16, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.13);

        osc.connect(gain);
        gain.connect(dest);
        this.activeNodes.add(osc);
        osc.start(st);
        osc.stop(st + 0.14);
        osc.onended = () => {
          this.activeNodes.delete(osc);
        };
      });
    } catch {}
  }

  /**
   * SPECIAL BOMB CREATION SOUND:
   * Multi-stage sonic event:
   * 1. 120ms Inward low-mid suction whoosh (180Hz -> 380Hz)
   * 2. 80ms Resonant energy charge (420Hz -> 650Hz)
   * 3. Metallic lock-in ping & warm settling bass pop (520Hz -> 180Hz)
   */
  public playBombFormed() {
    if (!this.checkPriority(2, 220)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const t = ctx.currentTime;

      // Stage 1: Inward Suction / Frequency Sweep
      const sweepOsc = ctx.createOscillator();
      const sweepGain = ctx.createGain();
      sweepOsc.type = 'sine';
      sweepOsc.frequency.setValueAtTime(160, t);
      sweepOsc.frequency.exponentialRampToValueAtTime(420, t + 0.12);

      sweepGain.gain.setValueAtTime(0.04, t);
      sweepGain.gain.linearRampToValueAtTime(0.18, t + 0.11);
      sweepGain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

      sweepOsc.connect(sweepGain);
      sweepGain.connect(dest);
      this.activeNodes.add(sweepOsc);
      sweepOsc.start(t);
      sweepOsc.stop(t + 0.14);
      sweepOsc.onended = () => this.activeNodes.delete(sweepOsc);

      // Stage 2 & 3: Metallic Lock-in ping + Power-up Thud at 120ms
      const pingOsc = ctx.createOscillator();
      const pingGain = ctx.createGain();
      pingOsc.type = 'triangle';
      pingOsc.frequency.setValueAtTime(740, t + 0.12);
      pingOsc.frequency.exponentialRampToValueAtTime(320, t + 0.22);

      pingGain.gain.setValueAtTime(0.24, t + 0.12);
      pingGain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

      pingOsc.connect(pingGain);
      pingGain.connect(dest);
      this.activeNodes.add(pingOsc);
      pingOsc.start(t + 0.12);
      pingOsc.stop(t + 0.25);
      pingOsc.onended = () => this.activeNodes.delete(pingOsc);

      // Warm low-end body thud
      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(180, t + 0.12);
      thudOsc.frequency.exponentialRampToValueAtTime(70, t + 0.24);

      thudGain.gain.setValueAtTime(0.22, t + 0.12);
      thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

      thudOsc.connect(thudGain);
      thudGain.connect(dest);
      this.activeNodes.add(thudOsc);
      thudOsc.start(t + 0.12);
      thudOsc.stop(t + 0.27);
      thudOsc.onended = () => this.activeNodes.delete(thudOsc);
    } catch {}
  }

  public playColorBombFormed() {
    if (!this.checkPriority(2, 240)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const st = ctx.currentTime + idx * 0.035;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, st);
        osc.frequency.exponentialRampToValueAtTime(f * 1.05, st + 0.16);

        gain.gain.setValueAtTime(0.18, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.2);

        osc.connect(gain);
        gain.connect(dest);
        this.activeNodes.add(osc);
        osc.start(st);
        osc.stop(st + 0.22);
        osc.onended = () => {
          this.activeNodes.delete(osc);
        };
      });
    } catch {}
  }

  // =========================================================================
  // SPECIAL CANDY ACTIVATION SEQUENCE
  // =========================================================================

  /**
   * SPECIAL CANDY ACTIVATION - STEP 1: Short rising anticipation energy sound (80ms)
   */
  public playSpecialActivationAnticipation() {
    if (!this.checkPriority(3, 100)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(780, t + 0.08);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.linearRampToValueAtTime(0.24, t + 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(dest);
      this.activeNodes.add(osc);
      osc.start(t);
      osc.stop(t + 0.1);
      osc.onended = () => {
        this.activeNodes.delete(osc);
      };
    } catch {}
  }

  /**
   * 4-MATCH LINE CLEAR TRIGGER: High velocity laser energy slice
   */
  public playLineClear() {
    if (!this.checkPriority(3, 160)) return;
    if (this.shouldThrottle('line_clear', 80)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const t = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(1100, t);
      osc1.frequency.exponentialRampToValueAtTime(160, t + 0.16);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(480, t);
      osc2.frequency.exponentialRampToValueAtTime(1250, t + 0.16);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(dest);

      this.activeNodes.add(osc1);
      this.activeNodes.add(osc2);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.19);
      osc2.stop(t + 0.19);

      osc1.onended = () => this.activeNodes.delete(osc1);
      osc2.onended = () => this.activeNodes.delete(osc2);
    } catch {}
  }

  /**
   * =========================================================================
   * CANDY BLAST SPECIAL BOMB: PREMIUM COMMERCIAL MATCH-3 POWER DETONATION
   * 
   * A short, extremely satisfying, colorful special-power detonation designed
   * specifically for commercial match-3 mobile games (Candy Crush / Royal Match quality).
   * 
   * SONIC CHARACTER & TIMELINE (~750ms total, perfectly cohesive single event):
   * 1. [0–45ms]   IMMEDIATE JUICY TACTILE IMPACT (Snappy acoustic punch + low-mid thump, punchy on phone speakers)
   * 2. [20–220ms] SIGNATURE MAGICAL POWER BLOOM (Radiant harmonic chord burst & crystal overtone flare)
   * 3. [35–380ms] DENSE CANDY SUGAR-GLASS SHATTER (Crisp granular cluster of multiple candies breaking apart)
   * 4. [30–250ms] EFFERVESCENT ENERGY WHOOSH (Fizzy, colorful resonant body flare)
   * 5. [250–750ms] STARDUST SPARKLE AFTERGLOW (Clean, musical crystalline shimmer tail, zero muddy rumble)
   * =========================================================================
   */
  public playBombExplosion() {
    if (!this.checkPriority(3, 420)) return;
    if (this.shouldThrottle('bomb_master_exp', 85)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const t = ctx.currentTime;
      const noise = this.getNoiseBuffer(ctx);

      // Subtle organic variation per detonation (pitch +/- 2.5%, micro-timing jitter)
      const pitchMod = 1.0 + (Math.random() * 0.05 - 0.025);
      const crackleGainMod = 1.0 + (Math.random() * 0.08 - 0.04);

      // Dedicated Master Power-Bomb Bus
      const bombBus = ctx.createGain();
      bombBus.gain.setValueAtTime(0.92, t);
      bombBus.connect(dest);
      this.activeNodes.add(bombBus);

      // =======================================================================
      // 1. [0–50ms] IMMEDIATE JUICY TACTILE IMPACT (Acoustic Punch + Snap)
      // Designed for instant punch on phone speakers, headphones, and laptop speakers
      // =======================================================================

      // 1A. Acoustic Snappy Click Transient (Impulse snap 2.6kHz -> 400Hz in 12ms)
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'triangle';
      snapOsc.frequency.setValueAtTime(2600 * pitchMod, t);
      snapOsc.frequency.exponentialRampToValueAtTime(380 * pitchMod, t + 0.014);

      snapGain.gain.setValueAtTime(0.45, t);
      snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);

      snapOsc.connect(snapGain);
      snapGain.connect(bombBus);
      this.activeNodes.add(snapOsc);
      snapOsc.start(t);
      snapOsc.stop(t + 0.02);
      snapOsc.onended = () => this.activeNodes.delete(snapOsc);

      // 1B. Juicy Candy Thump & Low-Mid Punch (180Hz -> 58Hz with fast tight decay)
      const thumpOsc = ctx.createOscillator();
      const thumpGain = ctx.createGain();
      thumpOsc.type = 'sine';
      thumpOsc.frequency.setValueAtTime(185 * pitchMod, t);
      thumpOsc.frequency.exponentialRampToValueAtTime(54 * pitchMod, t + 0.09);

      thumpGain.gain.setValueAtTime(0.55, t);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      thumpOsc.connect(thumpGain);
      thumpGain.connect(bombBus);
      this.activeNodes.add(thumpOsc);
      thumpOsc.start(t);
      thumpOsc.stop(t + 0.13);
      thumpOsc.onended = () => this.activeNodes.delete(thumpOsc);

      // 1C. Sub-Bass Depth Weight (85Hz -> 36Hz in 140ms, clean & un-muddled)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(88 * pitchMod, t);
      subOsc.frequency.exponentialRampToValueAtTime(38 * pitchMod, t + 0.15);

      subGain.gain.setValueAtTime(0.48, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      subOsc.connect(subGain);
      subGain.connect(bombBus);
      this.activeNodes.add(subOsc);
      subOsc.start(t);
      subOsc.stop(t + 0.17);
      subOsc.onended = () => this.activeNodes.delete(subOsc);

      // =======================================================================
      // 2. [15–240ms] THE SIGNATURE MAGICAL POWER BLOOM
      // Radiant, uplifting harmonic chord burst (Eb Maj add9: G4, Bb4, D5, F5, Bb5)
      // Delivers the memorable, colorful "Special Game Ability" signature sound!
      // =======================================================================
      const chordFrequencies = [
        { f: 392.00, gain: 0.22, delay: 0.005, dur: 0.22, wave: 'triangle' as const }, // G4
        { f: 466.16, gain: 0.24, delay: 0.008, dur: 0.24, wave: 'sine' as const },     // Bb4
        { f: 587.33, gain: 0.25, delay: 0.012, dur: 0.25, wave: 'triangle' as const }, // D5
        { f: 698.46, gain: 0.22, delay: 0.015, dur: 0.26, wave: 'sine' as const },     // F5
        { f: 932.33, gain: 0.19, delay: 0.018, dur: 0.28, wave: 'sine' as const },     // Bb5
        { f: 1174.66, gain: 0.16, delay: 0.022, dur: 0.30, wave: 'sine' as const },    // D6 shimmer
      ];

      chordFrequencies.forEach((chord) => {
        const chordTime = t + chord.delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = chord.wave;
        const baseF = chord.f * pitchMod;
        // Pitch bloom: Quick swell with slight downward flare
        osc.frequency.setValueAtTime(baseF * 1.08, chordTime);
        osc.frequency.exponentialRampToValueAtTime(baseF, chordTime + 0.04);
        osc.frequency.exponentialRampToValueAtTime(baseF * 0.94, chordTime + chord.dur);

        // Fast bloom envelope
        gain.gain.setValueAtTime(0.001, chordTime);
        gain.gain.linearRampToValueAtTime(chord.gain, chordTime + 0.018); // 18ms quick bloom
        gain.gain.exponentialRampToValueAtTime(0.001, chordTime + chord.dur);

        osc.connect(gain);
        gain.connect(bombBus);
        this.activeNodes.add(osc);
        osc.start(chordTime);
        osc.stop(chordTime + chord.dur + 0.01);
        osc.onended = () => this.activeNodes.delete(osc);
      });

      // =======================================================================
      // 3. [30–380ms] DENSE CANDY SUGAR-GLASS SHATTER & CRACKLE
      // Rich granular cluster of multiple physical hard candies breaking apart
      // =======================================================================

      // 3A. Granular Crystal Shatter Micro-Pops (7 distinct crisp brittle fractures)
      const crystalFractions = [
        { dt: 0.035, freq: 3100, gain: 0.22, dur: 0.026 },
        { dt: 0.065, freq: 4400, gain: 0.20, dur: 0.028 },
        { dt: 0.095, freq: 2650, gain: 0.24, dur: 0.032 },
        { dt: 0.135, freq: 5200, gain: 0.18, dur: 0.025 },
        { dt: 0.175, freq: 3800, gain: 0.21, dur: 0.030 },
        { dt: 0.225, freq: 4800, gain: 0.17, dur: 0.028 },
        { dt: 0.285, freq: 3400, gain: 0.16, dur: 0.032 },
      ];

      crystalFractions.forEach((cf) => {
        const microTime = t + cf.dt + (Math.random() * 0.006 - 0.003);
        const microOsc = ctx.createOscillator();
        const microGain = ctx.createGain();

        microOsc.type = 'triangle';
        const mf = cf.freq * pitchMod + (Math.random() * 80 - 40);
        microOsc.frequency.setValueAtTime(mf * 1.15, microTime);
        microOsc.frequency.exponentialRampToValueAtTime(mf * 0.65, microTime + cf.dur);

        microGain.gain.setValueAtTime(0.001, microTime);
        microGain.gain.linearRampToValueAtTime(cf.gain * crackleGainMod, microTime + 0.002);
        microGain.gain.exponentialRampToValueAtTime(0.001, microTime + cf.dur);

        microOsc.connect(microGain);
        microGain.connect(bombBus);
        this.activeNodes.add(microOsc);
        microOsc.start(microTime);
        microOsc.stop(microTime + cf.dur + 0.005);
        microOsc.onended = () => this.activeNodes.delete(microOsc);
      });

      // 3B. Effervescent Sugar Crackle Fizz (High-passed textured crystal fizz)
      const fizzNoise = ctx.createBufferSource();
      fizzNoise.buffer = noise;
      const fizzFilter = ctx.createBiquadFilter();
      const fizzGain = ctx.createGain();

      fizzFilter.type = 'bandpass';
      fizzFilter.Q.setValueAtTime(3.5, t + 0.03);
      fizzFilter.frequency.setValueAtTime(5400 * pitchMod, t + 0.03);
      fizzFilter.frequency.exponentialRampToValueAtTime(2800 * pitchMod, t + 0.35);

      fizzGain.gain.setValueAtTime(0.001, t + 0.025);
      fizzGain.gain.linearRampToValueAtTime(0.24 * crackleGainMod, t + 0.06);
      fizzGain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      fizzNoise.connect(fizzFilter);
      fizzFilter.connect(fizzGain);
      fizzGain.connect(bombBus);
      this.activeNodes.add(fizzNoise);
      fizzNoise.start(t + 0.025);
      fizzNoise.stop(t + 0.40);
      fizzNoise.onended = () => this.activeNodes.delete(fizzNoise);

      // =======================================================================
      // 4. [25–240ms] EFFERVESCENT RESIDENTIAL ENERGY BODY
      // Colorful resonant swoop that gives volume without realistic explosion noise
      // =======================================================================
      const bodyNoise = ctx.createBufferSource();
      bodyNoise.buffer = noise;
      const bodyFilter = ctx.createBiquadFilter();
      const bodyGain = ctx.createGain();

      bodyFilter.type = 'bandpass';
      bodyFilter.Q.setValueAtTime(2.2, t + 0.02);
      bodyFilter.frequency.setValueAtTime(1450 * pitchMod, t + 0.02);
      bodyFilter.frequency.exponentialRampToValueAtTime(420 * pitchMod, t + 0.22);

      bodyGain.gain.setValueAtTime(0.001, t + 0.02);
      bodyGain.gain.linearRampToValueAtTime(0.28, t + 0.05);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

      bodyNoise.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(bombBus);
      this.activeNodes.add(bodyNoise);
      bodyNoise.start(t + 0.02);
      bodyNoise.stop(t + 0.26);
      bodyNoise.onended = () => this.activeNodes.delete(bodyNoise);

      // =======================================================================
      // 5. [240–720ms] STARDUST SPARKLE AFTERGLOW
      // Delicate musical bell-shimmer dissipation, leaving a rewarding clean impression
      // =======================================================================
      const sparkleChimes = [
        { delay: 0.22, freq: 1760, gain: 0.14, dur: 0.32 }, // A6
        { delay: 0.28, freq: 2349, gain: 0.12, dur: 0.34 }, // D7
        { delay: 0.34, freq: 3136, gain: 0.11, dur: 0.36 }, // G7
        { delay: 0.42, freq: 2637, gain: 0.08, dur: 0.30 }, // E7
      ];

      sparkleChimes.forEach((sc) => {
        const scTime = t + sc.delay;
        const scOsc = ctx.createOscillator();
        const scGain = ctx.createGain();

        scOsc.type = 'sine';
        const f = sc.freq * pitchMod;
        scOsc.frequency.setValueAtTime(f, scTime);
        scOsc.frequency.exponentialRampToValueAtTime(f * 0.98, scTime + sc.dur);

        scGain.gain.setValueAtTime(0.001, scTime);
        scGain.gain.linearRampToValueAtTime(sc.gain, scTime + 0.015);
        scGain.gain.exponentialRampToValueAtTime(0.001, scTime + sc.dur);

        scOsc.connect(scGain);
        scGain.connect(bombBus);
        this.activeNodes.add(scOsc);
        scOsc.start(scTime);
        scOsc.stop(scTime + sc.dur + 0.01);
        scOsc.onended = () => this.activeNodes.delete(scOsc);
      });

      // Final Bus Auto-Cleanup
      setTimeout(() => {
        this.activeNodes.delete(bombBus);
        try { bombBus.disconnect(); } catch {}
      }, 780);
    } catch {}
  }

  /**
   * CHAIN REACTION SECONDARY EXPLOSIONS:
   * Optimized secondary blast for chained cascades.
   * Matches the exact commercial match-3 power sound identity with +18% harmonic lift
   * and tighter 420ms duration to prevent sonic clutter during big chain reactions.
   */
  public playSecondaryExplosion(chainIndex: number = 1) {
    if (!this.checkPriority(2, 220)) return;
    if (this.shouldThrottle(`sec_exp_${chainIndex}`, 55)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const t = ctx.currentTime;
      const noise = this.getNoiseBuffer(ctx);
      const pitchMultiplier = 1.0 + Math.min(0.24, chainIndex * 0.07);

      const secBus = ctx.createGain();
      secBus.gain.setValueAtTime(0.78, t);
      secBus.connect(dest);
      this.activeNodes.add(secBus);

      // Fast Impact Snap
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'triangle';
      snapOsc.frequency.setValueAtTime(3200 * pitchMultiplier, t);
      snapOsc.frequency.exponentialRampToValueAtTime(450 * pitchMultiplier, t + 0.012);

      snapGain.gain.setValueAtTime(0.38, t);
      snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.016);

      snapOsc.connect(snapGain);
      snapGain.connect(secBus);
      this.activeNodes.add(snapOsc);
      snapOsc.start(t);
      snapOsc.stop(t + 0.018);
      snapOsc.onended = () => this.activeNodes.delete(snapOsc);

      // Thumpy low-mid punch
      const thumpOsc = ctx.createOscillator();
      const thumpGain = ctx.createGain();
      thumpOsc.type = 'sine';
      thumpOsc.frequency.setValueAtTime(210 * pitchMultiplier, t);
      thumpOsc.frequency.exponentialRampToValueAtTime(68 * pitchMultiplier, t + 0.07);

      thumpGain.gain.setValueAtTime(0.46, t);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      thumpOsc.connect(thumpGain);
      thumpGain.connect(secBus);
      this.activeNodes.add(thumpOsc);
      thumpOsc.start(t);
      thumpOsc.stop(t + 0.10);
      thumpOsc.onended = () => this.activeNodes.delete(thumpOsc);

      // Bright Harmonic Pop Chord (3 notes: F5, A5, C6)
      [698.46, 880.00, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i === 1 ? 'sine' : 'triangle';
        const f = freq * pitchMultiplier;
        osc.frequency.setValueAtTime(f, t + i * 0.006);
        osc.frequency.exponentialRampToValueAtTime(f * 0.92, t + 0.16);

        gain.gain.setValueAtTime(0.001, t + i * 0.006);
        gain.gain.linearRampToValueAtTime(0.18, t + i * 0.006 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(secBus);
        this.activeNodes.add(osc);
        osc.start(t + i * 0.006);
        osc.stop(t + 0.19);
        osc.onended = () => this.activeNodes.delete(osc);
      });

      // Quick Crystal Shard Crackle (3 micro-bursts)
      [0.04, 0.09, 0.14].forEach((dt, idx) => {
        const scOsc = ctx.createOscillator();
        const scGain = ctx.createGain();
        scOsc.type = 'triangle';
        const f = (3400 + idx * 800) * pitchMultiplier;
        scOsc.frequency.setValueAtTime(f, t + dt);
        scOsc.frequency.exponentialRampToValueAtTime(f * 0.7, t + dt + 0.024);

        scGain.gain.setValueAtTime(0.001, t + dt);
        scGain.gain.linearRampToValueAtTime(0.14, t + dt + 0.002);
        scGain.gain.exponentialRampToValueAtTime(0.001, t + dt + 0.024);

        scOsc.connect(scGain);
        scGain.connect(secBus);
        this.activeNodes.add(scOsc);
        scOsc.start(t + dt);
        scOsc.stop(t + dt + 0.028);
        scOsc.onended = () => this.activeNodes.delete(scOsc);
      });

      // Shimmer Fizz
      const fizzNoise = ctx.createBufferSource();
      fizzNoise.buffer = noise;
      const fizzFilter = ctx.createBiquadFilter();
      const fizzGain = ctx.createGain();

      fizzFilter.type = 'bandpass';
      fizzFilter.Q.setValueAtTime(3.0, t + 0.02);
      fizzFilter.frequency.setValueAtTime(5200 * pitchMultiplier, t + 0.02);

      fizzGain.gain.setValueAtTime(0.001, t + 0.02);
      fizzGain.gain.linearRampToValueAtTime(0.18, t + 0.05);
      fizzGain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

      fizzNoise.connect(fizzFilter);
      fizzFilter.connect(fizzGain);
      fizzGain.connect(secBus);
      this.activeNodes.add(fizzNoise);
      fizzNoise.start(t + 0.02);
      fizzNoise.stop(t + 0.28);
      fizzNoise.onended = () => this.activeNodes.delete(fizzNoise);

      setTimeout(() => {
        this.activeNodes.delete(secBus);
        try { secBus.disconnect(); } catch {}
      }, 480);
    } catch {}
  }

  /**
   * COLOR BOMB TRIGGER: Rainbow Prismatic Crystal Shimmer
   */
  public playColorBomb() {
    if (!this.checkPriority(3, 220)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.038;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.1, startTime + 0.13);

        gain.gain.setValueAtTime(0.16, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16);

        osc.connect(gain);
        gain.connect(dest);
        this.activeNodes.add(osc);

        osc.start(startTime);
        osc.stop(startTime + 0.18);
        osc.onended = () => this.activeNodes.delete(osc);
      });
    } catch {}
  }

  /**
   * GROUPED CANDY DESTRUCTION POP (Controlled layering for multiple destroyed candies)
   * Intelligently ducks if a Master Bomb is actively detonating to avoid audio pileup.
   */
  public playCandyDestructionBatch(count: number = 3) {
    if (!this.checkPriority(1)) return;
    if (this.shouldThrottle('batch_pop', 60)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      // Play 2-3 tightly staggered micro-pops instead of N overlapping instances
      const popCount = Math.min(3, Math.max(1, Math.floor(count / 2)));
      for (let i = 0; i < popCount; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const st = ctx.currentTime + i * 0.03;

        osc.type = 'sine';
        const f = 600 + i * 140 + (Math.random() * 60 - 30);
        osc.frequency.setValueAtTime(f, st);
        osc.frequency.exponentialRampToValueAtTime(f * 1.3, st + 0.045);

        gain.gain.setValueAtTime(0.08, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.055);

        osc.connect(gain);
        gain.connect(dest);
        this.activeNodes.add(osc);

        osc.start(st);
        osc.stop(st + 0.06);
        osc.onended = () => this.activeNodes.delete(osc);
      }
    } catch {}
  }

  /**
   * SMOOTH REFILL CASCADE: Gentle tumbling candy drop
   */
  public playRefillCascade() {
    if (!this.checkPriority(1)) return;
    if (this.shouldThrottle('refill_fall', 120)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.linearRampToValueAtTime(280, t + 0.08);

      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(dest);
      this.activeNodes.add(osc);
      osc.start(t);
      osc.stop(t + 0.1);
      osc.onended = () => this.activeNodes.delete(osc);
    } catch {}
  }

  /**
   * CHAIN REACTION PROGRESSION CHIME (Plays when subsequent matches occur naturally)
   */
  public playChainReaction(chainLevel: number = 2) {
    if (!this.checkPriority(2, 160)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const baseFreqs = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, High C
      const idx = Math.min(chainLevel - 1, baseFreqs.length - 1);
      const freq = baseFreqs[idx];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * 1.06, t + 0.12);

      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(dest);
      this.activeNodes.add(osc);
      osc.start(t);
      osc.stop(t + 0.16);
      osc.onended = () => this.activeNodes.delete(osc);
    } catch {}
  }

  // =========================================================================
  // SPECIAL + SPECIAL COMBINATION AUDIO (High Priority 4 - Epic Multi-Layer)
  // =========================================================================

  /**
   * Brief Energy Buildup & Tether Anticipation (160ms) before fusion
   */
  public playComboAnticipation() {
    if (!this.checkPriority(4, 250)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.13);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(dest);
      this.activeNodes.add(osc);
      osc.start();
      osc.stop(ctx.currentTime + 0.17);
      osc.onended = () => this.activeNodes.delete(osc);
    } catch {}
  }

  /**
   * 1. BOMB + BOMB (Super 5x5 Shockwave)
   */
  public playBombBombCombo() {
    if (!this.checkPriority(4, 500)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const t = ctx.currentTime;

      // Layer 1: Sub-bass Seismic Core (32Hz punch)
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(160, t);
      sub.frequency.exponentialRampToValueAtTime(28, t + 0.4);
      subGain.gain.setValueAtTime(0.45, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
      sub.connect(subGain);
      subGain.connect(dest);
      this.activeNodes.add(sub);
      sub.start(t);
      sub.stop(t + 0.43);
      sub.onended = () => this.activeNodes.delete(sub);

      // Layer 2: Dual Energy Crack Transient
      const crack = ctx.createOscillator();
      const crackGain = ctx.createGain();
      crack.type = 'sawtooth';
      crack.frequency.setValueAtTime(820, t);
      crack.frequency.exponentialRampToValueAtTime(80, t + 0.12);
      crackGain.gain.setValueAtTime(0.25, t);
      crackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      crack.connect(crackGain);
      crackGain.connect(dest);
      this.activeNodes.add(crack);
      crack.start(t);
      crack.stop(t + 0.15);
      crack.onended = () => this.activeNodes.delete(crack);

      // Layer 3: Warm Harmonic Bloom Tail
      [220, 330, 440].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const st = t + 0.04 + i * 0.02;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, st);
        osc.frequency.exponentialRampToValueAtTime(f * 0.9, st + 0.28);
        gain.gain.setValueAtTime(0.11, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.3);
        osc.connect(gain);
        gain.connect(dest);
        this.activeNodes.add(osc);
        osc.start(st);
        osc.stop(st + 0.32);
        osc.onended = () => this.activeNodes.delete(osc);
      });
    } catch {}
  }

  /**
   * 2. LINE + LINE (Cross Laser Cleave)
   */
  public playLineLineCombo() {
    if (!this.checkPriority(4, 400)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const t = ctx.currentTime;
      const freqs = [[1200, 200], [400, 1400]];
      freqs.forEach(([startF, endF], i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const st = t + i * 0.04;
        osc.type = i === 0 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(startF, st);
        osc.frequency.exponentialRampToValueAtTime(endF, st + 0.22);

        gain.gain.setValueAtTime(0.24, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.25);

        osc.connect(gain);
        gain.connect(dest);
        this.activeNodes.add(osc);
        osc.start(st);
        osc.stop(st + 0.26);
        osc.onended = () => this.activeNodes.delete(osc);
      });
    } catch {}
  }

  /**
   * 3. LINE + BOMB (Mega Triple Cleaver)
   */
  public playLineBombCombo() {
    if (!this.checkPriority(4, 450)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const t = ctx.currentTime;

      // Heavy sub undercurrent
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(140, t);
      sub.frequency.exponentialRampToValueAtTime(32, t + 0.3);
      subGain.gain.setValueAtTime(0.38, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      sub.connect(subGain);
      subGain.connect(dest);
      this.activeNodes.add(sub);
      sub.start(t);
      sub.stop(t + 0.33);
      sub.onended = () => this.activeNodes.delete(sub);

      // Triple laser zaps
      [0, 0.05, 0.1].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const st = t + delay;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1100 - idx * 180, st);
        osc.frequency.exponentialRampToValueAtTime(180, st + 0.18);
        gain.gain.setValueAtTime(0.2, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.2);
        osc.connect(gain);
        gain.connect(dest);
        this.activeNodes.add(osc);
        osc.start(st);
        osc.stop(st + 0.22);
        osc.onended = () => this.activeNodes.delete(osc);
      });
    } catch {}
  }

  /**
   * 4. COLOR + BOMB / COLOR + LINE (Prismatic Transformation Cascade)
   */
  public playColorSpecialCascade() {
    if (!this.checkPriority(4, 500)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const t = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const st = t + idx * 0.038;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, st);
        osc.frequency.exponentialRampToValueAtTime(f * 1.2, st + 0.15);

        gain.gain.setValueAtTime(0.2, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.17);

        osc.connect(gain);
        gain.connect(dest);
        this.activeNodes.add(osc);
        osc.start(st);
        osc.stop(st + 0.19);
        osc.onended = () => this.activeNodes.delete(osc);
      });
    } catch {}
  }

  /**
   * 5. COLOR + COLOR (Cosmic Supernova Board Wipe)
   */
  public playColorColorCosmicWipe() {
    if (!this.checkPriority(4, 700)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const t = ctx.currentTime;

      // Deep cosmic supernova core
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(180, t);
      sub.frequency.exponentialRampToValueAtTime(22, t + 0.52);
      subGain.gain.setValueAtTime(0.45, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      sub.connect(subGain);
      subGain.connect(dest);
      this.activeNodes.add(sub);
      sub.start(t);
      sub.stop(t + 0.58);
      sub.onended = () => this.activeNodes.delete(sub);

      // Celestial Chord Shimmer
      const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98, 2093.0];
      chord.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const st = t + i * 0.045;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, st);
        osc.frequency.linearRampToValueAtTime(f * 1.05, st + 0.32);

        gain.gain.setValueAtTime(0.16, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.35);

        osc.connect(gain);
        gain.connect(dest);
        this.activeNodes.add(osc);
        osc.start(st);
        osc.stop(st + 0.38);
        osc.onended = () => this.activeNodes.delete(osc);
      });
    } catch {}
  }

  /**
   * Combo Escalating Fanfare (x2, x3, x4, x5+)
   */
  public playComboFanfare(comboLevel: number) {
    if (!this.checkPriority(2, 180)) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const chords = [
        [440, 554.37, 659.25],       // A major
        [523.25, 659.25, 783.99],    // C major
        [587.33, 739.99, 880],       // D major
        [659.25, 830.61, 987.77],    // E major
        [783.99, 987.77, 1174.66],   // G major
      ];
      const selected = chords[Math.min(comboLevel - 2, chords.length - 1)] || chords[0];

      selected.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const st = ctx.currentTime + i * 0.03;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, st);
        osc.frequency.linearRampToValueAtTime(freq * 1.04, st + 0.2);

        gain.gain.setValueAtTime(0.14, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.23);

        osc.connect(gain);
        gain.connect(dest);
        this.activeNodes.add(osc);
        osc.start(st);
        osc.stop(st + 0.25);
        osc.onended = () => this.activeNodes.delete(osc);
      });
    } catch {}
  }

  /**
   * Time warning tick in last 10 seconds
   */
  public playTimeWarningTick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(dest);
      this.activeNodes.add(osc);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
      osc.onended = () => this.activeNodes.delete(osc);
    } catch {}
  }

  /**
   * Match complete victory fanfare
   */
  public playGameOver() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const victoryArp = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      victoryArp.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.07;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.16, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.26);

        osc.connect(gain);
        gain.connect(dest);
        this.activeNodes.add(osc);
        osc.start(startTime);
        osc.stop(startTime + 0.28);
        osc.onended = () => this.activeNodes.delete(osc);
      });
    } catch {}
  }

  /**
   * Celebratory Sugar Crush fanfare
   */
  public playLevelCompleteFanfare() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const fanfareNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      fanfareNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(dest);
        this.activeNodes.add(osc);
        osc.start(startTime);
        osc.stop(startTime + 0.38);
        osc.onended = () => this.activeNodes.delete(osc);
      });
    } catch {}
  }

  /**
   * Majestic 3-star level victory fanfare
   */
  public playFanfare() {
    this.playLevelCompleteFanfare();
  }
}

export const CandyAudio = new CandyAudioEngine();
