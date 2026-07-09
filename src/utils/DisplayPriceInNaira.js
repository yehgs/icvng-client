// utils/DisplayPriceInNaira.js
//
// PHASE 6: this historically formatted everything in Naira, which broke
// multi-country storefronts (a Togo visitor saw ₦ prices). It's kept as a
// backward-compatible shim so the 10 existing call sites don't each need
// rewriting, but it now formats in the visitor's ACTIVE currency, converting
// from the NGN base using the persisted exchange rates.
//
// Prefer useCurrency().formatPrice(...) in new/refactored components; this shim
// exists only to make the legacy call sites country-aware without a mass edit.

import { DisplayPriceInCurrency } from './DisplayPriceInCurrency';

// The CurrencyContext persists these to localStorage; we read them so this
// pure function reflects the visitor's active currency + live rates.
//
// 'icvng_active_currency' is kept in sync with WHATEVER currency is
// currently showing (the country's default, or an explicit pick via the
// selector). 'selectedCurrency' is kept as a fallback for older sessions
// that only ever wrote that key.
function activeCurrency() {
  try {
    return (
      localStorage.getItem('icvng_active_currency') ||
      localStorage.getItem('selectedCurrency') ||
      'NGN'
    );
  } catch {
    return 'NGN';
  }
}

function exchangeRateFor(currency) {
  if (currency === 'NGN') return 1;
  try {
    const raw = localStorage.getItem('exchangeRates');
    if (!raw) return 1;
    const rates = JSON.parse(raw);
    const r = rates?.[currency];
    return typeof r === 'number' && r > 0 ? r : 1;
  } catch {
    return 1;
  }
}

/**
 * Format a NGN-base price in the visitor's active currency.
 * @param {number} priceInNaira  amount in the NGN base
 * @returns {string}
 */
export const DisplayPriceInNaira = (priceInNaira) => {
  const currency = activeCurrency();
  const converted = (priceInNaira || 0) * exchangeRateFor(currency);
  return DisplayPriceInCurrency(converted, currency);
};

export default DisplayPriceInNaira;
