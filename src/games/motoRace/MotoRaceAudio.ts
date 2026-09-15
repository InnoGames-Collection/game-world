/**
 * MOTO RACE — Professional Procedural Web Audio Engine
 * 
 * Sourced to reproduce the reference video's motorcycle racing acoustic signature:
 * - Multi-oscillator 4-stroke combustion engine with dynamic RPM and gear shift emulation
 * - Aerodynamic wind buffeting noise that filters in at high speed
 * - High-speed close overtake doppler whoosh with bonus reward chime
 * - Brake disc and tire friction screech on hard braking
 * - High-impact multi-layered crash crunch with metal deformation and low rumble
 * - Clean level complete fanfare
 * - Guaranteed instant mute and zero-leak cleanup on pause or exit
 */

export class MotoRaceAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isRunning: boolean = false;

  // Master Gain
  private masterGain: GainNode | null = null;

  // Engine Synthesis Nodes
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private oscCylinder1: OscillatorNode | null = null;
  private oscCylinder2: OscillatorNode | null = null;
  private oscSubRumble: OscillatorNode | null = null;
  private waveshaper: WaveShaperNode | null = null;

  // Wind Synthesis Nodes
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windSource: AudioBufferSourceNode | null = null;

  // Gear & RPM State
  private currentRPM: number = 1800; // Idle RPM ~1800
  private currentGear: number = 1;
  private lastGearShiftTime: number = 0;

  constructor(initiallyMuted: boolean = false) {
    this.isMuted = initiallyMuted;
  }

  /**
   * Initializes the AudioContext on user interaction
   */
  public init(): void {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupEngineSynth();
      this.setupWindSynth();
      this.isRunning = true;
    } catch (e) {
      console.warn('MotoRaceAudio: Failed to initialize Web Audio API', e);
    }
  }

  /**
   * Builds the procedural 4-stroke multi-cylinder motorcycle engine synthesizer
   */
  private setupEngineSynth(): void {
    if (!this.ctx || !this.masterGain) return;

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.28, this.ctx.currentTime);

    // Warm, aggressive engine tone filter
    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
    this.engineFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    // Subtle distortion waveshaper for realistic mechanical exhaust bite
    this.waveshaper = this.ctx.createWaveShaper();
    this.waveshaper.curve = this.createDistortionCurve(16);

    // Oscillator 1: Primary 4-stroke cylinder pulse (Sawtooth)
    this.oscCylinder1 = this.ctx.createOscillator();
    this.oscCylinder1.type = 'sawtooth';
    this.oscCylinder1.frequency.setValueAtTime(32, this.ctx.currentTime);

    // Oscillator 2: Firing harmonic (Triangle)
    this.oscCylinder2 = this.ctx.createOscillator();
    this.oscCylinder2.type = 'triangle';
    this.oscCylinder2.frequency.setValueAtTime(64, this.ctx.currentTime);

    // Oscillator 3: Low-end chassis rumble (Sine)
    this.oscSubRumble = this.ctx.createOscillator();
    this.oscSubRumble.type = 'sine';
    this.oscSubRumble.frequency.setValueAtTime(24, this.ctx.currentTime);

    // Sub gains
    const gain1 = this.ctx.createGain();
    gain1.gain.value = 0.55;
    const gain2 = this.ctx.createGain();
    gain2.gain.value = 0.35;
    const gainSub = this.ctx.createGain();
    gainSub.gain.value = 0.25;

    this.oscCylinder1.connect(gain1);
    this.oscCylinder2.connect(gain2);
    this.oscSubRumble.connect(gainSub);

    gain1.connect(this.waveshaper);
    gain2.connect(this.waveshaper);
    gainSub.connect(this.engineFilter);

    this.waveshaper.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.oscCylinder1.start();
    this.oscCylinder2.start();
    this.oscSubRumble.start();
  }

  /**
   * Builds procedural aerodynamic wind buffeting
   */
  private setupWindSynth(): void {
    if (!this.ctx || !this.masterGain) return;

    // 2-second white noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.windSource = this.ctx.createBufferSource();
    this.windSource.buffer = noiseBuffer;
    this.windSource.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.setValueAtTime(350, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    this.windSource.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);

    this.windSource.start();
  }

  /**
   * Updates engine pitch and volume based on speed, throttle, and simulated gearbox
   */
  public updateEngine(
    speedKmh: number,
    maxSpeedKmh: number,
    isAccelerating: boolean,
    isBraking: boolean
  ): void {
    if (!this.ctx || !this.isRunning || this.isMuted) return;

    const t = this.ctx.currentTime;
    const nowMs = performance.now();

    // 5-speed realistic motorcycle gear ratios
    const gearRatios = [
      { minSpeed: 0, maxSpeed: 38, baseRPM: 1800, maxRPM: 8500 },
      { minSpeed: 35, maxSpeed: 68, baseRPM: 3800, maxRPM: 9200 },
      { minSpeed: 65, maxSpeed: 100, baseRPM: 4800, maxRPM: 9800 },
      { minSpeed: 95, maxSpeed: 130, baseRPM: 5500, maxRPM: 10400 },
      { minSpeed: 125, maxSpeed: 170, baseRPM: 6200, maxRPM: 11500 },
    ];

    let newGear = 1;
    for (let g = gearRatios.length - 1; g >= 0; g--) {
      if (speedKmh >= gearRatios[g].minSpeed) {
        newGear = g + 1;
        break;
      }
    }

    if (newGear !== this.currentGear && nowMs - this.lastGearShiftTime > 300) {
      this.currentGear = newGear;
      this.lastGearShiftTime = nowMs;
    }

    const currentRatio = gearRatios[this.currentGear - 1];
    const gearFraction = Math.max(
      0,
      Math.min(1, (speedKmh - currentRatio.minSpeed) / (currentRatio.maxSpeed - currentRatio.minSpeed + 0.001))
    );

    let targetRPM = currentRatio.baseRPM + gearFraction * (currentRatio.maxRPM - currentRatio.baseRPM);

    // Throttle response: revs rise faster when gas is pinned, drop when coasting or braking
    if (isAccelerating) {
      targetRPM += 450;
    } else if (isBraking) {
      targetRPM = Math.max(1600, targetRPM - 800);
    } else {
      targetRPM = Math.max(1800, targetRPM - 200);
    }

    // Smooth RPM interpolation
    this.currentRPM += (targetRPM - this.currentRPM) * 0.15;

    // Map RPM to fundamental firing frequency (1 RPM / 60 * 2-cylinder fire factor)
    const fundamentalFreq = Math.max(28, (this.currentRPM / 60) * 1.8);

    if (this.oscCylinder1 && this.oscCylinder2 && this.oscSubRumble) {
      this.oscCylinder1.frequency.setTargetAtTime(fundamentalFreq, t, 0.05);
      this.oscCylinder2.frequency.setTargetAtTime(fundamentalFreq * 2.01, t, 0.05);
      this.oscSubRumble.frequency.setTargetAtTime(fundamentalFreq * 0.5, t, 0.05);
    }

    // Filter opens up with throttle and high speed
    if (this.engineFilter) {
      const filterCutoff = isAccelerating
        ? Math.min(3200, 750 + (this.currentRPM / 11000) * 2400)
        : Math.min(1800, 450 + (this.currentRPM / 11000) * 900);
      this.engineFilter.frequency.setTargetAtTime(filterCutoff, t, 0.08);
    }

    // Engine volume dynamics
    if (this.engineGain) {
      const baseVol = 0.22 + (speedKmh / maxSpeedKmh) * 0.18 + (isAccelerating ? 0.08 : 0);
      this.engineGain.gain.setTargetAtTime(baseVol, t, 0.08);
    }

    // Aerodynamic wind rushing increases exponentially above 50 km/h
    if (this.windGain && this.windFilter) {
      const windFactor = Math.max(0, (speedKmh - 45) / (maxSpeedKmh - 45));
      const windVol = Math.pow(windFactor, 1.4) * 0.32;
      this.windGain.gain.setTargetAtTime(windVol, t, 0.1);

      const windFreq = 280 + windFactor * 950;
      this.windFilter.frequency.setTargetAtTime(windFreq, t, 0.1);
    }
  }

  /**
   * Plays the doppler close overtake whoosh and reward sound effect
   */
  public playNearMiss(): void {
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // 1. Doppler Whoosh (White noise sweep)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const whooshSource = this.ctx.createBufferSource();
    whooshSource.buffer = noiseBuffer;

    const whooshFilter = this.ctx.createBiquadFilter();
    whooshFilter.type = 'bandpass';
    whooshFilter.frequency.setValueAtTime(1400, t);
    whooshFilter.frequency.exponentialRampToValueAtTime(320, t + 0.4);
    whooshFilter.Q.value = 3.0;

    const whooshGain = this.ctx.createGain();
    whooshGain.gain.setValueAtTime(0.01, t);
    whooshGain.gain.linearRampToValueAtTime(0.45, t + 0.12);
    whooshGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    whooshSource.connect(whooshFilter);
    whooshFilter.connect(whooshGain);
    whooshGain.connect(this.masterGain || this.ctx.destination);

    whooshSource.start(t);

    // 2. High-Tech Near-Miss Reward Chime
    const chimeOsc = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chimeOsc.type = 'sine';
    chimeOsc.frequency.setValueAtTime(987.77, t); // B5
    chimeOsc.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    chimeGain.gain.setValueAtTime(0.22, t);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(this.masterGain || this.ctx.destination);

    chimeOsc.start(t);
    chimeOsc.stop(t + 0.38);
  }

  /**
   * Plays tire and brake disc friction screech on aggressive braking
   */
  public playBrakeScreech(): void {
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const dur = 0.32;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.4;
    }

    const screechSource = this.ctx.createBufferSource();
    screechSource.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.frequency.linearRampToValueAtTime(1800, t + dur);
    filter.Q.value = 6.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    screechSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);

    screechSource.start(t);
  }

  /**
   * Plays multi-layered collision crunch sound (impact + metal tear + sub bass)
   */
  public playCrash(): void {
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Immediately lower engine volume
    if (this.engineGain) {
      this.engineGain.gain.setTargetAtTime(0.01, t, 0.05);
    }
    if (this.windGain) {
      this.windGain.gain.setTargetAtTime(0.001, t, 0.05);
    }

    // 1. High frequency metal impact crunch
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.8);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
    }

    const crashSource = this.ctx.createBufferSource();
    crashSource.buffer = noiseBuffer;

    const crashFilter = this.ctx.createBiquadFilter();
    crashFilter.type = 'lowpass';
    crashFilter.frequency.setValueAtTime(2800, t);
    crashFilter.frequency.exponentialRampToValueAtTime(350, t + 0.7);

    const crashGain = this.ctx.createGain();
    crashGain.gain.setValueAtTime(0.85, t);
    crashGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    crashSource.connect(crashFilter);
    crashFilter.connect(crashGain);
    crashGain.connect(this.masterGain || this.ctx.destination);
    crashSource.start(t);

    // 2. Heavy Sub-Bass Boom
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(140, t);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.6);

    subGain.gain.setValueAtTime(0.9, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain || this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.75);
  }

  /**
   * Plays Level Complete victory fanfare
   */
  public playLevelComplete(): void {
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [
      { f: 523.25, time: 0.0 },  // C5
      { f: 659.25, time: 0.14 }, // E5
      { f: 783.99, time: 0.28 }, // G5
      { f: 1046.5, time: 0.44 }, // C6
    ];

    notes.forEach((n) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t + n.time);

      gain.gain.setValueAtTime(0, t + n.time);
      gain.gain.linearRampToValueAtTime(0.3, t + n.time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.time + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(t + n.time);
      osc.stop(t + n.time + 0.5);
    });
  }

  /**
   * Plays snappy UI tactile click sound
   */
  public playButtonClick(): void {
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  /**
   * Toggles mute state cleanly
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.85, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Generates a smooth non-linear wave shaping curve for engine distortion
   */
  private createDistortionCurve(amount: number): Float32Array {
    const k = typeof amount === 'number' ? amount : 20;
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
   * Mutes all audio output instantly
   */
  public mute(): void {
    this.isMuted = true;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  /**
   * Unmutes audio output
   */
  public unmute(): void {
    this.isMuted = false;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
    }
  }

  /**
   * Pauses the audio engine
   */
  public pause(): void {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  /**
   * Resumes the audio engine
   */
  public resume(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Completely destroys all audio nodes and shuts down AudioContext to prevent any memory or sound leaks
   */
  public destroy(): void {
    this.isRunning = false;

    if (this.oscCylinder1) {
      try { this.oscCylinder1.stop(); this.oscCylinder1.disconnect(); } catch {}
    }
    if (this.oscCylinder2) {
      try { this.oscCylinder2.stop(); this.oscCylinder2.disconnect(); } catch {}
    }
    if (this.oscSubRumble) {
      try { this.oscSubRumble.stop(); this.oscSubRumble.disconnect(); } catch {}
    }
    if (this.windSource) {
      try { this.windSource.stop(); this.windSource.disconnect(); } catch {}
    }
    if (this.ctx) {
      try { this.ctx.close(); } catch {}
      this.ctx = null;
    }
  }
}
