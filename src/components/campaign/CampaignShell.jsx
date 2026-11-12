import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { safeCampaignLink } from "@yehgs/icvng-core/campaigns";
import { useCampaign } from "../../context/CampaignContext";
import { useCountry } from "../../context/CountryContext";
import { brandCssVars } from "../../utils/campaignTheme";
import SeasonalEffect from "./SeasonalEffect";
import CampaignCountdown from "./CampaignCountdown";

/**
 * Mounted once in App. When a campaign is live it:
 *  - publishes the validated theme as CSS custom properties on <html>
 *    (never raw CSS — only the 9 validated hex colours),
 *  - renders a themed announcement bar with the countdown,
 *  - renders the (reduced-motion-aware) seasonal effect.
 * With no campaign it renders nothing and removes every variable it set.
 */
export default function CampaignShell({ hideEffect = false }) {
  const { campaign, cssVars } = useCampaign();
  const { t } = useCountry();

  useEffect(() => {
    const root = document.documentElement;
    // --campaign-* (landing page + badges) and --brand-* (the Tailwind brand colours used by every page:
    // home, shop, product, cart, checkout, orders, account). Brand vars are contrast-checked.
    const all = { ...(cssVars || {}), ...(campaign ? brandCssVars(campaign.theme) : {}) };
    const names = Object.keys(all);
    names.forEach((n) => root.style.setProperty(n, all[n]));
    if (campaign) root.setAttribute("data-campaign", campaign.type || "CUSTOM");
    // Tint the mobile browser chrome with the campaign colour, restoring the original afterwards.
    const meta = document.querySelector('meta[name="theme-color"]');
    const prevMeta = meta ? meta.getAttribute("content") : null;
    const primary = campaign?.theme?.primaryColor;
    if (meta && /^#[0-9a-f]{6}$/i.test(primary || "")) meta.setAttribute("content", primary);
    return () => {
      names.forEach((n) => root.style.removeProperty(n));
      root.removeAttribute("data-campaign");
      if (meta && prevMeta !== null) meta.setAttribute("content", prevMeta);
    };
  }, [campaign, cssVars]);

  if (!campaign) return null;
  const theme = campaign.theme || {};
  const landing = campaign.landingEnabled !== false ? `/campaign/${campaign.slug}` : null;
  const pct = campaign.maxPercentage > 0 ? Math.round(campaign.maxPercentage) : 0;

  return (
    <>
      <div
        role="region"
        aria-label={campaign.name}
        className="w-full text-center text-sm px-3 py-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
        style={{
          backgroundColor: theme.primaryColor || "#185B42",
          color: theme.badgeText || "#ffffff",
        }}
      >
        <span className="font-semibold">{campaign.name}</span>
        {(campaign.tagline || pct > 0) && (
          <span className="opacity-90">{campaign.tagline || t("campaign.upToPercent", { value: pct })}</span>
        )}
        {campaign.showCountdown && <CampaignCountdown endsAt={campaign.endsAt} compact />}
        {landing && (
          <Link to={landing} className="underline underline-offset-2 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
            {t("campaign.shopNow")}
          </Link>
        )}
      </div>
      {!hideEffect && <SeasonalEffect theme={theme} />}
    </>
  );
}

export { safeCampaignLink };
