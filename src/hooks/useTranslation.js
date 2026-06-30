/**
 * hooks/useTranslation.js
 *
 * Convenience hook so components don't need to import useCountry just for t().
 *
 * Usage:
 *   const { t } = useTranslation();
 *   t('product.addToCart')          → "Add to cart"  (en)
 *   t('product.lowStock', { count: 2 }) → "Only 2 left"
 *
 * Also exposes `language` and `setLanguage` for components that need them.
 */

import { useCountry } from "../context/CountryContext.jsx";

export function useTranslation() {
  const { t, language, setLanguage, supportedCountryLanguages, languageNames } = useCountry();
  return { t, language, setLanguage, supportedCountryLanguages, languageNames };
}

export default useTranslation;
