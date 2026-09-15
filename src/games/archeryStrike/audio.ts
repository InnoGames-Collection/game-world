/**
 * Archery Strike - Zero-Latency Multi-Layer Web Audio Synthesizer
 * High-fidelity procedural audio for bow tension, release twang, projectile flight whoosh,
 * wooden target impacts, bullseye chimes, and stage fanfares.
 */

export class ArcheryAudio {
  private static ctx: AudioContext | null = null;
  private static masterGain: GainNode | null = null;
  private static isMuted: boolean = false;

  public static init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
   * Bow string tension pull sound (scales dynamically with draw depth)
   */
  public static playBowPull(powerFraction: number) {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = 95 + powerFraction * 180;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.linearRampToValueAtTime(baseFreq + 35, now + 0.08);

      gain.gain.setValueAtTime(0.06 * Math.max(0.2, powerFraction), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }

  /**
   * Bow string release twang (sharp initial pluck + low body vibration)
   */
  public static playBowRelease() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;

      // 1. High string twang pluck
      const twangOsc = ctx.createOscillator();
      const twangGain = ctx.createGain();
      twangOsc.type = 'sawtooth';
      twangOsc.frequency.setValueAtTime(520, now);
      twangOsc.frequency.exponentialRampToValueAtTime(110, now + 0.16);

      twangGain.gain.setValueAtTime(0.4, now);
      twangGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.18);

      twangOsc.connect(filter);
      filter.connect(twangGain);
      twangGain.connect(this.masterGain);

      twangOsc.start(now);
      twangOsc.stop(now + 0.2);

      // 2. Bow limb mechanical snap
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'sine';
      snapOsc.frequency.setValueAtTime(260, now);
      snapOsc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

      snapGain.gain.setValueAtTime(0.35, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      snapOsc.connect(snapGain);
      snapGain.connect(this.masterGain);

      snapOsc.start(now);
      snapOsc.stop(now + 0.14);
    } catch {}
  }

  /**
   * Arrow flight aerodynamic whoosh
   */
  public static playFlightWhoosh(durationMs: number = 600) {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const durSec = Math.min(1.2, durationMs / 1000);

      // Bandpass noise sweep
      const bufferSize = Math.floor(ctx.sampleRate * durSec);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / bufferSize);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(450, now);
      bandpass.frequency.exponentialRampToValueAtTime(1400, now + durSec * 0.5);
      bandpass.frequency.exponentialRampToValueAtTime(600, now + durSec);
      bandpass.Q.value = 3.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.18, now + durSec * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durSec);

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + durSec + 0.05);
    } catch {}
  }

  /**
   * Target Wood Impact Thud (Tiered feedback based on ring accuracy)
   */
  public static playTargetHit(ringType: string) {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const isBullseye = ringType === 'BULLSEYE';
      const isGold = ringType === 'GOLD';

      // 1. Heavy wooden target board thump
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);

      gain.gain.setValueAtTime(isBullseye ? 0.45 : 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.18);

      // 2. High arrow shaft penetration click
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'sawtooth';
      clickOsc.frequency.setValueAtTime(1200, now);
      clickOsc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

      clickGain.gain.setValueAtTime(0.25, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      clickOsc.connect(clickGain);
      clickGain.connect(this.masterGain);

      clickOsc.start(now);
      clickOsc.stop(now + 0.07);

      // 3. Celebratory Golden Harmonic Bell for Bullseye / Gold
      if (isBullseye || isGold) {
        const frequencies = isBullseye
          ? [880, 1174.66, 1479.98, 1760]
          : [659.25, 880, 1046.5];
        frequencies.forEach((freq, idx) => {
          const chimeOsc = ctx.createOscillator();
          const chimeGain = ctx.createGain();
          chimeOsc.type = 'sine';
          chimeOsc.frequency.setValueAtTime(freq, now + 0.04 + idx * 0.04);

          chimeGain.gain.setValueAtTime(0.2, now + 0.04 + idx * 0.04);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04 + idx * 0.04 + 0.32);

          chimeOsc.connect(chimeGain);
          chimeGain.connect(this.masterGain!);

          chimeOsc.start(now + 0.04 + idx * 0.04);
          chimeOsc.stop(now + 0.04 + idx * 0.04 + 0.35);
        });
      }
    } catch {}
  }

  /**
   * Miss Impact (Dull ground/turf landing)
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
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 0.22);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }

  /**
   * Stage Complete Fanfare
   */
  public static playStageWin() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.24, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.28);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } catch {}
  }

  /**
   * UI Click
   */
  public static playClick() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }
}
