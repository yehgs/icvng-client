// client/src/components/SitePopupWidget.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useBulkEntityTranslation } from "../hooks/useBulkEntityTranslation.js";

// Maps the current route to one of the page keys the admin picks from when
// targeting a popup (see popup.model.js `displayPages`). Kept intentionally
// coarse (a handful of buckets, not one entry per route) so new routes
// don't need this file touched — anything not matched falls through to
// "all"-only popups, which is the safe default.
const pageKeyFor = (pathname) => {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/shop")) return "shop";
  if (pathname.startsWith("/category")) return "category";
  if (pathname.startsWith("/product")) return "product";
  if (pathname.startsWith("/cart")) return "cart";
  if (pathname.startsWith("/checkout")) return "checkout";
  if (pathname.startsWith("/blog")) return "blog";
  return "all";
};

const SESSION_KEY_PREFIX = "popup_seen_";

const SitePopupWidget = () => {
  const location = useLocation();
  const [popup, setPopup] = useState(null);
  const [popupArr, setPopupArr] = useState([]); // wrapped for the translation hook
  const [visible, setVisible] = useState(false);
  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  const translatedArr = useBulkEntityTranslation("popup", popupArr);
  const translated = translatedArr[0];

  // ── Fetch the popup that matches this page ──────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const pageKey = pageKeyFor(location.pathname);

    const load = async () => {
      try {
        const res = await Axios({
          ...SummaryApi.getActivePopup,
          url: `${SummaryApi.getActivePopup.url}?page=${pageKey}`,
        });
        if (cancelled) return;
        const data = res.data?.data;
        if (!data) {
          setPopup(null);
          setPopupArr([]);
          return;
        }
        // Already seen this session and it's a "once per session" popup —
        // don't refetch/reshow it, even on a different matching page.
        if (
          data.showOncePerSession &&
          sessionStorage.getItem(`${SESSION_KEY_PREFIX}${data._id}`)
        ) {
          setPopup(null);
          setPopupArr([]);
          return;
        }
        setPopup(data);
        setPopupArr([data]);
      } catch {
        // silent — widget is non-critical to the page working
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // Re-check whenever the route (and therefore the matched page key) changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // ── Delay → show → auto-dismiss ──────────────────────────────────────────
  useEffect(() => {
    clearTimeout(showTimerRef.current);
    clearTimeout(hideTimerRef.current);
    setVisible(false);
    if (!popup) return;

    const delayMs = Math.max(0, (popup.delaySeconds || 0) * 1000);
    showTimerRef.current = setTimeout(() => {
      setVisible(true);
      if (popup.showOncePerSession) {
        sessionStorage.setItem(`${SESSION_KEY_PREFIX}${popup._id}`, "1");
      }
      if (popup.displaySeconds > 0) {
        hideTimerRef.current = setTimeout(() => {
          setVisible(false);
        }, popup.displaySeconds * 1000);
      }
    }, delayMs);

    return () => {
      clearTimeout(showTimerRef.current);
      clearTimeout(hideTimerRef.current);
    };
  }, [popup]);

  if (!popup || !visible) return null;

  const title = translated?.title || popup.title;
  const bodyText = translated?.bodyText || popup.bodyText;
  const ctaText = translated?.ctaText || popup.ctaText;

  const close = () => {
    clearTimeout(hideTimerRef.current);
    setVisible(false);
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4"
      onClick={close}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full p-1.5 shadow"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {popup.image && (
          <img src={popup.image} alt={title || ""} className="w-full max-h-64 object-cover" />
        )}

        {(title || bodyText || (popup.ctaLink && ctaText)) && (
          <div className="p-6 text-center space-y-2">
            {title && <h3 className="text-xl font-bold text-gray-900">{title}</h3>}
            {bodyText && <p className="text-sm text-gray-600 whitespace-pre-line">{bodyText}</p>}
            {popup.ctaLink && (
              <a
                href={popup.ctaLink}
                className="inline-block mt-3 px-6 py-2.5 rounded-lg bg-[#7B3F1C] text-white text-sm font-semibold hover:bg-[#6a3517] transition-colors"
              >
                {ctaText || "Learn more"}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SitePopupWidget;
