import React from "react";
import { Link } from "react-router-dom";
import { safeCampaignLink } from "@yehgs/icvng-core/campaigns";
import CardProduct from "../CardProduct";
import CampaignCountdown from "./CampaignCountdown";
import { valideURLConvert } from "../../utils/valideURLConvert";

function Cta({ block, className }) {
  const link = safeCampaignLink(block.ctaUrl);
  if (!block.ctaLabel || !link) return null;
  const cls = `inline-block mt-3 px-5 py-2 rounded-md font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`;
  const style = { backgroundColor: "var(--campaign-accent, #c7a45b)", color: "var(--campaign-text, #111111)" };
  // External destinations are validated https only (see safeCampaignLink).
  return link.internal
    ? <Link to={link.to} className={cls} style={style}>{block.ctaLabel}</Link>
    : <a href={link.to} className={cls} style={style} target="_blank" rel="noopener noreferrer">{block.ctaLabel}</a>;
}

function Hero({ block, campaign }) {
  // Reserve the box from the stored dimensions so the page doesn't jump.
  const ratio = block.imageWidth && block.imageHeight ? `${block.imageWidth} / ${block.imageHeight}` : undefined;
  return (
    <section className="relative rounded-xl overflow-hidden" style={{ backgroundColor: "var(--campaign-surface, #1c1c1c)" }}>
      {block.image && (
        <picture>
          {block.mobileImage && <source media="(max-width: 640px)" srcSet={block.mobileImage} />}
          <img src={block.image} alt="" loading="lazy" decoding="async" className="w-full h-auto object-cover" style={{ aspectRatio: ratio }} width={block.imageWidth || undefined} height={block.imageHeight || undefined} />
        </picture>
      )}
      <div className={`${block.image ? "absolute inset-0 bg-black/35" : ""} p-6 sm:p-10 flex flex-col justify-center`} style={{ color: block.image ? "#fff" : "var(--campaign-text, #111)" }}>
        {block.heading && <h2 className="text-2xl sm:text-4xl font-bold">{block.heading}</h2>}
        {block.subtitle && <p className="mt-2 max-w-xl text-sm sm:text-base opacity-95">{block.subtitle}</p>}
        <Cta block={block} />
      </div>
    </section>
  );
}

function PromoStrip({ block }) {
  return (
    <div className="rounded-lg px-4 py-3 text-center text-sm font-medium" style={{ backgroundColor: "var(--campaign-secondary, #8e2638)", color: "var(--campaign-badge-text, #fff)" }}>
      {block.heading}{block.subtitle ? ` — ${block.subtitle}` : ""}
      {block.ctaLabel && <span className="ml-3"><Cta block={block} className="!mt-0 !py-1" /></span>}
    </div>
  );
}

function Section({ block, children }) {
  return (
    <section>
      {(block.heading || block.subtitle) && (
        <div className="mb-3">
          {block.heading && <h2 className="text-xl font-bold" style={{ color: "var(--campaign-text, inherit)" }}>{block.heading}</h2>}
          {block.subtitle && <p className="text-sm opacity-75">{block.subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

/** Renders the ordered, server-sanitised content blocks of the live campaign. */
export default function CampaignBlocks({ campaign, blocks }) {
  const list = (blocks || campaign?.blocks || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  if (!list.length) return null;
  return (
    <div className="space-y-6">
      {list.map((b) => {
        switch (b.type) {
          case "HERO": return <Hero key={b.id} block={b} campaign={campaign} />;
          case "PROMO_STRIP": return <PromoStrip key={b.id} block={b} />;
          case "COUNTDOWN":
            return (
              <div key={b.id} className="text-center py-3 rounded-lg" style={{ backgroundColor: "var(--campaign-surface, #f7f3e9)", color: "var(--campaign-text, #111)" }}>
                {b.heading && <p className="font-semibold">{b.heading}</p>}
                <CampaignCountdown endsAt={campaign.endsAt} className="text-lg" />
              </div>
            );
          case "FEATURED_PRODUCTS":
          case "GIFT_COLLECTION":
            return b.products?.length ? (
              <Section key={b.id} block={b}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {b.products.map((p) => <CardProduct key={p._id} data={p} />)}
                </div>
              </Section>
            ) : null;
          case "FEATURED_CATEGORIES":
            return b.categories?.length ? (
              <Section key={b.id} block={b}>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {b.categories.map((c) => (
                    <Link key={c._id} to={`/category/${c.slug || valideURLConvert(c.name)}`} className="rounded-lg border p-3 text-center text-sm font-medium hover:shadow-md focus:outline-none focus-visible:ring-2" style={{ backgroundColor: "var(--campaign-surface, #fff)" }}>
                      {c.image && <img src={c.image} alt="" loading="lazy" decoding="async" className="mx-auto h-16 w-16 object-contain mb-2" width="64" height="64" />}
                      {c.name}
                    </Link>
                  ))}
                </div>
              </Section>
            ) : null;
          default: return null;
        }
      })}
    </div>
  );
}
