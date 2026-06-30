/**
 * components/country/LanguageSwitcher.jsx
 *
 * Renders a dropdown of languages supported by the current country.
 * Active language is highlighted. Selection persists to localStorage.
 *
 * Props:
 *   className?  – extra CSS classes on the wrapper
 *   compact?    – if true, shows only the flag/code without the full name
 */

import React, { useState, useRef, useEffect } from "react";
import { useCountry } from "../../context/CountryContext.jsx";
import { FaChevronDown } from "react-icons/fa";

// Language flag emoji map
const LANG_FLAGS = {
  en: "🇬🇧",
  fr: "🇫🇷",
  it: "🇮🇹",
};

export default function LanguageSwitcher({ className = "", compact = false }) {
  const { language, setLanguage, supportedCountryLanguages, languageNames } = useCountry();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Only show if there are multiple supported languages
  if (!supportedCountryLanguages || supportedCountryLanguages.length < 2) return null;

  const select = (lang) => {
    setLanguage(lang);
    setOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={ref}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium
                   text-gray-700 bg-white border border-gray-200 rounded-lg
                   hover:bg-gray-50 transition-colors duration-150 focus:outline-none
                   focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span role="img" aria-label={language}>{LANG_FLAGS[language] || "🌐"}</span>
        {!compact && (
          <span>{languageNames[language] || language.toUpperCase()}</span>
        )}
        {compact && <span className="uppercase text-xs">{language}</span>}
        <FaChevronDown
          className={`w-3 h-3 text-gray-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-100
                     rounded-xl shadow-lg z-[9999] overflow-hidden"
        >
          {supportedCountryLanguages.map((lang) => (
            <li key={lang} role="option" aria-selected={lang === language}>
              <button
                type="button"
                onClick={() => select(lang)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left
                           hover:bg-amber-50 transition-colors duration-100
                           ${lang === language
                             ? "bg-amber-50 font-semibold text-amber-800"
                             : "text-gray-700"
                           }`}
              >
                <span role="img" aria-label={lang}>{LANG_FLAGS[lang] || "🌐"}</span>
                <span>{languageNames[lang] || lang.toUpperCase()}</span>
                {lang === language && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-600" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
