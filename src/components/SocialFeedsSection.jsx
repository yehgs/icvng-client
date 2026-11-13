// client/src/components/SocialFeedsSection.jsx
//
// Social-media page cards (Facebook page, Instagram, TikTok, …) shown FIRST in the "Coffee Stories" section,
// on a dark indigo band so they read differently from the amber blog cards below. The list is managed per
// country in the admin (Social Pages); entries IT/Director publish for all countries come after the country's own.
// Renders nothing while loading, on error, or when there are no cards (the blog section is unaffected).
import React, { useEffect, useState } from "react";
import { Facebook, Instagram, Youtube, Linkedin, Twitter, MessageCircle, Send, Music2, Globe, ExternalLink } from "lucide-react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useCountry } from "../context/CountryContext";

const PLATFORM = {
  FACEBOOK: { icon: Facebook, accent: "#1877F2", name: "Facebook" },
  INSTAGRAM: { icon: Instagram, accent: "#E1306C", name: "Instagram" },
  X: { icon: Twitter, accent: "#111827", name: "X" },
  TIKTOK: { icon: Music2, accent: "#111111", name: "TikTok" },
  YOUTUBE: { icon: Youtube, accent: "#FF0000", name: "YouTube" },
  LINKEDIN: { icon: Linkedin, accent: "#0A66C2", name: "LinkedIn" },
  WHATSAPP: { icon: MessageCircle, accent: "#25D366", name: "WhatsApp" },
  TELEGRAM: { icon: Send, accent: "#229ED9", name: "Telegram" },
  OTHER: { icon: Globe, accent: "#6B7280", name: "" },
};

/** Facebook's official Page plugin, only for validated facebook.com links. Lazy-loaded. */
function facebookPluginSrc(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" || !/(^|\.)facebook\.com$/i.test(u.hostname)) return null;
    return `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(url)}&tabs=timeline&width=340&height=260&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`;
  } catch { return null; }
}

function SocialCard({ page, t }) {
  const meta = PLATFORM[page.platform] || PLATFORM.OTHER;
  const Icon = meta.icon;
  const feed = page.showFeed && page.platform === "FACEBOOK" ? facebookPluginSrc(page.url) : null;
  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-1">
      <div className="h-1.5" style={{ backgroundColor: meta.accent }} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3">
          {page.imageUrl ? (
            <img src={page.imageUrl} alt="" loading="lazy" width="48" height="48" className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full text-white" style={{ backgroundColor: meta.accent }}><Icon className="h-6 w-6" aria-hidden="true" /></span>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-gray-900">{page.name}</h3>
            <p className="truncate text-xs text-gray-600">
              <span className="font-medium" style={{ color: meta.accent === "#111827" || meta.accent === "#111111" ? "#374151" : meta.accent }}>{meta.name}</span>
              {page.handle ? ` · ${page.handle}` : ""}{page.followersLabel ? ` · ${page.followersLabel}` : ""}
            </p>
          </div>
        </div>
        {page.description && <p className="mt-3 line-clamp-3 text-sm text-gray-700">{page.description}</p>}
        {feed && (
          <iframe
            title={`${page.name} – Facebook`}
            src={feed}
            loading="lazy"
            height="260"
            className="mt-3 w-full rounded-lg border-0"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        )}
        <a
          href={page.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: meta.accent }}
        >
          {t("homeSections.socialVisit")}<ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

const SocialFeedsSection = () => {
  const { t, countryCode } = useCountry();
  const [pages, setPages] = useState([]);

  useEffect(() => {
    let cancelled = false;
    Axios({ ...SummaryApi.getSocialPages })
      .then((r) => { if (!cancelled && r.data?.success) setPages(Array.isArray(r.data.data) ? r.data.data : []); })
      .catch(() => { if (!cancelled) setPages([]); });
    return () => { cancelled = true; };
  }, [countryCode]);

  if (pages.length === 0) return null;
  return (
    <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-12" aria-labelledby="social-heading">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 id="social-heading" className="text-3xl font-bold text-white md:text-4xl">{t("homeSections.socialHeading")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-indigo-100">{t("homeSections.socialSubtitle")}</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {pages.map((p) => <SocialCard key={`${p.platform}-${p.url}`} page={p} t={t} />)}
        </div>
      </div>
    </section>
  );
};

export default SocialFeedsSection;
