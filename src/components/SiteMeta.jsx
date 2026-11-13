/**
 * components/SiteMeta.jsx
 *
 * Site-wide <head> defaults, re-evaluated on every route change:
 *   • "/"                → "site-index" CMS copy (Admin → Content Management → Site Pages), JSON-LD Organization + WebSite(SearchAction)
 *   • static pages       → CMS SEO for that slug, else built-in copy (utils/seoCopy.js), hreflang across country domains
 *   • private/checkout   → noindex,nofollow
 * Pages with their own data (product, blog post, category/brand, 404) call useSeoMeta() themselves; while one is mounted it
 * "claims" the head (documentElement.dataset.pageSeo) and this component stays out of the way, so the root can no longer
 * overwrite a page's title/canonical with the homepage's (the previous behaviour).
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useCountry } from "../context/CountryContext";
import { applySeo } from "../hooks/useSeoMeta";
import { isNoIndexPath, staticCopy, staticSlug, STATIC_SEO } from "../utils/seoCopy";

const FALLBACK = {
  title: "Buy Coffee Products Online in Nigeria | I-Coffee",
  description: "Discover and shop the best coffee products in Nigeria. From beans to brewers, I-Coffee offers high-quality coffee essentials with fast delivery across Nigeria.",
  ogImage: "https://res.cloudinary.com/dwwsz3kss/image/upload/v1752169680/icv-ng/cyzkcev27uypuzjgwna2.jpg",
};
const STATIC_PATHS = new Set(Object.keys(STATIC_SEO.en));

export default function SiteMeta() {
  const { country, language, loading: countryLoading } = useCountry();
  const { pathname } = useLocation();

  useEffect(() => {
    if (countryLoading) return undefined;
    const path = pathname.replace(/\/$/, "") || "/";
    let cancelled = false;
    const claimed = () => document.documentElement.dataset.pageSeo === "1";
    const lang = language || country?.language?.default || "en";
    const siteName = country?.seo?.siteName || "I-Coffee";

    if (isNoIndexPath(path)) {
      if (!claimed()) applySeo(country, { title: siteName, raw: true, description: "", noIndex: true, path });
      return undefined;
    }
    const isHome = path === "/";
    if (!isHome && !STATIC_PATHS.has(path)) return undefined; // data pages claim the head themselves

    (async () => {
      let seo = {};
      try {
        const res = await Axios({ ...SummaryApi.getSitePage, url: `${SummaryApi.getSitePage.url}/${staticSlug(path)}` });
        if (res.data?.success) seo = res.data.data?.seo || {};
      } catch { /* fall back to built-in copy */ }
      if (cancelled || claimed()) return;

      const copy = staticCopy(lang, path);
      const title = seo.title || (isHome ? FALLBACK.title : copy?.[0]) || siteName;
      const description = seo.description || (isHome ? FALLBACK.description : copy?.[1]) || "";
      const domain = `https://${country?.domain || "i-coffee.ng"}`;
      applySeo(country, {
        title,
        raw: isHome, // the home copy is already a full title; other pages get " | Site name"
        description,
        image: seo.ogImage || (isHome ? FALLBACK.ogImage : undefined),
        path: isHome ? "" : path,
        alternates: true,
        jsonLd: isHome
          ? [
              { "@context": "https://schema.org", "@type": "Organization", name: siteName, url: domain, logo: `${domain}/favicon.svg` },
              {
                "@context": "https://schema.org", "@type": "WebSite", name: siteName, url: domain, inLanguage: country?.language?.locale,
                potentialAction: { "@type": "SearchAction", target: `${domain}/search?q={search_term_string}`, "query-input": "required name=search_term_string" },
              },
            ]
          : undefined,
      });
      if (seo.keywords) document.querySelector('meta[name="keywords"]')?.setAttribute("content", seo.keywords);
    })();

    return () => { cancelled = true; };
  }, [countryLoading, country?.code, language, pathname]);

  return null;
}
