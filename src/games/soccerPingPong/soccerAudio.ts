/**
 * SOCCER PING PONG - Procedural Web Audio Sports Sound Engine
 * Zero external audio assets required. Safe, responsive, and mobile-ready.
 */

class SoccerAudioEngine {
  private ctx: AudioContext | null = null;
  public soundEnabled: boolean = true;
  public musicEnabled: boolean = true;
  private crowdNode: AudioNode | null = null;
  private isCrowdPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Leather ball bounce on grass/table
  public playBounce(volume: number = 0.5) {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);

      gain.gain.setValueAtTime(volume * 0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Audio fallback
    }
  }

  // Paddle / boot hit on soccer ball
  public playHit(quality: 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS', combo: number = 1) {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Base solid thump
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const baseFreq = quality === 'PERFECT' ? 220 : quality === 'GREAT' ? 180 : 150;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

      const hitVol = quality === 'PERFECT' ? 0.7 : quality === 'GREAT' ? 0.55 : 0.4;
      gain.gain.setValueAtTime(hitVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);

      // Sweet-spot acoustic chime for PERFECT or high combo
      if (quality === 'PERFECT' || quality === 'GREAT') {
        const chimeOsc = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chimeOsc.type = 'sine';
        const chimeFreq = quality === 'PERFECT' ? 880 + Math.min(600, combo * 40) : 660;
        chimeOsc.frequency.setValueAtTime(chimeFreq, now);
        chimeOsc.frequency.exponentialRampToValueAtTime(chimeFreq * 1.5, now + 0.18);

        chimeGain.gain.setValueAtTime(0.3, now);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(this.ctx.destination);

        chimeOsc.start(now);
        chimeOsc.stop(now + 0.2);
      }
    } catch {
      // Audio fallback
    }
  }

  // Target ring or bumper hit
  public playTargetHit(points: number) {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      const f1 = points >= 500 ? 784 : 523.25; // G5 or C5
      const f2 = points >= 500 ? 1046.5 : 659.25; // C6 or E5

      osc1.frequency.setValueAtTime(f1, now);
      osc2.frequency.setValueAtTime(f2, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.24);
      osc2.stop(now + 0.24);
    } catch {
      // Audio fallback
    }
  }

  // Referee double whistle
  public playWhistle() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const playBeep = (startTime: number, duration: number) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const mod = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2650, startTime);

        // Tremolo modulation for authentic whistle flutter
        mod.frequency.setValueAtTime(32, startTime);
        modGain.gain.setValueAtTime(140, startTime);

        mod.connect(osc.frequency);

        gain.gain.setValueAtTime(0.35, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        mod.start(startTime);
        osc.start(startTime);
        mod.stop(startTime + duration);
        osc.stop(startTime + duration);
      };

      playBeep(now, 0.12);
      playBeep(now + 0.16, 0.22);
    } catch {
      // Audio fallback
    }
  }

  // Stadium crowd roar on milestone or high combo
  public playCrowdCheer(intensity: number = 0.5) {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 1.2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(650, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.28 * intensity, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 1.2);
    } catch {
      // Audio fallback
    }
  }

  // Level Complete fanfare
  public playVictoryFanfare() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.35, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + (idx === 3 ? 0.65 : 0.28));

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.7);
      });

      // Layer stadium roar with victory
      setTimeout(() => this.playCrowdCheer(0.8), 350);
    } catch {
      // Audio fallback
    }
  }

  public playFanfare() {
    this.playVictoryFanfare();
  }

  // Miss / Life lost sound
  public playMissSound() {
    this.playMiss();
  }

  public playMiss() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.2);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // Audio fallback
    }
  }

  // Level Failed sad tone
  public playDefeatSound() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [440, 415.3, 392, 349.2]; // A4, G#4, G4, F4
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.16);

        gain.gain.setValueAtTime(0.25, now + idx * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.16 + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.16);
        osc.stop(now + idx * 0.16 + 0.25);
      });
    } catch {
      // Audio fallback
    }
  }
}

export const soccerAudio = new SoccerAudioEngine();
