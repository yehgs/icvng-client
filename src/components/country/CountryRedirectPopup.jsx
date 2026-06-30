/**
 * components/country/CountryRedirectPopup.jsx
 *
 * Shown once per session when the server's /api/country/detect endpoint
 * suggests the user might prefer a different country domain.
 *
 * Behaviour:
 *   - Dismissed (user clicks "Stay here") → suppressed for 30 days via localStorage
 *   - Accepted → redirect to correct domain, preserving current path + query
 *   - Never shown again on the target domain after redirect
 */

import React, { useEffect, useState } from "react";
import Axios from "../../utils/Axios.js";
import { useCountry } from "../../context/CountryContext.jsx";

const DISMISS_KEY = "icvng_country_redirect_dismissed";
const DISMISS_DAYS = 30;

function isDismissed() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const { until } = JSON.parse(raw);
    return Date.now() < until;
  } catch {
    return false;
  }
}

function dismiss() {
  try {
    localStorage.setItem(
      DISMISS_KEY,
      JSON.stringify({ until: Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000 })
    );
  } catch {}
}

export default function CountryRedirectPopup() {
  const { country, t } = useCountry();
  const [suggestion, setSuggestion] = useState(null); // { code, name, domain, flagEmoji }
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed
    if (isDismissed()) return;

    async function detect() {
      try {
        const res = await Axios({ url: "/api/country/detect", method: "get" });
        if (!res.data?.success) return;

        const detected = res.data.data?.detectedCountry;
        if (!detected) return;

        // Only suggest if detected country differs from current domain country
        if (detected.code !== country.code) {
          setSuggestion(detected);
          setVisible(true);
        }
      } catch {
        // Non-critical — silently skip
      }
    }

    // Slight delay so the page renders first
    const timer = setTimeout(detect, 1500);
    return () => clearTimeout(timer);
  }, [country.code]);

  if (!visible || !suggestion) return null;

  const handleAccept = () => {
    dismiss();
    setVisible(false);

    // Preserve current path on the new domain
    const path = window.location.pathname + window.location.search;
    const targetUrl = `https://${suggestion.domain}${path}`;
    window.location.href = targetUrl;
  };

  const handleDecline = () => {
    dismiss();
    setVisible(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[9998] backdrop-blur-sm"
        onClick={handleDecline}
      />

      {/* Popup */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[90vw] max-w-md
                   bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden
                   animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-label="Country suggestion"
      >
        {/* Coloured top bar */}
        <div className="h-1 bg-gradient-to-r from-amber-700 to-amber-500" />

        <div className="p-6">
          {/* Flag + title */}
          <div className="flex items-start gap-3 mb-4">
            <span className="text-4xl leading-none" role="img" aria-label={suggestion.name}>
              {suggestion.flagEmoji}
            </span>
            <div>
              <h3 className="font-semibold text-gray-900 text-base leading-snug">
                {t("country.switchTitle", { country: suggestion.name })}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {t("country.switchMessage", {
                  domain: suggestion.domain,
                  country: suggestion.name,
                })}
              </p>
            </div>
          </div>

          {/* Currency preview */}
          {suggestion.currency && (
            <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-amber-50 rounded-lg text-sm text-amber-800">
              <span className="font-semibold">{suggestion.currency.symbol}</span>
              <span>{suggestion.currency.name} ({suggestion.currency.code})</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAccept}
              className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-medium
                         py-2.5 px-4 rounded-xl text-sm transition-colors duration-150"
            >
              {t("country.switchYes", { country: suggestion.name })}
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700
                         font-medium py-2.5 px-4 rounded-xl text-sm transition-colors duration-150"
            >
              {t("country.switchNo")}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to   { opacity: 1; transform: translate(-50%, 0);    }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out both; }
      `}</style>
    </>
  );
}
