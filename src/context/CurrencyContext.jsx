import React, { useState, useEffect, createContext, useContext } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState('NGN');
  const [exchangeRates, setExchangeRates] = useState({
    NGN: 1,
    USD: 0.00217,
    GBP: 0.00159,
    EUR: 0.00185,
  });

  const convertPrice = (price, targetCurrency = currentCurrency) => {
    if (targetCurrency === 'NGN') return price;
    return price * exchangeRates[targetCurrency];
  };

  const formatPrice = (price, targetCurrency = currentCurrency) => {
    const convertedPrice = convertPrice(price, targetCurrency);

    if (targetCurrency === 'NGN') {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(convertedPrice);
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: targetCurrency,
    }).format(convertedPrice);
  };

  // Fetch exchange rates from API
  const fetchExchangeRates = async () => {
    try {
      const response = await fetch('/api/exchange-rates/get');
      const data = await response.json();
      if (data.success) {
        const rates = {};
        data.data.forEach((rate) => {
          rates[rate.targetCurrency] = rate.rate;
        });
        setExchangeRates(rates);
        localStorage.setItem('exchangeRates', JSON.stringify(rates));
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    }
  };

  useEffect(() => {
    // Load saved currency and rates from localStorage
    const savedCurrency = localStorage.getItem('selectedCurrency');
    const savedRates = localStorage.getItem('exchangeRates');

    if (savedCurrency) setCurrentCurrency(savedCurrency);
    if (savedRates) setExchangeRates(JSON.parse(savedRates));

    fetchExchangeRates();
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedCurrency', currentCurrency);
  }, [currentCurrency]);

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        setCurrentCurrency,
        exchangeRates,
        setExchangeRates,
        convertPrice,
        formatPrice,
        fetchExchangeRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
