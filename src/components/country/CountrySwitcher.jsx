/**
 * components/country/CountrySwitcher.jsx
 *
 * Footer / header country picker — lists all active countries and
 * redirects to their domain when selected. Preserves current path.
 */

import React, { useState, useRef, useEffect } from "react";
import { useCountry } from "../../context/CountryContext.jsx";
import { FaChevronDown, FaGlobe } from "react-icons/fa";

export default function CountrySwitcher({ className = "", compact = false }) {
  const { country, allCountries } = useCountry();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!allCountries || allCountries.length < 2) return null;

  const handleSelect = (target) => {
    if (target.code === country.code) { setOpen(false); return; }
    const path = window.location.pathname + window.location.search;
    window.location.href = `https://${target.domain}${path}`;
  };

  return (
    <div className={`relative inline-block ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium
                   text-gray-700 bg-white border border-gray-200 rounded-lg
                   hover:bg-gray-50 transition-colors duration-150 focus:outline-none
                   focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
      >
        <FaGlobe className="w-3.5 h-3.5 text-gray-400" />
        <span role="img" aria-label={country.name}>{country.flagEmoji}</span>
        {!compact && <span>{country.name}</span>}
        <FaChevronDown
          className={`w-3 h-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="absolute right-0 mt-1.5 w-52 bg-white border border-gray-100
                       rounded-xl shadow-lg z-[9999] overflow-hidden">
          {allCountries.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                onClick={() => handleSelect(c)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left
                           hover:bg-amber-50 transition-colors duration-100
                           ${c.code === country.code
                             ? "bg-amber-50 font-semibold text-amber-800"
                             : "text-gray-700"}`}
              >
                <span role="img" aria-label={c.name}>{c.flagEmoji}</span>
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-gray-400">
                    {c.currency.symbol} {c.currency.code}
                  </div>
                </div>
                {c.code === country.code && (
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
