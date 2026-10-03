/**
 * Pentatonic WebAudio Synthesizer.
 * Generates soft bell, marimba, and celestial tones with zero network dependencies.
 */
import { storage } from './storage.js';

class AudioSystem {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.limiter = null;
    this.isMuted = !storage.get('profile.soundEnabled', true);
    this.isUnlocked = false;

    // Pentatonic scale note frequencies (Hz)
    this.noteMap = {
      'G3': 196.00,
      'C4': 261.63,
      'D4': 293.66,
      'E4': 329.63,
      'G4': 392.00,
      'A4': 440.00,
      'C5': 523.25,
      'D5': 587.33,
      'E5': 659.25,
      'G5': 783.99
    };
  }

  init() {
    if (this.ctx) return;
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();

    // Dynamics compressor acting as safety limiter
    this.limiter = this.ctx.createDynamicsCompressor();
    this.limiter.threshold.setValueAtTime(-6, this.ctx.currentTime);
    this.limiter.knee.setValueAtTime(3, this.ctx.currentTime);
    this.limiter.ratio.setValueAtTime(20, this.ctx.currentTime);
    this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.limiter.release.setValueAtTime(0.1, this.ctx.currentTime);

    // Master gain capped at 0.35 for children's ears
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);

    this.limiter.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  unlock() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.isUnlocked = true;
      });
    } else {
      this.isUnlocked = true;
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    storage.set('profile.soundEnabled', !muted);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  suspend() {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Plays a celestial bell/marimba tone with warm harmonic overtones.
   */
  playTone(freqOrNote, duration = 0.25, type = 'sine') {
    if (this.isMuted || !this.ctx) return;
    const freq = typeof freqOrNote === 'string' ? (this.noteMap[freqOrNote] || 440) : freqOrNote;
    const t0 = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);

    // Soft envelope: fast attack (10ms) and natural exponential decay
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.5, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(gain);
    gain.connect(this.limiter);

    osc.start(t0);
    osc.stop(t0 + duration);
  }

  /**
   * Planet distinct note.
   */
  playPlanetNote(noteOrFreq) {
    this.playTone(noteOrFreq, 0.35, 'triangle');
  }

  /**
   * Tier 1 micro reward: crisp scale pop (<= 150ms).
   */
  playPop() {
    if (this.isMuted || !this.ctx) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t0);
    osc.frequency.exponentialRampToValueAtTime(880, t0 + 0.08);

    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.linearRampToValueAtTime(0.35, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);

    osc.connect(gain);
    gain.connect(this.limiter);
    osc.start(t0);
    osc.stop(t0 + 0.13);
  }

  /**
   * Gentle "boop" for mistakes (no buzzers, informative & soft).
   */
  playBoop() {
    if (this.isMuted || !this.ctx) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t0);
    osc.frequency.exponentialRampToValueAtTime(210, t0 + 0.15);

    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.linearRampToValueAtTime(0.3, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);

    osc.connect(gain);
    gain.connect(this.limiter);
    osc.start(t0);
    osc.stop(t0 + 0.22);
  }

  /**
   * Tier 2 round reward: cheerful 3-note ascending arpeggio (<= 1.5s).
   */
  playRoundCheer() {
    if (this.isMuted || !this.ctx) return;
    const notes = [392.00, 523.25, 659.25]; // G4, C5, E5
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.35, 'triangle'), i * 160);
    });
  }

  /**
   * Tier 3 milestone reward: full pentatonic flourish.
   */
  playMilestone() {
    if (this.isMuted || !this.ctx) return;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.45, 'triangle'), i * 130);
    });
  }
}

export const audio = new AudioSystem();
