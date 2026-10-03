/**
 * Internationalization (i18n) System.
 * Ensures every user-facing string comes from externalized JSON data.
 */
class I18nSystem {
  constructor() {
    this.currentLang = 'en';
    this.strings = {};
    this.isLoaded = false;
  }

  async init(lang = 'en') {
    this.currentLang = lang;
    try {
      const res = await fetch(`js/data/strings.${lang}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.strings = await res.json();
      this.isLoaded = true;
    } catch (err) {
      console.warn(`Failed to fetch strings for ${lang}, loading defaults:`, err);
      // In offline node environments or fallback
      this.strings = {};
    }
  }

  setStrings(strings) {
    this.strings = strings;
    this.isLoaded = true;
  }

  t(key, params = {}) {
    if (!key) return '';
    const parts = key.split('.');
    let curr = this.strings;
    for (const p of parts) {
      if (curr == null || typeof curr !== 'object') {
        return key;
      }
      curr = curr[p];
    }

    if (typeof curr !== 'string') return key;

    // Interpolate {param} tokens
    return curr.replace(/{(\w+)}/g, (match, p) => {
      return params[p] !== undefined ? params[p] : match;
    });
  }
}

export const i18n = new I18nSystem();
