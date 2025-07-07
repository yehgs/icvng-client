import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../provider/GlobalProvider';
import { FaChevronDown, FaGlobe } from 'react-icons/fa';

const CurrencySelector = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const {
    selectedCurrency,
    availableCurrencies,
    changeCurrency,
    currencyLoading,
  } = useCurrency();

  const selectedCurrencyData = availableCurrencies.find(
    (currency) => currency.code === selectedCurrency
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCurrencyChange = (currencyCode) => {
    changeCurrency(currencyCode);
    setIsOpen(false);
  };

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        onClick={() => setIsOpen(!isOpen)}
        disabled={currencyLoading}
      >
        <FaGlobe className="w-4 h-4 mr-2 text-gray-500" />

        {currencyLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-green-700 mr-2"></div>
        ) : (
          <>
            <span className="font-semibold">
              {selectedCurrencyData?.symbol}
            </span>
            <span className="ml-1">{selectedCurrencyData?.code}</span>
          </>
        )}

        <FaChevronDown
          className={`w-3 h-3 ml-2 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-64 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {availableCurrencies.map((currency) => (
              <button
                key={currency.code}
                className={`group flex items-center w-full px-4 py-3 text-sm text-left hover:bg-gray-50 hover:text-gray-900 ${
                  selectedCurrency === currency.code
                    ? 'bg-green-50 text-green-900'
                    : 'text-gray-700'
                }`}
                onClick={() => handleCurrencyChange(currency.code)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <span className="font-semibold mr-2 text-lg">
                      {currency.symbol}
                    </span>
                    <div>
                      <div className="font-medium">{currency.code}</div>
                      <div className="text-xs text-gray-500">
                        {currency.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    {currency.isBase && (
                      <span className="text-xs text-green-600 font-medium">
                        Base Currency
                      </span>
                    )}
                    {selectedCurrency === currency.code && (
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="py-2 px-4 bg-gray-50">
            <p className="text-xs text-gray-600">
              {/* Prices are converted using current exchange rates. */}
              {selectedCurrency !== 'NGN' && (
                <span className="block mt-1">
                  International payments processed via Stripe.
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
