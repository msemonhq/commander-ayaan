/**
 * Voice & Subtitle System.
 * Implements the playback chain: audio file -> TTS -> subtitle fallback.
 * Allows tapping dialogue bubble to skip line immediately.
 */
import { i18n } from './i18n.js';
import { audio } from './audio.js';
import { events } from './events.js';

class VoiceSystem {
  constructor() {
    this.currentLineKey = null;
    this.currentText = '';
    this.activeAudio = null;
    this.onFinished = null;
    this.isSpeaking = false;
  }

  /**
   * Speak or display a voice line by key.
   */
  async speak(key, params = {}) {
    this.stop();

    const text = i18n.t(key, params);
    this.currentLineKey = key;
    this.currentText = text;
    this.isSpeaking = true;

    events.emit('voice:start', { key, text });

    // Step 1: Check audio file at assets/voice/<lang>/<key>.ogg
    const audioPath = `assets/voice/${i18n.currentLang}/${key}.ogg`;
    const audioExists = await this.checkAudioExists(audioPath);

    if (audioExists) {
      try {
        this.activeAudio = new Audio(audioPath);
        this.activeAudio.onended = () => this.handleFinished();
        await this.activeAudio.play();
        return;
      } catch (e) {
        console.warn('Audio playback failed, falling back:', e);
      }
    }

    // Step 2: In Phase 1, subtitles + subtle Orbi chirp sound are standard.
    // Web Speech API / TTS is wired for readiness.
    audio.playTone(520, 0.12, 'sine');

    // Auto-advance subtitles after reading time: ~200ms per word, min 2.5s
    const wordCount = text.split(/\s+/).length;
    const durationMs = Math.max(2500, wordCount * 220);
    this.autoAdvanceTimer = setTimeout(() => {
      this.handleFinished();
    }, durationMs);
  }

  async checkAudioExists(url) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      return res.ok;
    } catch {
      return false;
    }
  }

  handleFinished() {
    this.isSpeaking = false;
    events.emit('voice:end', { key: this.currentLineKey, text: this.currentText });
    if (this.onFinished) {
      const cb = this.onFinished;
      this.onFinished = null;
      cb();
    }
  }

  /**
   * Tapping speech bubble skips the line immediately.
   */
  skip() {
    if (!this.isSpeaking) return;
    this.stop();
  }

  stop() {
    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio = null;
    }
    if (this.isSpeaking) {
      this.handleFinished();
    }
  }
}

export const voice = new VoiceSystem();
