/**
 * components/SiteMeta.jsx
 *
 * Applies the site's DEFAULT <head> tags — title, meta description,
 * keywords, canonical link, Open Graph, Twitter card, robots — for the
 * CURRENT country, instead of the single hardcoded English/Nigeria copy
 * that used to live statically in index.html.
 *
 * Content is fetched from the SitePage CMS under the slug "site-index"
 * (Admin → Content Management → Site Pages → "Site Default (index.html)"),
 * which already has full country-scoped RBAC (IT/DIRECTOR edit every
 * country; any other content.manage-holding role, e.g. a foreign Manager,
 * edits only their own country — see controllers/sitePage.controller.js).
 *
 * Mounted once at the app root (see App.jsx, next to <TawkWidget />) so it
 * applies on every route as the baseline. Any page that calls
 * useSeoMeta({ title, description, ... }) with its own values overrides
 * these afterward (React effect ordering — page-level hooks run after this
 * root-level one on the same tick, so the more specific page copy wins).
 *
 * If "site-index" hasn't been seeded for a country yet, falls back to the
 * hardcoded Nigeria copy that used to be static in index.html, so nothing
 * breaks before scripts/seedSiteIndexMeta.js has been run for that market.
 */
import { useEffect } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useCountry } from "../context/CountryContext";

const FALLBACK = {
  title: "Buy Coffee Products Online in Nigeria | I-Coffee",
  description:
    "Discover and shop the best coffee products in Nigeria. From beans to brewers, I-Coffee offers high-quality coffee essentials with fast delivery across Nigeria.",
  keywords:
    "coffee Nigeria, buy coffee, coffee beans, espresso, coffee accessories, Nigerian coffee store",
  ogImage:
    "http://res.cloudinary.com/dwwsz3kss/image/upload/v1752169680/icv-ng/cyzkcev27uypuzjgwna2.jpg",
};

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

function setLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function SiteMeta() {
  const { country, loading: countryLoading } = useCountry();

  useEffect(() => {
    if (countryLoading) return;
    let cancelled = false;

    (async () => {
      let seo = {};
      try {
        const res = await Axios({
          ...SummaryApi.getSitePage,
          url: `${SummaryApi.getSitePage.url}/site-index`,
        });
        if (res.data?.success) seo = res.data.data?.seo || {};
      } catch {
        // Non-fatal — falls through to FALLBACK below.
      }
      if (cancelled) return;

      const siteName = country?.seo?.siteName || "I-Coffee";
      const domain = `https://${country?.domain || "i-coffee.ng"}`;
      const title = seo.title || FALLBACK.title;
      const description = seo.description || FALLBACK.description;
      const keywords = seo.keywords || FALLBACK.keywords;
      const ogImage = seo.ogImage || FALLBACK.ogImage;

      document.title = title;
      setMeta("description", description);
      setMeta("keywords", keywords);
      setMeta("author", "I-Coffee");
      setMeta("robots", "index, follow");

      setLink("canonical", domain);

      setMeta("og:title", title, "property");
      setMeta("og:description", description, "property");
      setMeta("og:type", "website", "property");
      setMeta("og:url", domain, "property");
      setMeta("og:image", ogImage, "property");
      setMeta("og:site_name", siteName, "property");

      setMeta("twitter:card", "summary_large_image");
      setMeta("twitter:title", title);
      setMeta("twitter:description", description);
    })();

    return () => {
      cancelled = true;
    };
  }, [countryLoading, country?.code]);

  return null;
}
