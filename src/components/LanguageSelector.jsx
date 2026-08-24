// components/LanguageSelector.jsx
//
// Manual language picker — every language in the platform's language lib
// (see i18n/index.js SUPPORTED_LANGUAGES). Mirrors CurrencySelector.jsx's
// dropdown pattern for visual consistency.
//
// Uses FlagIcon (inline SVG) rather than flag emoji (🇬🇧🇫🇷🇮🇹) — Windows
// Chrome/Edge never rendered those (no native color flag glyphs on
// Windows), so the flag appeared blank/as raw text there. SVG artwork
// renders identically on every platform.
//
// Uses CountryContext's language/setLanguage (see CountryContext.jsx) —
// this was previously auto-detected from the visited domain only, with
// manual picking deliberately removed ("Language/country pickers are
// auto-detected... no longer offered as manual pickers" — see
// HeaderTest.jsx). Re-adding it as an explicit, user-facing choice that
// overrides the auto-detected default, same relationship changeCurrency
// has to the auto-detected default currency.
import React, { useState, useRef, useEffect } from "react";
import { useCountry } from "../context/CountryContext.jsx";
import { FaChevronDown } from "react-icons/fa";
import FlagIcon from "./FlagIcon.jsx";
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from "../i18n/index.js";

// Was a separately hand-maintained copy of the same 9-language list already
// exported from i18n/index.js (SUPPORTED_LANGUAGES/LANGUAGE_NAMES) — three
// independent copies of this list existed across the codebase (this file,
// client i18n, admin i18n), each one driftable out of sync with the
// others. Derive from i18n/index.js instead, same fix applied on the admin
// side (InlineTranslateFields.jsx, BlogPosts.jsx, SitePagesManagement.jsx).
const LANGUAGES = SUPPORTED_LANGUAGES.map((code) => ({
  code,
  label: LANGUAGE_NAMES[code] || code,
}));

const LanguageSelector = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { language, setLanguage } = useCountry();

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        onClick={() => setIsOpen((p) => !p)}
        aria-label="Select language"
      >
        <span className="mr-1.5"><FlagIcon code={current.code} className="w-5 h-4 rounded-sm" /></span>
        <span className="uppercase">{current.code}</span>
        <FaChevronDown
          className={`w-3 h-3 ml-2 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 md:right-0 md:left-auto z-[99999] w-44 mt-2 origin-top-left md:origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className={`group flex items-center w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 hover:text-gray-900 ${
                  language === lang.code ? "bg-green-50 text-green-900" : "text-gray-700"
                }`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <span className="mr-2.5"><FlagIcon code={lang.code} className="w-6 h-4 rounded-sm" /></span>
                <span className="font-medium flex-1">{lang.label}</span>
                {language === lang.code && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
