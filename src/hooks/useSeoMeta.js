/**
 * hooks/useSeoMeta.js
 *
 * Page-level <head> management. A page that calls this "claims" the head (document.documentElement.dataset.pageSeo)
 * so the site-wide SiteMeta defaults don't overwrite it, and releases it on unmount.
 *
 *   useSeoMeta({ title, description, image, type: "product"|"article"|"website", noIndex, jsonLd, path,
 *                alternates: true, raw: true, published, modified })
 *
 * Sets title, description, robots, canonical (self-referencing, query-string stripped), Open Graph, Twitter card,
 * hreflang (country alternates, only when `alternates` is set — i.e. pages that exist on every domain) and JSON-LD.
 * Pass `title: ""`/falsy while data is loading to avoid flashing a wrong title (the hook then does nothing).
 */
import { useEffect } from "react";
import { useCountry } from "../context/CountryContext.jsx";
import { SEO_COUNTRY_ALTERNATES } from "../utils/seoCopy";

export function setMeta(name, content, attr = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!content) { el?.remove(); return; }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function setLink(rel, href, hreflang) {
  const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.querySelector(sel);
  if (!href) { el?.remove(); return; }
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (hreflang) el.setAttribute("hreflang", hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const clear = (selector) => document.head.querySelectorAll(selector).forEach((n) => n.remove());
const toAbs = (u, domain) => (!u ? "" : /^https?:\/\//i.test(u) ? u.replace(/^http:\/\//i, "https://") : `${domain}${u.startsWith("/") ? "" : "/"}${u}`);

export function applySeo(country, o = {}) {
  const siteName = country?.seo?.siteName || "I-Coffee";
  const domain = `https://${country?.domain || "i-coffee.ng"}`;
  const path = (o.path ?? window.location.pathname).replace(/\/$/, "");
  const canonical = `${domain}${path}`;
  const title = o.raw || o.title === siteName ? o.title : `${o.title} | ${siteName}`;
  const image = toAbs(o.image, domain);

  document.title = title;
  setMeta("description", o.description);
  setMeta("robots", o.noIndex ? "noindex,nofollow" : "index,follow,max-image-preview:large");
  setLink("canonical", canonical);

  setMeta("og:title", o.title, "property");
  setMeta("og:description", o.description, "property");
  setMeta("og:url", canonical, "property");
  setMeta("og:site_name", siteName, "property");
  setMeta("og:locale", (country?.language?.locale || "en-NG").replace("-", "_"), "property");
  setMeta("og:type", o.type === "article" ? "article" : o.type === "product" ? "og:product" : "website", "property");
  setMeta("og:image", image, "property");
  setMeta("twitter:card", image ? "summary_large_image" : "summary");
  setMeta("twitter:title", o.title);
  setMeta("twitter:description", o.description);
  setMeta("twitter:image", image);
  setMeta("article:published_time", o.published, "property");
  setMeta("article:modified_time", o.modified, "property");

  clear('link[rel="alternate"][hreflang]');
  if (o.alternates && !o.noIndex) {
    SEO_COUNTRY_ALTERNATES.forEach((a) => setLink("alternate", `https://${a.domain}${path}`, a.hreflang));
    setLink("alternate", `https://i-coffee.ng${path}`, "x-default");
  }

  clear('script[data-seo-jsonld]');
  (Array.isArray(o.jsonLd) ? o.jsonLd : o.jsonLd ? [o.jsonLd] : []).forEach((j) => {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.setAttribute("data-seo-jsonld", "1");
    s.text = JSON.stringify(j).replace(/</g, "\\u003c");
    document.head.appendChild(s);
  });
}

export function useSeoMeta(opts = {}) {
  const { country } = useCountry();
  const key = JSON.stringify([opts.title, opts.description, opts.image, opts.type, opts.noIndex, opts.path, opts.alternates, opts.raw, opts.jsonLd, opts.published, opts.modified, country?.code]);

  useEffect(() => {
    if (!opts.title) return undefined; // data not ready yet — leave the head alone
    document.documentElement.dataset.pageSeo = "1";
    applySeo(country, opts);
    return () => { delete document.documentElement.dataset.pageSeo; clear('script[data-seo-jsonld]'); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

export default useSeoMeta;
