// Updated utility to handle multiple currencies
export const DisplayPriceInCurrency = (price, currency = 'NGN') => {
  const currencyConfig = {
    NGN: { locale: 'en-NG', currency: 'NGN' },
    USD: { locale: 'en-US', currency: 'USD' },
    EUR: { locale: 'en-DE', currency: 'EUR' },
    GBP: { locale: 'en-GB', currency: 'GBP' },
  };

  const config = currencyConfig[currency] || currencyConfig['NGN'];

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: currency === 'NGN' ? 0 : 2,
  }).format(price);
};

// Keep the original function for backward compatibility
export const DisplayPriceInNaira = (price) => {
  return DisplayPriceInCurrency(price, 'NGN');
};

// Helper function to get currency symbol
export const getCurrencySymbol = (currency) => {
  const symbols = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  return symbols[currency] || '₦';
};

// Helper function to format price with custom options
export const formatPrice = (price, currency = 'NGN', options = {}) => {
  const defaultOptions = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'NGN' ? 0 : 2,
    maximumFractionDigits: currency === 'NGN' ? 0 : 2,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  const locale =
    {
      NGN: 'en-NG',
      USD: 'en-US',
      EUR: 'en-DE',
      GBP: 'en-GB',
    }[currency] || 'en-NG';

  return new Intl.NumberFormat(locale, mergedOptions).format(price);
};

// Helper function to parse price from formatted string
export const parseFormattedPrice = (formattedPrice) => {
  // Remove currency symbols and spaces, then parse
  const cleaned = formattedPrice.replace(/[₦$€£,\s]/g, '');
  return parseFloat(cleaned) || 0;
};

// Helper function to convert between currencies (basic conversion)
export const convertCurrency = (
  amount,
  fromCurrency,
  toCurrency,
  exchangeRates
) => {
  if (fromCurrency === toCurrency) return amount;

  // Convert to base currency (NGN) first, then to target currency
  let amountInNGN = amount;
  if (fromCurrency !== 'NGN') {
    const fromRate = exchangeRates[fromCurrency];
    if (fromRate) {
      amountInNGN = amount / fromRate;
    }
  }

  // Convert from NGN to target currency
  if (toCurrency === 'NGN') {
    return amountInNGN;
  }

  const toRate = exchangeRates[toCurrency];
  if (toRate) {
    return amountInNGN * toRate;
  }

  return amount; // Return original if no rate found
};

// Helper function to get price with discount
export const getPriceWithDiscount = (originalPrice, discountPercentage = 0) => {
  if (discountPercentage <= 0) return originalPrice;
  const discountAmount = (originalPrice * discountPercentage) / 100;
  return originalPrice - discountAmount;
};

// Helper function to calculate savings
export const calculateSavings = (originalPrice, discountedPrice) => {
  return Math.max(0, originalPrice - discountedPrice);
};

// Helper function to calculate discount percentage
export const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

// Helper function to format currency for different contexts
export const formatCurrencyForContext = (
  price,
  currency,
  context = 'default'
) => {
  const contexts = {
    compact: {
      notation: 'compact',
      compactDisplay: 'short',
    },
    accounting: {
      currencySign: 'accounting',
    },
    plain: {
      style: 'decimal',
    },
  };

  const contextOptions = contexts[context] || {};
  return formatPrice(price, currency, contextOptions);
};
