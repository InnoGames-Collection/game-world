/**
 * Procedural Web Audio Synthesizer for Memory Match
 * TelePlus Ethiopia Gaming Suite
 * 
 * Generates crisp, low-latency, zero-dependency game audio effects.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const MemoryAudio = {
  /**
   * Subtle tactile card tap when touched
   */
  playCardTap(enabled = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Ignore audio error
    }
  },

  /**
   * Crisp acoustic card flip sound (whoosh + snap)
   */
  playCardFlip(enabled = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Whoosh pitch
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.09);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);

      // 2. High snap click
      const snap = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snap.type = 'sine';
      snap.frequency.setValueAtTime(840, now + 0.04);
      snap.frequency.exponentialRampToValueAtTime(220, now + 0.08);

      snapGain.gain.setValueAtTime(0.09, now + 0.04);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      snap.connect(snapGain);
      snapGain.connect(ctx.destination);
      snap.start(now + 0.04);
      snap.stop(now + 0.08);
    } catch {
      // Ignore audio error
    }
  },

  /**
   * Harmonious correct pair match chime
   */
  playMatchSuccess(streak = 1, enabled = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Transpose based on streak
      const baseFreq = 440 * Math.pow(1.06, Math.min(streak, 6)); // A4 shifted
      const chord = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2.0]; // Major triad + octave

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.04;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.45);
      });
    } catch {
      // Ignore audio error
    }
  },

  /**
   * Subtle wrong-match muted response
   */
  playMatchFail(enabled = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.15);

      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // Ignore audio error
    }
  },

  /**
   * Consecutive match streak chime
   */
  playStreak(streak = 2, enabled = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
      const count = Math.min(streak + 1, notes.length);

      for (let i = 0; i < count; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + i * 0.05;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(notes[i], t);

        gain.gain.setValueAtTime(0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.35);
      }
    } catch {
      // Ignore audio error
    }
  },

  /**
   * Level Victory Fanfare
   */
  playLevelWon(enabled = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const fanfare = [
        { f: 523.25, t: 0.0, d: 0.15 },
        { f: 659.25, t: 0.11, d: 0.15 },
        { f: 783.99, t: 0.22, d: 0.18 },
        { f: 1046.5, t: 0.36, d: 0.22 },
        { f: 1318.5, t: 0.52, d: 0.6 },
      ];

      fanfare.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + n.t;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, start);

        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + n.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + n.d);
      });
    } catch {
      // Ignore audio error
    }
  },

  /**
   * Grand Championship Victory Fanfare (Level 20 Master Cleared)
   */
  playMasterVictory(enabled = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const chords = [
        { freqs: [523.25, 659.25, 783.99], t: 0.0, d: 0.35 },
        { freqs: [587.33, 698.46, 880.00], t: 0.35, d: 0.35 },
        { freqs: [659.25, 783.99, 987.77], t: 0.70, d: 0.40 },
        { freqs: [783.99, 987.77, 1174.66], t: 1.10, d: 0.45 },
        { freqs: [1046.5, 1318.5, 1567.98], t: 1.55, d: 1.2 },
      ];

      chords.forEach((chord) => {
        chord.freqs.forEach((f) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + chord.t;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, start);

          gain.gain.setValueAtTime(0.18, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + chord.d);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(start);
          osc.stop(start + chord.d);
        });
      });
    } catch {
      // Ignore audio error
    }
  },

  /**
   * Immediate audio stop and cleanup
   */
  stopAllAudio() {
    if (audioCtx && audioCtx.state !== 'closed') {
      try {
        audioCtx.suspend().catch(() => {});
      } catch {
        // Ignore
      }
    }
  }
};
