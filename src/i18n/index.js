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
import es from "./locales/es.js";
import pt from "./locales/pt.js";
import nl from "./locales/nl.js";
import ar from "./locales/ar.js";
import hi from "./locales/hi.js";
import zh from "./locales/zh.js";

const LOCALES = { en, fr, it, es, pt, nl, ar, hi, zh };
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

// ── DB overrides overlay ────────────────────────────────────────────────
//
// Same mechanism as admin/src/i18n/index.js — EFFECTIVE starts as a clone
// of the bundled static MERGED locales (always available synchronously,
// works offline) and is overlaid with whatever
// GET /api/ui-translations/merged?app=client&language=<lang> returns, via
// applyDbOverrides() below. Populated by scripts/seedUiTranslations.js and
// edited live from the admin's UiTranslationsManagement.jsx (a single CRUD
// page manages both apps' copy — see server PRD §8a).
const EFFECTIVE = Object.fromEntries(
  Object.entries(MERGED).map(([code, locale]) => [code, locale]),
);

let revision = 0;
const revisionListeners = new Set();

function notifyRevision() {
  revision += 1;
  revisionListeners.forEach((cb) => {
    try {
      cb(revision);
    } catch {
      /* a listener throwing shouldn't break the others */
    }
  });
}

/** Subscribe to "the effective locale for some language changed". Returns
 * an unsubscribe fn. Consumed by CountryContext.jsx to force `t()` output
 * to re-render once DB overrides for the active language arrive. */
export function subscribeI18nRevision(cb) {
  revisionListeners.add(cb);
  return () => revisionListeners.delete(cb);
}

function setPath(target, keyPath, value) {
  const parts = keyPath.split(".");
  let node = target;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!node[parts[i]] || typeof node[parts[i]] !== "object") node[parts[i]] = {};
    node = node[parts[i]];
  }
  node[parts[parts.length - 1]] = value;
}

/** Apply a flat { "cart.checkout": "Passer commande", ... } map on top of
 * the bundled locale for `lang`. Always rebuilt fresh from the static
 * MERGED[lang] base rather than patched incrementally, so a key removed
 * from the DB (reverted) falls back to the bundled value. */
export function applyDbOverrides(lang, flatOverrides) {
  if (!MERGED[lang] && lang !== "en") return;
  const base = MERGED[lang] || MERGED.en;
  const clone = JSON.parse(JSON.stringify(base));
  for (const [key, value] of Object.entries(flatOverrides || {})) {
    if (value) setPath(clone, key, value);
  }
  EFFECTIVE[lang] = clone;
  notifyRevision();
}

/** Fetches DB overrides for one language and applies them. Failures are
 * swallowed — a network hiccup just means "keep showing the bundled
 * static strings" rather than breaking the storefront. */
export async function loadUiTranslationOverrides(lang, apiBase) {
  try {
    const base = apiBase || import.meta.env.VITE_APP_API_URL || "http://localhost:8080/api";
    const res = await fetch(`${base}/ui-translations/merged?app=client&language=${encodeURIComponent(lang)}`);
    const json = await res.json();
    if (json?.success) applyDbOverrides(lang, json.data || {});
  } catch (e) {
    console.warn(`[i18n] Failed to load DB overrides for '${lang}' — using bundled strings.`, e);
  }
}

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
export const SUPPORTED_LANGUAGES = ["en", "fr", "it", "es", "pt", "nl", "ar", "hi", "zh"];

/** Language display names for the UI switcher (native names, so a French
 * speaker sees "Français" regardless of their current UI language). */
export const LANGUAGE_NAMES = {
  en: "English",
  fr: "Français",
  it: "Italiano",
  es: "Español",
  pt: "Português",
  nl: "Nederlands",
  ar: "العربية",
  hi: "हिन्दी",
  zh: "中文",
};

/** Languages written right-to-left — the UI flips document direction for
 * these (see CountryContext.jsx's setLanguage). */
export const RTL_LANGUAGES = ["ar"];

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
  const locale = EFFECTIVE[lang] || EFFECTIVE.en;
  const result = resolve(locale, key, params);

  if (result !== null) return result;

  // Fallback to English
  if (lang !== "en") {
    const enResult = resolve(EFFECTIVE.en, key, params);
    if (enResult !== null) return enResult;
  }

  // Last resort: return the key itself so the UI doesn't blank out
  console.warn(`[i18n] Missing translation: ${key} (lang: ${lang})`);
  return key;
}

export default MERGED;
