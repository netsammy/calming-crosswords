/**
 * SOUND MANAGER
 * Rich synthesized audio using Web Audio API — no external files needed.
 * Uses layered oscillators, filters, and ADSR envelopes for a premium feel.
 *
 * v2 note: Swap synthesized sounds for Howler.js with real audio files.
 */

class SoundManager {
  constructor() {
    this._ctx     = null;
    this._enabled = true;
  }

  _getCtx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
    return this._ctx;
  }

  get enabled() { return this._enabled; }
  set enabled(v) { this._enabled = v; }

  // ─── Core Synth Helpers ─────────────────────────────────────────────────

  /** Play a tone with proper ADSR envelope and optional filter */
  _playNote({
    frequency = 440,
    type = 'sine',
    duration = 0.2,
    gain = 0.15,
    detune = 0,
    attack = 0.01,
    decay = 0.05,
    sustain = 0.7,
    release = 0.1,
    filterFreq = 0,
    delay = 0,
  } = {}) {
    if (!this._enabled) return;
    try {
      const ctx = this._getCtx();
      const t   = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, t);
      if (detune) osc.detune.setValueAtTime(detune, t);

      // ADSR envelope
      env.gain.setValueAtTime(0.0001, t);
      env.gain.linearRampToValueAtTime(gain, t + attack);
      env.gain.linearRampToValueAtTime(gain * sustain, t + attack + decay);
      env.gain.setValueAtTime(gain * sustain, t + duration - release);
      env.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      if (filterFreq > 0) {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterFreq, t);
        filter.Q.setValueAtTime(1, t);
        osc.connect(filter);
        filter.connect(env);
      } else {
        osc.connect(env);
      }

      env.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duration + 0.01);
    } catch { /* ignore audio errors gracefully */ }
  }

  /** Play a layered chord for richer timbre */
  _playChord(notes, baseOpts = {}) {
    notes.forEach((freq, i) => {
      this._playNote({
        ...baseOpts,
        frequency: freq,
        gain: (baseOpts.gain || 0.12) / Math.sqrt(notes.length),
        delay: (baseOpts.delay || 0) + i * (baseOpts.stagger || 0),
      });
    });
  }

  // ─── Game Sounds ────────────────────────────────────────────────────────

  /** Soft tick — letter selected on wheel */
  tick(count = 1) {
    const baseFreq = 800;
    // Major scale multiplier steps: C, D, E, F, G, A, B, C...
    const scale = [1, 1.125, 1.25, 1.333, 1.5, 1.667, 1.875, 2.0];
    const multiplier = scale[Math.min(scale.length - 1, Math.max(0, count - 1))];
    const freq = baseFreq * multiplier;

    this._playNote({
      frequency: freq,
      type: 'sine',
      duration: 0.08,
      gain: 0.08,
      attack: 0.003,
      decay: 0.02,
      sustain: 0.2,
      release: 0.02,
      filterFreq: 3000,
    });
  }

  /** Rising chime — correct word found */
  chime() {
    // C5 → E5 → G5 arpeggio with triangle + sine layering
    const notes = [
      { f: 523.25, d: 0 },
      { f: 659.25, d: 0.07 },
      { f: 783.99, d: 0.14 },
    ];
    notes.forEach(({ f, d }) => {
      // Main triangle tone
      this._playNote({
        frequency: f,
        type: 'triangle',
        duration: 0.4,
        gain: 0.16,
        delay: d,
        attack: 0.01,
        decay: 0.08,
        sustain: 0.5,
        release: 0.2,
      });
      // Subtle sine shimmer an octave up
      this._playNote({
        frequency: f * 2,
        type: 'sine',
        duration: 0.25,
        gain: 0.04,
        delay: d + 0.01,
        attack: 0.005,
        decay: 0.05,
        sustain: 0.3,
        release: 0.15,
      });
    });
  }

  /** Sparkle — bonus word found */
  bonus() {
    // Quick ascending two-note sparkle
    this._playNote({
      frequency: 1046.5,
      type: 'sine',
      duration: 0.15,
      gain: 0.12,
      attack: 0.005,
      decay: 0.03,
      sustain: 0.5,
      release: 0.08,
      filterFreq: 4000,
    });
    this._playNote({
      frequency: 1568,
      type: 'sine',
      duration: 0.2,
      gain: 0.10,
      delay: 0.08,
      attack: 0.005,
      decay: 0.03,
      sustain: 0.4,
      release: 0.12,
      filterFreq: 5000,
    });
    // Add a soft high harmonic
    this._playNote({
      frequency: 2093,
      type: 'sine',
      duration: 0.12,
      gain: 0.03,
      delay: 0.12,
      attack: 0.005,
      sustain: 0.2,
      release: 0.06,
    });
  }

  /** Gentle buzz — wrong word */
  error() {
    // Low filtered sawtooth for a soft "nope" feel
    this._playNote({
      frequency: 180,
      type: 'sawtooth',
      duration: 0.18,
      gain: 0.10,
      detune: -30,
      attack: 0.01,
      decay: 0.04,
      sustain: 0.5,
      release: 0.08,
      filterFreq: 800,
    });
    this._playNote({
      frequency: 160,
      type: 'sawtooth',
      duration: 0.15,
      gain: 0.06,
      detune: 20,
      delay: 0.03,
      attack: 0.01,
      sustain: 0.4,
      release: 0.06,
      filterFreq: 600,
    });
  }

  /** Celebratory fanfare — puzzle complete! */
  fanfare() {
    const melody = [
      { f: 523.25, d: 0 },      // C5
      { f: 659.25, d: 0.10 },   // E5
      { f: 783.99, d: 0.20 },   // G5
      { f: 1046.5, d: 0.32 },   // C6 (hold)
      { f: 783.99, d: 0.50 },   // G5
      { f: 1046.5, d: 0.60 },   // C6
      { f: 1318.5, d: 0.75 },   // E6 (finale)
    ];
    melody.forEach(({ f, d }) => {
      // Rich triangle base
      this._playNote({
        frequency: f,
        type: 'triangle',
        duration: 0.35,
        gain: 0.18,
        delay: d,
        attack: 0.01,
        decay: 0.06,
        sustain: 0.6,
        release: 0.18,
      });
      // Sine harmony one octave down (soft)
      this._playNote({
        frequency: f / 2,
        type: 'sine',
        duration: 0.3,
        gain: 0.06,
        delay: d + 0.005,
        attack: 0.015,
        sustain: 0.4,
        release: 0.15,
      });
    });
    // Final sustained chord: C major
    this._playChord([523.25, 659.25, 783.99, 1046.5], {
      type: 'sine',
      duration: 0.8,
      gain: 0.14,
      delay: 0.9,
      attack: 0.02,
      decay: 0.1,
      sustain: 0.5,
      release: 0.4,
    });
  }

  /** Airy whoosh — hint used */
  hint() {
    // Descending filtered sweep
    this._playNote({
      frequency: 880,
      type: 'sine',
      duration: 0.3,
      gain: 0.12,
      detune: 300,
      attack: 0.01,
      decay: 0.05,
      sustain: 0.4,
      release: 0.15,
      filterFreq: 2500,
    });
    this._playNote({
      frequency: 660,
      type: 'triangle',
      duration: 0.25,
      gain: 0.06,
      delay: 0.05,
      attack: 0.01,
      sustain: 0.3,
      release: 0.12,
    });
  }
}

export const soundManager = new SoundManager();
