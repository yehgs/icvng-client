// client/src/components/FomoWidget.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { ShoppingBag, X } from "lucide-react";
import { DisplayPriceInNaira } from "../utils/DisplayPriceInCurrency";
import { useCountry } from "../context/CountryContext.jsx";
import { useBulkEntityTranslation } from "../hooks/useBulkEntityTranslation.js";

const POSITION_CLASSES = {
  "bottom-left": "bottom-6 left-6",
  "bottom-right": "bottom-6 right-6",
  "top-left": "top-24 left-6",
  "top-right": "top-24 right-6",
};

// Human-readable "time ago" — caps out at 11 months (never says "1 year ago").
// Takes the i18n t() function so it renders in the active language instead
// of always being English.
const timeAgo = (date, t) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);

  if (seconds < 60) return t("fomo.secAgo", { count: Math.max(seconds, 1) });
  if (minutes < 60) return t("fomo.minuteAgo", { count: minutes });
  if (hours < 24) return t("fomo.hourAgo", { count: hours });
  if (days < 30) return t("fomo.dayAgo", { count: days });

  const cappedMonths = Math.min(months, 11);
  return t("fomo.monthAgo", { count: cappedMonths });
};

const FomoWidget = () => {
  const [config, setConfig] = useState(null); // animation settings
  const [items, setItems] = useState([]); // purchase list
  const [current, setCurrent] = useState(null); // item being shown
  const [visible, setVisible] = useState(false); // controls opacity
  const [dismissed, setDismissed] = useState(false); // user dismissed
  const [fomoSettingsArr, setFomoSettingsArr] = useState([]); // wrap in array for hook
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  // Translate fomo notificationMessage for active language
  const { t } = useCountry();
  const translatedFomoArr = useBulkEntityTranslation("fomo", fomoSettingsArr);
  const translatedFomo = translatedFomoArr[0];
  const purchasedLabel =
    translatedFomo?.notificationMessage ||
    config?.notificationMessage ||
    t("fomo.justPurchased");

  // ── Fetch data on mount ────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await Axios({ ...SummaryApi.getFomoData });
        if (
          res.data?.success &&
          res.data?.settings?.enabled &&
          res.data?.data?.length > 0
        ) {
          setConfig(res.data.settings);
          setItems(res.data.data || []);
          // Wrap settings in array for translation hook
          if (res.data.settings?._id) {
            setFomoSettingsArr([res.data.settings]);
          }
        }
      } catch {
        // silent — widget is non-critical
      }
    };
    load();
  }, []);

  // ── Cycle through items ────────────────────────────────────────────────────
  const showNext = useCallback(() => {
    if (!items.length || dismissed) return;
    const item = items[indexRef.current % items.length];
    indexRef.current += 1;
    setCurrent(item);
    setVisible(true);

    // Hide after displayDuration
    timerRef.current = setTimeout(() => {
      setVisible(false);
      // Wait for fade-out then schedule next
      timerRef.current = setTimeout(
        showNext,
        (config?.fadeOutMs || 600) + (config?.pauseBetweenMs || 8000),
      );
    }, config?.displayDurationMs || 5000);
  }, [items, dismissed, config]);

  useEffect(() => {
    if (!config || !items.length || dismissed) return;
    // Initial delay before first popup
    timerRef.current = setTimeout(showNext, 3000);
    return () => clearTimeout(timerRef.current);
  }, [config, items, dismissed, showNext]);

  if (!config || !current || dismissed) return null;

  const posClass =
    POSITION_CLASSES[config.position] || POSITION_CLASSES["bottom-left"];

  // CSS transition values from config
  const fadeIn = `${config.fadeInMs || 600}ms`;
  const fadeOut = `${config.fadeOutMs || 600}ms`;

  // Slide offset direction based on position
  const isLeft = config.position?.includes("left");
  const slideOff =
    config.animationType === "slide"
      ? isLeft
        ? "translateX(-120%)"
        : "translateX(120%)"
      : config.animationType === "bounce"
        ? "translateY(100%)"
        : undefined;

  const transform = visible ? "none" : slideOff;
  const opacity = visible ? 1 : 0;

  const qty = current.quantity || 1;

  return (
    <div
      className={`fixed ${posClass} z-[9999] max-w-[360px] w-full`}
      style={{
        opacity,
        transform,
        transition: visible
          ? `opacity ${fadeIn} ease-out, transform ${fadeIn} ease-out`
          : `opacity ${fadeOut} ease-in, transform ${fadeOut} ease-in`,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="bg-yellow-50 shadow-xl rounded-xl border border-yellow-200 flex items-center gap-3 p-4 relative overflow-hidden">
        {/* Green left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500 rounded-l-xl" />

        {/* Product image or icon */}
        <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-white ml-1">
          {current.productImage ? (
            <img
              src={current.productImage}
              alt={current.productName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {current.name}
            <span className="font-normal text-gray-500"> from </span>
            {current.state}
          </p>
          <p className="text-sm text-gray-700 truncate mt-0.5">
            {qty > 1 ? `${purchasedLabel} ${qty}x` : purchasedLabel}{" "}
            <span className="font-medium text-gray-900">
              {current.productName}
            </span>
          </p>
          <div className="flex items-center gap-2 mt-1">
            {current.price > 0 && (
              <span className="text-sm font-bold text-green-600">
                {DisplayPriceInNaira(current.price)}
              </span>
            )}
            <span className="text-xs text-gray-500">
              {timeAgo(current.purchasedAt, t)}
            </span>
          </div>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => {
            clearTimeout(timerRef.current);
            setDismissed(true);
          }}
          className="absolute top-1.5 right-1.5 text-gray-400 hover:text-gray-600 p-0.5"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default FomoWidget;
