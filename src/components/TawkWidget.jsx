/**
 * components/TawkWidget.jsx
 *
 * Loads the Tawk.to live-chat widget for the CURRENT country, instead of the
 * single hardcoded <script> that used to live in index.html.
 *
 * Each market can run its own Tawk.to property (its own agent inbox/queue) —
 * e.g. a Togo-based agent queue for i-coffee.tg — configured per country in
 * Admin → Settings → Countries → Tawk.to.
 *
 * Falls back to the original Nigeria widget ID so behaviour is unchanged
 * for markets that haven't configured their own property yet.
 */

import { useEffect, useRef } from "react";
import { useCountry } from "../context/CountryContext";

// Original single widget — kept as the default/fallback (Nigeria).
const FALLBACK_PROPERTY_ID = "69319adcb76a89198199fe66";
const FALLBACK_WIDGET_ID = "1jbks9rel";

export default function TawkWidget() {
  const { country, loading } = useCountry();
  const loadedKeyRef = useRef(null);

  useEffect(() => {
    if (loading) return;

    const propertyId = country?.tawk?.propertyId || FALLBACK_PROPERTY_ID;
    const widgetId = country?.tawk?.widgetId || FALLBACK_WIDGET_ID;
    const key = `${propertyId}/${widgetId}`;

    // Already loaded this exact widget — nothing to do.
    if (loadedKeyRef.current === key) return;

    // Switching country/widget mid-session: tear down the previous instance
    // so we don't stack multiple chat bubbles.
    const existingScript = document.getElementById("tawk-widget-script");
    if (existingScript) existingScript.remove();
    if (window.Tawk_API?.hideWidget) {
      try {
        window.Tawk_API.hideWidget();
      } catch {}
    }
    document.querySelectorAll("iframe[title*='chat widget' i]").forEach((el) => el.remove());

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.id = "tawk-widget-script";
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);

    loadedKeyRef.current = key;
  }, [loading, country?.tawk?.propertyId, country?.tawk?.widgetId]);

  return null;
}
