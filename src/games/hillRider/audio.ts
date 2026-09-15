/**
 * Hill Climb 3D - Professional Vehicle Audio Synthesizer Engine
 * 
 * High-Fidelity Zero-Latency Web Audio API Engine:
 * - Multi-layer synthesized combustion engine ("rrrrr... vrrrrr... RRRR...")
 * - Dynamic RPM & throttle response
 * - Steep hill-climbing acoustic load strain (throatier, deeper growl)
 * - Airborne unloaded engine revving & limiter
 * - Braking deceleration & idle purr
 * - Multi-stage suspension compression landing thuds
 * - Loss of balance & chassis collision sounds
 * - Seamless stopAll() and mute handling
 */

export interface EngineAudioParams {
  throttle: number;      // 0 to 1
  brake: number;         // 0 to 1
  speed: number;         // m/s
  slopeAngle: number;    // radians
  isAirborne: boolean;
  isGrounded: boolean;
}

export class HillRiderAudio {
  private static ctx: AudioContext | null = null;
  private static masterGain: GainNode | null = null;

  // Engine Synthesizer Nodes
  private static isEngineRunning: boolean = false;
  private static isMuted: boolean = false;

  // Sub-bass cylinder pulse (Triangle)
  private static cylOsc: OscillatorNode | null = null;
  private static cylGain: GainNode | null = null;

  // Harmonic combustion texture (Sawtooth / Pulse)
  private static harmOsc: OscillatorNode | null = null;
  private static harmGain: GainNode | null = null;

  // Engine Acoustic Formant Filter
  private static engineFilter: BiquadFilterNode | null = null;
  private static engineResonance: BiquadFilterNode | null = null;
  private static engineMasterGain: GainNode | null = null;

  // Limiter / Distortion Waveshaper
  private static engineDistortion: WaveShaperNode | null = null;

  // Tire traction hiss / road noise
  private static roadNoiseNode: AudioBufferSourceNode | null = null;
  private static roadNoiseGain: GainNode | null = null;

  private static currentRpm: number = 900; // Simulated engine RPM (800 - 6500)

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

  /**
   * Helper curve generator for subtle warm tube-like distortion
   */
  private static makeDistortionCurve(amount: number): Float32Array {
    const k = typeof amount === 'number' ? amount : 15;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  /**
   * Boots the multi-oscillator dynamic vehicle engine
   */
  public static startEngine() {
    if (this.isEngineRunning || typeof window === 'undefined') return;
    this.init();
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;

      // 1. Cylinder Base Rumble (Triangle wave at fundamental engine frequency)
      this.cylOsc = ctx.createOscillator();
      this.cylOsc.type = 'triangle';
      this.cylOsc.frequency.setValueAtTime(32, now); // ~960 RPM fundamental (32Hz)

      this.cylGain = ctx.createGain();
      this.cylGain.gain.setValueAtTime(0.38, now);

      // 2. Harmonic Combustion Texture (Sawtooth for mechanical bite)
      this.harmOsc = ctx.createOscillator();
      this.harmOsc.type = 'sawtooth';
      this.harmOsc.frequency.setValueAtTime(64, now);

      this.harmGain = ctx.createGain();
      this.harmGain.gain.setValueAtTime(0.22, now);

      // 3. Dual Formant Filter Network (Simulates exhaust manifold & engine block cavity)
      this.engineFilter = ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(240, now);
      this.engineFilter.Q.setValueAtTime(2.2, now);

      this.engineResonance = ctx.createBiquadFilter();
      this.engineResonance.type = 'peaking';
      this.engineResonance.frequency.setValueAtTime(140, now);
      this.engineResonance.gain.setValueAtTime(4.0, now);
      this.engineResonance.Q.setValueAtTime(1.8, now);

      // 4. Subtle warmth / saturation
      this.engineDistortion = ctx.createWaveShaper();
      this.engineDistortion.curve = this.makeDistortionCurve(10);
      this.engineDistortion.oversample = '2x';

      // 5. Engine Master Gain
      this.engineMasterGain = ctx.createGain();
      this.engineMasterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.16, now);

      // Wiring Graph
      this.cylOsc.connect(this.cylGain);
      this.harmOsc.connect(this.harmGain);

      this.cylGain.connect(this.engineFilter);
      this.harmGain.connect(this.engineFilter);

      this.engineFilter.connect(this.engineResonance);
      this.engineResonance.connect(this.engineDistortion);
      this.engineDistortion.connect(this.engineMasterGain);
      this.engineMasterGain.connect(this.masterGain);

      this.cylOsc.start(now);
      this.harmOsc.start(now);

      this.isEngineRunning = true;
      this.currentRpm = 950;
    } catch {
      // AudioContext safety
    }
  }

  /**
   * Dynamically modulates engine RPM, load strain, hill climbing, and airborne states in real time
   */
  public static updateEngine(params: EngineAudioParams) {
    if (
      !this.isEngineRunning ||
      !this.cylOsc ||
      !this.harmOsc ||
      !this.engineFilter ||
      !this.engineResonance ||
      !this.engineMasterGain ||
      !this.ctx
    ) {
      return;
    }

    try {
      const now = this.ctx.currentTime;
      const { throttle, brake, speed, slopeAngle, isAirborne, isGrounded } = params;
      const absSpeed = Math.abs(speed);

      // 1. Calculate Target RPM based on driving dynamics
      let targetRpm = 900; // Idle

      if (isAirborne && throttle > 0.05) {
        // Airborne revving: Engine unloads and spins freely to rev-limiter
        targetRpm = 5200 + Math.sin(now * 38) * 280; // High-rev flutter limiter
      } else if (throttle > 0.05) {
        // Under throttle: RPM climbs smoothly with vehicle forward speed and throttle depth
        const speedComponent = (absSpeed / 35.0) * 4400; // 0 to 4400 RPM from speed
        const throttleComponent = throttle * 1200;
        targetRpm = 1100 + speedComponent + throttleComponent;
      } else if (brake > 0.05 && absSpeed > 1.0) {
        // Braking: Engine braking downshifts naturally
        targetRpm = 1000 + (absSpeed / 35.0) * 1400;
      } else {
        // Coasting / decelerating
        targetRpm = 900 + (absSpeed / 35.0) * 1600;
      }

      // Smooth RPM interpolation with realistic mechanical inertia
      const rpmChangeRate = isAirborne ? 0.06 : 0.09;
      this.currentRpm += (targetRpm - this.currentRpm) * rpmChangeRate;
      this.currentRpm = Math.max(800, Math.min(6200, this.currentRpm));

      // 2. Frequency mapping (Cylinder firing pulses: 4-stroke 4-cylinder engine = RPM / 30 Hz)
      const baseFreq = this.currentRpm / 30; // 30Hz at 900 RPM -> 190Hz at 5700 RPM

      // 3. Steep Hill Climbing Strain Load Detection
      // When climbing steep inclines (> 12° / 0.20 rad) with active throttle, the engine works harder:
      // - Pitch drops slightly into a throatier low-end growl
      // - Filter resonance increases
      // - Low-end cylinder pulse gain increases
      const isClimbingSteepHill = isGrounded && slopeAngle > 0.14 && throttle > 0.3;
      const climbStrainFactor = isClimbingSteepHill ? Math.min(1.0, (slopeAngle - 0.14) / 0.35) : 0;

      const loadedFreq = baseFreq * (1.0 - climbStrainFactor * 0.12);

      this.cylOsc.frequency.setTargetAtTime(Math.max(26, loadedFreq), now, 0.04);
      this.harmOsc.frequency.setTargetAtTime(Math.max(52, loadedFreq * 2), now, 0.04);

      // 4. Formant Filter Dynamics ("rrrrr... vrrrrr... RRRR...")
      // Idle: 220Hz cutoff -> Hard Acceleration: 780Hz+
      const filterCutoff = 210 + (this.currentRpm / 6000) * 620 + (throttle > 0 ? 140 : 0);
      this.engineFilter.frequency.setTargetAtTime(filterCutoff, now, 0.06);

      // Boost engine cavity resonance under climb strain
      const targetQ = 2.0 + climbStrainFactor * 2.5;
      this.engineFilter.Q.setTargetAtTime(targetQ, now, 0.08);

      // Resonant peak tracking the lower harmonics for body warmth
      const peakFreq = 120 + (this.currentRpm / 6000) * 180;
      this.engineResonance.frequency.setTargetAtTime(peakFreq, now, 0.06);
      this.engineResonance.gain.setTargetAtTime(3.5 + climbStrainFactor * 4.0, now, 0.08);

      // 5. Volume Balance
      // Cylinder rumble is louder under climb load; harmonics increase at high RPM
      if (this.cylGain && this.harmGain) {
        const cylVol = 0.34 + climbStrainFactor * 0.18 + (throttle > 0 ? 0.08 : 0);
        const harmVol = 0.18 + (this.currentRpm / 6000) * 0.16 + (throttle > 0 ? 0.06 : 0);
        this.cylGain.gain.setTargetAtTime(cylVol, now, 0.06);
        this.harmGain.gain.setTargetAtTime(harmVol, now, 0.06);
      }

      // Master Engine Volume: Quieter at idle, punchier under aggressive drive
      const masterVol = 0.12 + Math.min(0.14, (this.currentRpm / 6000) * 0.10 + (throttle > 0 ? 0.05 : 0));
      this.engineMasterGain.gain.setTargetAtTime(this.isMuted ? 0 : masterVol, now, 0.06);
    } catch {
      // AudioContext safety
    }
  }

  /**
   * Stops the engine synthesizer cleanly
   */
  public static stopEngine() {
    if (!this.isEngineRunning) return;
    try {
      if (this.cylOsc) {
        this.cylOsc.stop();
        this.cylOsc.disconnect();
        this.cylOsc = null;
      }
      if (this.harmOsc) {
        this.harmOsc.stop();
        this.harmOsc.disconnect();
        this.harmOsc = null;
      }
      this.isEngineRunning = false;
    } catch {
      // ignore
    }
  }

  /**
   * Realistic Suspension & Tire Landing Impact
   */
  public static playLandingThud(impactIntensity: number = 1.0) {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const intensity = Math.min(2.5, Math.max(0.6, impactIntensity));

      // 1. Deep Bass Compression Transient (55Hz -> 28Hz pitch envelope)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(65 * intensity, now);
      osc.frequency.exponentialRampToValueAtTime(26, now + 0.14);

      const bassVol = Math.min(0.35, 0.12 * intensity);
      oscGain.gain.setValueAtTime(bassVol, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.17);

      // 2. Mechanical Suspension Compression Slap (Filtered noise burst)
      const bufferSize = Math.floor(ctx.sampleRate * 0.08);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(220, now);
      noiseFilter.Q.setValueAtTime(1.4, now);

      const noiseGain = ctx.createGain();
      const noiseVol = Math.min(0.25, 0.08 * intensity);
      noiseGain.gain.setValueAtTime(noiseVol, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noiseSource.start(now);
    } catch {
      // ignore
    }
  }

  /**
   * Loss of Balance / Skid / Chassis Scrape
   */
  public static playLossOfBalance() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.18);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch {
      // ignore
    }
  }

  /**
   * Premium Vehicle Collision / Rollover Crash Sound
   */
  public static playCrash() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;

      // 1. Heavy Metal / Chassis Impact (Low frequency thud)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(24, now + 0.45);

      oscGain.gain.setValueAtTime(0.35, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.50);

      // 2. Structural Crunch (Dense filtered noise decay)
      const bufferSize = Math.floor(ctx.sampleRate * 0.35);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.10));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, now);
      filter.frequency.exponentialRampToValueAtTime(90, now + 0.35);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.30, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(now);
    } catch {
      // ignore
    }
  }

  /**
   * Sparkling Gold Coin Pickup Chime
   */
  public static playCoinCollect() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.07); // E6

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  /**
   * Fuel Can Refill Sound (Ascending Harmonic Arpeggio)
   */
  public static playFuelRefill() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const freqs = [440, 554.37, 659.25, 880];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.05);

        gain.gain.setValueAtTime(0.14, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.18);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.2);
      });
    } catch {}
  }

  /**
   * Countdown Tone
   */
  public static playCountdownTick(isGo: boolean = false) {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      if (!isGo) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.13);
      } else {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.03);
          gain.gain.setValueAtTime(0.2, now + idx * 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.03 + 0.35);
          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(now + idx * 0.03);
          osc.stop(now + idx * 0.03 + 0.36);
        });
      }
    } catch {}
  }

  /**
   * Immediately stops all sound and cleans up resources
   */
  public static stopAll() {
    this.stopEngine();
  }
}

