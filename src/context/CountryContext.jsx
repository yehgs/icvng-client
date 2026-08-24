/**
 * context/CountryContext.jsx
 *
 * The single context that drives all multi-country behaviour on the client:
 *   - Country config (fetched from GET /api/country/config on startup)
 *   - Active language + translation function t()
 *   - Currency formatting (uses the country's native currency as default)
 *   - Country redirect detection
 *
 * Wrap the app once in CountryProvider. Everywhere else use useCountry().
 *
 * Usage:
 *   const { t, language, setLanguage, country, formatPrice } = useCountry();
 *   t('product.addToCart')  →  "Ajouter au panier"  (when lang = "fr")
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import Axios from "../utils/Axios.js";
import {
  translate,
  detectLanguage,
  saveLanguage,
  SUPPORTED_LANGUAGES,
  LANGUAGE_NAMES,
  RTL_LANGUAGES,
  loadUiTranslationOverrides,
  subscribeI18nRevision,
} from "../i18n/index.js";

// ── Default country config (mirrors server config/countries/index.js for NG) ─
const DEFAULT_COUNTRY_CONFIG = {
  code: "NG",
  name: "Nigeria",
  domain: "i-coffee.ng",
  currency: { code: "NGN", symbol: "₦", name: "Nigerian Naira", decimals: 2 },
  language: { default: "en", supported: ["en"], locale: "en-NG" },
  timezone: "Africa/Lagos",
  phonePrefix: "+234",
  flagEmoji: "🇳🇬",
  seo: { siteName: "I-Coffee Nigeria", tld: ".ng" },
  payment: {
    availableProviders: ["stripe", "paystack"],
    currency: "NGN",
    stripePublicKey: null,
    paystackPublicKey: null,
  },
};

// ── Context ───────────────────────────────────────────────────────────────────
const CountryContext = createContext(null);

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error("useCountry must be used within CountryProvider");
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function CountryProvider({ children }) {
  const [country, setCountry] = useState(DEFAULT_COUNTRY_CONFIG);
  const [allCountries, setAllCountries] = useState([]);
  const [language, setLanguageState] = useState("en");
  const [loading, setLoading] = useState(true);
  // Country-scoped Direct Bank Transfer availability — true only if
  // IT/DIRECTOR have configured an active receiving account for THIS
  // country (see bankTransferSettings.controller.js#getAvailablePaymentMethods
  // on the server). Defaults to false (Stripe-only) until this resolves,
  // matching "if the country bank transfer is not set, payment option
  // will only be Stripe by default".
  const [hasBankTransfer, setHasBankTransfer] = useState(false);
  const [bankTransferDetails, setBankTransferDetails] = useState(null);

  // ── Bootstrap: fetch country config from server ───────────────────────────
  useEffect(() => {
    async function bootstrap() {
      try {
        const res = await Axios({ url: "/api/country/config", method: "get" });
        if (res.data?.success) {
          const cfg = res.data.data;
          setCountry(cfg);

          // Detect language: saved pref → country default → browser
          const lang = detectLanguage(cfg.language?.default || "en");
          setLanguageState(lang);
          // Persist immediately (even when merely detected, not chosen) so
          // every subsequent request's X-Language header — and therefore
          // server-side localization (category names, country content) —
          // is consistent with what's rendered on this first load.
          saveLanguage(lang);

          // Set <html lang="…"> for SEO, and flip text direction for RTL
          // languages (Arabic) so the whole page mirrors correctly instead
          // of just individual translated strings sitting backwards.
          document.documentElement.lang = lang;
          document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? "rtl" : "ltr";
        }
      } catch (err) {
        console.warn("[CountryProvider] Could not load country config:", err.message);
        // Keep defaults — app still works
      } finally {
        setLoading(false);
      }

      // Fetch all countries for switcher (non-critical)
      try {
        const res = await Axios({ url: "/api/country/all", method: "get" });
        if (res.data?.success) setAllCountries(res.data.data);
      } catch {}

      // Fetch this country's payment-method availability (non-critical —
      // defaults stay Stripe-only/hasBankTransfer:false on failure, which
      // is the safe fallback).
      try {
        const payRes = await Axios({
          url: "/api/bank-transfer-settings/available",
          method: "get",
        });
        if (payRes.data?.success) {
          setHasBankTransfer(!!payRes.data.data?.bankTransfer);
          setBankTransferDetails(payRes.data.data?.bankTransferDetails || null);
        }
      } catch (err) {
        console.warn("[CountryProvider] Could not load payment-method availability:", err.message);
      }
    }

    bootstrap();
  }, []);

  // ── Language setter ───────────────────────────────────────────────────────
  // Reloads the page after persisting the choice — deliberately, not an
  // oversight. Static UI text (t()-based labels) would update instantly via
  // React re-render on its own, but product names, category names, CMS
  // content, and anything else fetched from the server only get localized
  // when the request is MADE (via the X-Language header — see utils/Axios.js)
  // — already-fetched data doesn't retroactively re-translate itself just
  // because `language` state changed. A reload re-fetches everything under
  // the new language in one consistent pass, the same way visiting a
  // different country's domain always has (a full navigation) — "switch all
  // language on all site... just like the domain thing but independent of
  // currency switch" was the explicit ask this satisfies. Currency
  // (changeCurrency in GlobalProvider) intentionally does NOT reload — prices
  // convert client-side from data already in memory, so there's nothing
  // stale to re-fetch.
  const setLanguage = useCallback((lang) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    if (lang === language) return; // already active — no-op, don't reload for nothing
    saveLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? "rtl" : "ltr";
    window.location.reload();
  }, [language]);

  // ── Translation function ──────────────────────────────────────────────────
  // DB-backed UI-copy overrides (see i18n/index.js's applyDbOverrides /
  // EFFECTIVE) — fetched once `language` is known. setLanguage() above
  // always does a full page reload on an actual language change, so
  // (unlike the admin panel, which switches in-place) this only needs to
  // fire when `language` is first set on this page load, not on every
  // subsequent change. `i18nRevision` is bumped once the fetch resolves,
  // which is what makes `t` re-render already-rendered strings with the
  // override applied.
  const [i18nRevision, setI18nRevision] = useState(0);
  useEffect(() => {
    if (!language) return;
    loadUiTranslationOverrides(language);
  }, [language]);
  useEffect(() => subscribeI18nRevision(setI18nRevision), []);

  const t = useCallback(
    (key, params) => translate(language, key, params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language, i18nRevision]
  );

  // ── Currency formatting ───────────────────────────────────────────────────
  // Uses the country's native currency; formatPrice respects the locale.
  const formatPrice = useCallback(
    (amount, currencyOverride) => {
      const currency = currencyOverride || country.currency?.code || "NGN";
      const locale = country.language?.locale || "en-NG";
      const decimals = country.currency?.decimals ?? 2;
      try {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(amount ?? 0);
      } catch {
        return `${country.currency?.symbol || ""}${(amount ?? 0).toFixed(decimals)}`;
      }
    },
    [country]
  );

  // ── Payment helpers ───────────────────────────────────────────────────────
  const hasPaystack = useMemo(
    () => country.payment?.availableProviders?.includes("paystack") ?? false,
    [country]
  );
  const hasStripe = useMemo(
    () => country.payment?.availableProviders?.includes("stripe") ?? true,
    [country]
  );

  // ── Context value ─────────────────────────────────────────────────────────
  const value = useMemo(
    () => ({
      // Country
      country,
      allCountries,
      countryCode: country.code,
      // Language
      language,
      setLanguage,
      supportedLanguages: SUPPORTED_LANGUAGES,
      languageNames: LANGUAGE_NAMES,
      supportedCountryLanguages: country.language?.supported || ["en"],
      // Translation
      t,
      // Currency
      currency: country.currency,
      formatPrice,
      // Payment
      hasPaystack,
      hasStripe,
      hasBankTransfer,
      bankTransferDetails,
      paymentProviders: country.payment?.availableProviders || ["stripe"],
      stripePublicKey: country.payment?.stripePublicKey,
      paystackPublicKey: country.payment?.paystackPublicKey,
      // Meta
      loading,
    }),
    [
      country, allCountries, language, setLanguage, t,
      formatPrice, hasPaystack, hasStripe, hasBankTransfer, bankTransferDetails, loading,
    ]
  );

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
}

export default CountryContext;
