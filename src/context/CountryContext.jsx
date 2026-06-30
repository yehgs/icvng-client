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

          // Set <html lang="…"> for SEO
          document.documentElement.lang = lang;
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
    }

    bootstrap();
  }, []);

  // ── Language setter ───────────────────────────────────────────────────────
  const setLanguage = useCallback((lang) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    setLanguageState(lang);
    saveLanguage(lang);
    document.documentElement.lang = lang;
  }, []);

  // ── Translation function ──────────────────────────────────────────────────
  const t = useCallback(
    (key, params) => translate(language, key, params),
    [language]
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
      paymentProviders: country.payment?.availableProviders || ["stripe"],
      stripePublicKey: country.payment?.stripePublicKey,
      paystackPublicKey: country.payment?.paystackPublicKey,
      // Meta
      loading,
    }),
    [
      country, allCountries, language, setLanguage, t,
      formatPrice, hasPaystack, hasStripe, loading,
    ]
  );

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
}

export default CountryContext;
