// =============================================================================
// BUTTON SOCCER AUTHORITATIVE AUDIO MANAGER
// Zero loops, zero background drone, pure event-driven sound synthesis
// =============================================================================

class ButtonSoccerAudio {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private activeOscillators: OscillatorNode[] = [];
  private activeTimeouts: number[] = [];
  private lastWallBounceTime: number = 0;
  private lastDiscClackTime: number = 0;
  private lastKickTime: number = 0;

  constructor() {
    // Lazy AudioContext initialization on first user gesture
  }

  public initialize() {
    this.initContext();
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setEnabled(enable: boolean) {
    this.enabled = enable;
    if (!enable) {
      this.stopAll();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Track oscillators to ensure zero sound leaks
  private registerOscillator(osc: OscillatorNode) {
    this.activeOscillators.push(osc);
    osc.onended = () => {
      const idx = this.activeOscillators.indexOf(osc);
      if (idx !== -1) this.activeOscillators.splice(idx, 1);
    };
  }

  private registerTimeout(id: number) {
    this.activeTimeouts.push(id);
  }

  // ---------------------------------------------------------------------------
  // 1. UI Click: Crisp, short UI tap
  // ---------------------------------------------------------------------------
  public playClick() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      this.registerOscillator(osc);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  // ---------------------------------------------------------------------------
  // 2. Select: Subtle pitch for player selection
  // ---------------------------------------------------------------------------
  public playSelect() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.06);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      this.registerOscillator(osc);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  // ---------------------------------------------------------------------------
  // 3. Referee Whistle (Clean, sporty whistle)
  // ---------------------------------------------------------------------------
  public playWhistle(isDouble: boolean = false) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const playWhistleTone = (startTime: number, duration: number) => {
        if (!this.ctx) return;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(2600, startTime);
        osc1.frequency.linearRampToValueAtTime(2850, startTime + duration * 0.5);
        osc1.frequency.linearRampToValueAtTime(2700, startTime + duration);

        osc2.frequency.setValueAtTime(2610, startTime);
        osc2.frequency.linearRampToValueAtTime(2860, startTime + duration * 0.5);

        gain.gain.setValueAtTime(0.01, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
        gain.gain.linearRampToValueAtTime(0.12, startTime + duration - 0.03);
        gain.gain.linearRampToValueAtTime(0.001, startTime + duration);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        this.registerOscillator(osc1);
        this.registerOscillator(osc2);

        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(startTime + duration);
        osc2.stop(startTime + duration);
      };

      const now = this.ctx.currentTime;
      if (isDouble) {
        playWhistleTone(now, 0.12);
        playWhistleTone(now + 0.18, 0.28);
      } else {
        playWhistleTone(now, 0.18);
      }
    } catch {}
  }

  // ---------------------------------------------------------------------------
  // 4. Ball Kick / Impact (Solid sporty thud)
  // ---------------------------------------------------------------------------
  public playKick(powerNormalized: number = 0.5) {
    if (!this.enabled) return;
    const nowMs = performance.now();
    if (nowMs - this.lastKickTime < 60) return;
    this.lastKickTime = nowMs;
    this.initContext();
    if (!this.ctx) return;

    try {
      const p = Math.min(1, Math.max(0.1, powerNormalized));
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140 + p * 80, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.11);

      gain.gain.setValueAtTime(0.32 * p, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      this.registerOscillator(osc);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  // ---------------------------------------------------------------------------
  // 5. Disc-to-Disc Clack (Sharp acrylic disc contact)
  // ---------------------------------------------------------------------------
  public playDiscClack(intensity: number = 0.5) {
    if (!this.enabled) return;
    const nowMs = performance.now();
    if (nowMs - this.lastDiscClackTime < 60) return;
    this.lastDiscClackTime = nowMs;
    this.initContext();
    if (!this.ctx) return;

    try {
      const vol = Math.min(0.25, Math.max(0.05, intensity * 0.25));
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(750 + Math.random() * 250, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.035);

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      this.registerOscillator(osc);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  // ---------------------------------------------------------------------------
  // 6. Wall Bounce (Cushioned pitch rebound)
  // ---------------------------------------------------------------------------
  public playWallBounce(intensity: number = 0.5) {
    if (!this.enabled) return;
    const nowMs = performance.now();
    if (nowMs - this.lastWallBounceTime < 60) return;
    this.lastWallBounceTime = nowMs;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(85, now + 0.055);

      const vol = Math.min(0.18, Math.max(0.03, intensity * 0.18));
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      this.registerOscillator(osc);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  // ---------------------------------------------------------------------------
  // 7. Goal Celebration (Stadium Horn + celebration fanfare, strictly finite)
  // ---------------------------------------------------------------------------
  public playGoal() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      this.playWhistle(true);

      const now = this.ctx.currentTime;
      // Stadium horn chord (D4, F#4, A4)
      const freqs = [293.66, 369.99, 440.0];
      freqs.forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + 0.12);

        gain.gain.setValueAtTime(0.01, now + 0.12);
        gain.gain.linearRampToValueAtTime(0.11, now + 0.22);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        this.registerOscillator(osc);
        osc.start(now + 0.12);
        osc.stop(now + 1.12);
      });
    } catch {}
  }

  // ---------------------------------------------------------------------------
  // 8. Turn Switch notification tone
  // ---------------------------------------------------------------------------
  public playTurnChime(isUserTurn: boolean) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const pitch = isUserTurn ? 587.33 : 440; // D5 for user, A4 for opponent
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 1.25, now + 0.08);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      this.registerOscillator(osc);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  // ---------------------------------------------------------------------------
  // 9. Match Win Fanfare (Finite celebration chord)
  // ---------------------------------------------------------------------------
  public playVictory() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const startTime = this.ctx.currentTime + idx * 0.12;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.14, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        this.registerOscillator(osc);
        osc.start(startTime);
        osc.stop(startTime + 0.36);
      });
    } catch {}
  }

  // ---------------------------------------------------------------------------
  // 10. Match Defeat Tone (Subtle minor notes)
  // ---------------------------------------------------------------------------
  public playDefeat() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [440, 415.3, 392, 349.23];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const startTime = this.ctx.currentTime + idx * 0.18;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        this.registerOscillator(osc);
        osc.start(startTime);
        osc.stop(startTime + 0.32);
      });
    } catch {}
  }

  // ---------------------------------------------------------------------------
  // Required Authoritative Lifecycle Methods
  // ---------------------------------------------------------------------------
  public playMusic() {
    // No continuous music - zero drone requirement
  }

  public stopMusic() {
    // No continuous music
  }

  public playSFX(name: string, param?: number) {
    if (name === 'click') this.playClick();
    else if (name === 'select') this.playSelect();
    else if (name === 'kick') this.playKick(param);
    else if (name === 'clack') this.playDiscClack(param);
    else if (name === 'bounce') this.playWallBounce(param);
    else if (name === 'whistle') this.playWhistle();
    else if (name === 'goal') this.playGoal();
    else if (name === 'victory') this.playVictory();
    else if (name === 'defeat') this.playDefeat();
  }

  public stopSFX() {
    this.stopAll();
  }

  public pauseAll() {
    this.stopAll();
  }

  public resumeAll() {
    // Event-based sounds resume when events occur
  }

  public stopAll() {
    this.activeTimeouts.forEach((t) => clearTimeout(t));
    this.activeTimeouts = [];

    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscillators = [];
  }

  public destroy() {
    this.stopAll();
    if (this.ctx) {
      try {
        this.ctx.close().catch(() => {});
      } catch {}
      this.ctx = null;
    }
  }

  // Deprecated ambient loop stubs for backwards compatibility - strictly no-ops
  public startCrowdAmbience() {}
  public stopCrowdAmbience() {}
}

export const buttonSoccerAudio = new ButtonSoccerAudio();
