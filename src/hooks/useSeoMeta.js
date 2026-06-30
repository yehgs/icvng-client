/**
 * hooks/useSeoMeta.js
 *
 * Injects country-correct SEO tags into <head> on every page render.
 * Call once at the top of each page component:
 *
 *   useSeoMeta({ title: 'Shop | I-Coffee', description: '…' });
 *
 * Handles:
 *   - <title>
 *   - <meta name="description">
 *   - <link rel="canonical">
 *   - <meta property="og:*">
 *   - <link rel="alternate" hreflang="…"> for each country language
 */

import { useEffect } from "react";
import { useCountry } from "../context/CountryContext.jsx";

const DEFAULT_DESCRIPTION =
  "Premium Italian coffee and machines delivered to your door.";

function setMeta(name, content, attr = "name") {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href, extra = {}) {
  // Find existing with same rel+hreflang (if given) or rel
  const hreflang = extra.hreflang;
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (hreflang) el.setAttribute("hreflang", hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function useSeoMeta({ title, description, image, noIndex } = {}) {
  const { country } = useCountry();

  useEffect(() => {
    const siteName = country?.seo?.siteName || "I-Coffee";
    const domain = `https://${country?.domain || "i-coffee.ng"}`;
    const locale = country?.language?.locale || "en-NG";
    const pageTitle = title ? `${title} | ${siteName}` : siteName;
    const pageDesc = description || DEFAULT_DESCRIPTION;
    const canonical = `${domain}${window.location.pathname}`;

    // Title
    document.title = pageTitle;

    // Description
    setMeta("description", pageDesc);

    // Robots
    if (noIndex) setMeta("robots", "noindex,nofollow");

    // Canonical
    setLink("canonical", canonical);

    // Open Graph
    setMeta("og:title", pageTitle, "property");
    setMeta("og:description", pageDesc, "property");
    setMeta("og:url", canonical, "property");
    setMeta("og:site_name", siteName, "property");
    setMeta("og:locale", locale, "property");
    setMeta("og:type", "website", "property");
    if (image) setMeta("og:image", image, "property");

    // hreflang alternate links for supported languages
    const supported = country?.language?.supported || ["en"];
    supported.forEach((lang) => {
      setLink("alternate", `${domain}${window.location.pathname}`, {
        hreflang: `${lang}-${country?.code || "NG"}`,
      });
    });
    setLink("alternate", `${domain}${window.location.pathname}`, {
      hreflang: "x-default",
    });
  }, [title, description, image, noIndex, country]);
}

export default useSeoMeta;
