import React from "react";
import { getDiscountBadge } from "@yehgs/icvng-core/campaigns";
import { useCountry } from "../../context/CountryContext";
import { useCurrency } from "../../provider/GlobalProvider";

/**
 * Discount badge for a server-computed `campaignPricing` object.
 * Text carries the meaning ("20% OFF"), not just colour. Falls back to the
 * store's own badge colours when no theme variables are present.
 */
export default function CampaignBadge({ pricing, className = "" }) {
  const { t } = useCountry();
  const { formatPrice } = useCurrency();
  const badge = getDiscountBadge(pricing);
  if (!badge) return null;
  const text = badge.label
    || (badge.kind === "PERCENT"
      ? t("campaign.percentOff", { value: badge.value })
      : t("campaign.amountOff", { amount: formatPrice(badge.value) }));
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-full ${className}`}
      style={{ backgroundColor: "var(--campaign-badge-background, #15803d)", color: "var(--campaign-badge-text, #ffffff)" }}
      aria-label={t("campaign.discountAria", { text })}
    >
      {text}
    </span>
  );
}
