/**
 * i18n/index.js
 *
 * Lightweight i18n engine — no external dependencies.
 *
 * Features:
 *   - Deep-merge locale over English base (partial translations work)
 *   - Template interpolation: t('product.lowStock', { count: 3 }) → "Only 3 left"
 *   - Basic pluralization: keys ending in _plural used when count != 1
 *   - Falls back to English for any missing key
 *   - Persists selected language to localStorage
 */

import en from "./locales/en.js";
import fr from "./locales/fr.js";
import it from "./locales/it.js";

const LOCALES = { en, fr, it };
const LS_KEY = "icvng_language";

// ── Deep merge ────────────────────────────────────────────────────────────────
function deepMerge(base, override) {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      override[key] &&
      typeof override[key] === "object" &&
      !Array.isArray(override[key])
    ) {
      result[key] = deepMerge(base[key] || {}, override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

// Build merged locale objects (each extends English)
const MERGED = Object.fromEntries(
  Object.entries(LOCALES).map(([code, locale]) => [
    code,
    code === "en" ? locale : deepMerge(en, locale),
  ])
);

// ── String interpolation ──────────────────────────────────────────────────────
function interpolate(str, params = {}) {
  if (!params || Object.keys(params).length === 0) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    params[key] !== undefined ? String(params[key]) : `{{${key}}}`
  );
}

// ── Key resolver ──────────────────────────────────────────────────────────────
function resolve(locale, keyPath, params) {
  const parts = keyPath.split(".");
  let node = locale;

  // Pluralization: if count param given, try _plural variant first
  const lastKey = parts[parts.length - 1];
  if (params?.count !== undefined && params.count !== 1) {
    const pluralKey = [...parts.slice(0, -1), lastKey + "_plural"].join(".");
    const pluralNode = resolve(locale, pluralKey, null);
    if (pluralNode && pluralNode !== pluralKey) {
      return interpolate(pluralNode, params);
    }
  }

  for (const part of parts) {
    if (node && typeof node === "object" && part in node) {
      node = node[part];
    } else {
      return null; // key not found
    }
  }

  if (typeof node !== "string") return null;
  return interpolate(node, params);
}

// ── Public API ────────────────────────────────────────────────────────────────

/** All supported language codes */
export const SUPPORTED_LANGUAGES = ["en", "fr", "it"];

/** Language display names for the UI switcher */
export const LANGUAGE_NAMES = {
  en: "English",
  fr: "Français",
  it: "Italiano",
};

/**
 * Detect best language from:
 *   1. localStorage saved preference
 *   2. countryCode default (passed from country config)
 *   3. browser Accept-Language
 *   4. fallback: "en"
 */
export function detectLanguage(countryDefaultLang = "en") {
  const saved = localStorage.getItem(LS_KEY);
  if (saved && SUPPORTED_LANGUAGES.includes(saved)) return saved;
  if (SUPPORTED_LANGUAGES.includes(countryDefaultLang)) return countryDefaultLang;

  // Browser language
  const browserLang = (navigator.language || "en").split("-")[0].toLowerCase();
  if (SUPPORTED_LANGUAGES.includes(browserLang)) return browserLang;

  return "en";
}

/** Persist language choice */
export function saveLanguage(lang) {
  if (SUPPORTED_LANGUAGES.includes(lang)) {
    localStorage.setItem(LS_KEY, lang);
  }
}

/**
 * Translate a dot-notation key.
 *
 * @param {string} lang    Active language code e.g. "fr"
 * @param {string} key     Dot-notation key e.g. "product.addToCart"
 * @param {object} [params] Interpolation values e.g. { count: 3 }
 * @returns {string}
 */
export function translate(lang, key, params) {
  const locale = MERGED[lang] || MERGED.en;
  const result = resolve(locale, key, params);

  if (result !== null) return result;

  // Fallback to English
  if (lang !== "en") {
    const enResult = resolve(MERGED.en, key, params);
    if (enResult !== null) return enResult;
  }

  // Last resort: return the key itself so the UI doesn't blank out
  console.warn(`[i18n] Missing translation: ${key} (lang: ${lang})`);
  return key;
}

export default MERGED;
