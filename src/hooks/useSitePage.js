// client/src/hooks/useSitePage.js
//
// Fetches admin-managed content for a static page (About Us, Our Story,
// Contact Us, FAQ, Shipping Policy, Returns & Refunds, Terms & Conditions,
// Privacy Policy, Partner With Us) from the SitePage CMS. The server already
// resolves country (GLOBAL/HQ fallback vs a country's own override) and
// language for us based on the visited domain + X-Language header — this
// hook just wires that up and gives page components a tiny, safe accessor.
//
// Every page keeps its ORIGINAL hardcoded copy as the `defaults` argument,
// so nothing breaks before a slug is seeded, while the request is loading,
// or if the request fails. Once content exists in the CMS, it silently
// takes over per-key — a country/editor can override a handful of keys
// without needing to fill in the entire page.
import { useState, useEffect, useMemo, useCallback } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useCountry } from "../context/CountryContext";

/**
 * @param {string} slug   matches the SitePage document's slug, e.g. "faq"
 * @param {object} defaults  the page's original hardcoded content, keyed
 *   the same way the CMS document's `content` map is keyed. Used as the
 *   fallback for any key not (yet) present in the CMS.
 */
export function useSitePage(slug, defaults = {}) {
  const { country } = useCountry();
  const [cms, setCms] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await Axios({
          ...SummaryApi.getSitePage,
          url: `${SummaryApi.getSitePage.url}/${slug}`,
        });
        if (!cancelled && res.data?.success) {
          setCms(res.data.data);
        }
      } catch {
        // Non-fatal — page renders with `defaults` untouched.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // country?.code isn't in the request (server resolves it from the
    // storefront host) but re-fetching when it changes keeps preview /
    // admin "view as country" switches in sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, country?.code]);

  const content = cms?.content || {};
  const seo = cms?.seo || {};

  /** Read a single key, falling back to `defaults[key]` then `fallback`. */
  const get = useCallback(
    (key, fallback) => {
      if (content[key] !== undefined && content[key] !== null && content[key] !== "") {
        return content[key];
      }
      if (defaults[key] !== undefined) return defaults[key];
      return fallback;
    },
    // defaults is expected to be a stable module-level object per page
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [content]
  );

  const meta = useMemo(
    () => ({
      title: seo.title || "",
      description: seo.description || "",
    }),
    [seo]
  );

  return { content, get, meta, loading, usedGlobalFallback: cms?.usedGlobalFallback !== false };
}

export default useSitePage;
