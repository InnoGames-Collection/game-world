/**
 * ROYAL WATER SORT — AUTHORITATIVE AUDIO MANAGER
 * 
 * Clean, procedural Web Audio implementation:
 * - NO continuous drone, NO engine sounds, NO background rumble ("urrrrrr...").
 * - Clean lifecycle: initialize(), stopAll(), pauseAll(), resumeAll(), destroy().
 * - When destroyed/unmounted, all audio contexts, nodes, and timers are synchronously
 *   torn down so ZERO sound can ever leak outside Royal Water Sort.
 */
class RoyalWaterSortAudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  private pourTimer: number | null = null;
  private activeOscs: Set<OscillatorNode> = new Set();
  private scheduledTimeouts: Set<number> = new Set();

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      try {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      } catch {
        this.ctx = null;
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (!val) {
      this.stopAll();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private registerTimeout(fn: () => void, ms: number): number {
    const id = window.setTimeout(() => {
      this.scheduledTimeouts.delete(id);
      fn();
    }, ms);
    this.scheduledTimeouts.add(id);
    return id;
  }

  // ---------------------------------------------------------------------------
  // Clean Lifecycle Management
  // ---------------------------------------------------------------------------
  public stopAll() {
    // 1. Clear pouring trickle timers
    if (this.pourTimer !== null) {
      window.clearInterval(this.pourTimer);
      this.pourTimer = null;
    }

    // 2. Clear all scheduled audio timeouts
    this.scheduledTimeouts.forEach((id) => window.clearTimeout(id));
    this.scheduledTimeouts.clear();

    // 3. Stop and disconnect all active oscillators
    this.activeOscs.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscs.clear();
  }

  public pauseAll() {
    this.stopAll();
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  public resumeAll() {
    if (this.ctx && this.ctx.state === 'suspended' && this.enabled) {
      this.ctx.resume().catch(() => {});
    }
  }

  public destroy() {
    this.stopAll();
    if (this.ctx) {
      try {
        if (this.ctx.state !== 'closed') {
          this.ctx.close().catch(() => {});
        }
      } catch {}
      this.ctx = null;
      this.masterGain = null;
    }
  }

  // ---------------------------------------------------------------------------
  // UI Sound Effects
  // ---------------------------------------------------------------------------
  public playClick() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, t);
      osc.frequency.exponentialRampToValueAtTime(780, t + 0.035);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      this.activeOscs.add(osc);
      osc.start(t);
      osc.stop(t + 0.04);

      osc.onended = () => {
        this.activeOscs.delete(osc);
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    } catch {}
  }

  public playBottleSelect() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    try {
      const t = ctx.currentTime;
      // High-pitched crystal glass clink (delicate and short)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1450, t);
      osc1.frequency.exponentialRampToValueAtTime(1750, t + 0.1);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(2900, t);
      osc2.frequency.exponentialRampToValueAtTime(3200, t + 0.06);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      this.activeOscs.add(osc1);
      this.activeOscs.add(osc2);
      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.12);
      osc2.stop(t + 0.12);

      osc1.onended = () => {
        this.activeOscs.delete(osc1);
        this.activeOscs.delete(osc2);
        try {
          osc1.disconnect();
          osc2.disconnect();
          gain.disconnect();
        } catch {}
      };
    } catch {}
  }

  public playInvalid() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    try {
      const t = ctx.currentTime;
      // Soft double blip (NOT an annoying buzz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.setValueAtTime(120, t + 0.06);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain);

      this.activeOscs.add(osc);
      osc.start(t);
      osc.stop(t + 0.14);

      osc.onended = () => {
        this.activeOscs.delete(osc);
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    } catch {}
  }

  // ---------------------------------------------------------------------------
  // Realistic Water Pouring & Droplet Sounds (NO DRONE!)
  // ---------------------------------------------------------------------------
  public startPourSound(durationMs: number = 650) {
    if (!this.enabled) return;
    this.stopPourSound();

    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    // Play pleasant water trickle droplet pulses during active pour
    let elapsed = 0;
    const intervalTime = 90;

    const playDroplet = () => {
      if (!this.enabled || !this.ctx || !this.masterGain) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Random subtle pitch variations for natural bubbling liquid sound
        const freq = 480 + Math.random() * 260;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.35, t + 0.05);

        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.065);

        osc.connect(gain);
        gain.connect(this.masterGain);

        this.activeOscs.add(osc);
        osc.start(t);
        osc.stop(t + 0.065);

        osc.onended = () => {
          this.activeOscs.delete(osc);
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        };
      } catch {}
    };

    // First droplet immediately
    playDroplet();

    this.pourTimer = window.setInterval(() => {
      elapsed += intervalTime;
      if (elapsed >= durationMs) {
        this.stopPourSound();
        return;
      }
      playDroplet();
    }, intervalTime);
  }

  public stopPourSound() {
    if (this.pourTimer !== null) {
      window.clearInterval(this.pourTimer);
      this.pourTimer = null;
    }
  }

  public playPourSettle() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    try {
      const t = ctx.currentTime;
      // Soft settling droplet ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(840, t);
      osc.frequency.exponentialRampToValueAtTime(1260, t + 0.08);

      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      this.activeOscs.add(osc);
      osc.start(t);
      osc.stop(t + 0.1);

      osc.onended = () => {
        this.activeOscs.delete(osc);
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    } catch {}
  }

  // ---------------------------------------------------------------------------
  // Bottle Completed Golden Cork Pop
  // ---------------------------------------------------------------------------
  public playCorkPop() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    try {
      const t = ctx.currentTime;
      // 1. Pop thud
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(280, t);
      osc1.frequency.exponentialRampToValueAtTime(85, t + 0.07);
      gain1.gain.setValueAtTime(0.3, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc1.connect(gain1);
      gain1.connect(this.masterGain);

      this.activeOscs.add(osc1);
      osc1.start(t);
      osc1.stop(t + 0.08);
      osc1.onended = () => {
        this.activeOscs.delete(osc1);
        try {
          osc1.disconnect();
          gain1.disconnect();
        } catch {}
      };

      // 2. Gentle star sparkle
      const notes = [1046.5, 1318.5, 1567.98];
      notes.forEach((freq, i) => {
        this.registerTimeout(() => {
          if (!this.ctx || !this.masterGain) return;
          try {
            const time = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);
            g.gain.setValueAtTime(0.1, time);
            g.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
            osc.connect(g);
            g.connect(this.masterGain);
            this.activeOscs.add(osc);
            osc.start(time);
            osc.stop(time + 0.15);
            osc.onended = () => {
              this.activeOscs.delete(osc);
              try {
                osc.disconnect();
                g.disconnect();
              } catch {}
            };
          } catch {}
        }, i * 35);
      });
    } catch {}
  }

  // ---------------------------------------------------------------------------
  // Booster Magic Chime
  // ---------------------------------------------------------------------------
  public playBoosterChime() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    try {
      const freqs = [587.33, 739.99, 880.0, 1174.66];
      freqs.forEach((freq, idx) => {
        this.registerTimeout(() => {
          if (!this.ctx || !this.masterGain) return;
          try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            osc.connect(gain);
            gain.connect(this.masterGain);
            this.activeOscs.add(osc);
            osc.start(t);
            osc.stop(t + 0.2);
            osc.onended = () => {
              this.activeOscs.delete(osc);
              try {
                osc.disconnect();
                gain.disconnect();
              } catch {}
            };
          } catch {}
        }, idx * 45);
      });
    } catch {}
  }

  // ---------------------------------------------------------------------------
  // Coin Reward & Victory Celebration
  // ---------------------------------------------------------------------------
  public playCoin() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1320, t);
      osc.frequency.exponentialRampToValueAtTime(1980, t + 0.07);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc.connect(gain);
      gain.connect(this.masterGain);
      this.activeOscs.add(osc);
      osc.start(t);
      osc.stop(t + 0.09);
      osc.onended = () => {
        this.activeOscs.delete(osc);
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    } catch {}
  }

  public playLevelStart() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    try {
      const notes = [440, 554.37, 659.25];
      notes.forEach((f, idx) => {
        this.registerTimeout(() => {
          if (!this.ctx || !this.masterGain) return;
          try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, t);
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            osc.connect(gain);
            gain.connect(this.masterGain);
            this.activeOscs.add(osc);
            osc.start(t);
            osc.stop(t + 0.22);
            osc.onended = () => {
              this.activeOscs.delete(osc);
              try {
                osc.disconnect();
                gain.disconnect();
              } catch {}
            };
          } catch {}
        }, idx * 60);
      });
    } catch {}
  }

  public playVictory() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    try {
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((f, idx) => {
        this.registerTimeout(() => {
          if (!this.ctx || !this.masterGain) return;
          try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, t);
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
            osc.connect(gain);
            gain.connect(this.masterGain);
            this.activeOscs.add(osc);
            osc.start(t);
            osc.stop(t + 0.4);
            osc.onended = () => {
              this.activeOscs.delete(osc);
              try {
                osc.disconnect();
                gain.disconnect();
              } catch {}
            };
          } catch {}
        }, idx * 70);
      });
    } catch {}
  }
}

export const royalWaterSortAudio = new RoyalWaterSortAudioManager();
