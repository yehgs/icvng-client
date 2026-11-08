// client/src/utils/campaignPrices.js
//
// Presentation helpers that PICK between prices the server already computed.
//
// Cart lines are read from the line-level `campaignPricing` the server attaches
// to each cart row (quantity-aware, so minimum-quantity rules are right) — NOT
// from the product-level pricing used on listing cards, which assumes qty 1.
// Nothing here calculates a discount.
import { getCampaignPricing } from "@yehgs/icvng-core/campaigns";

/**
 * Cart lines with `selectedPrice` replaced by the server's campaign price where
 * one is live. Used for the checkout totals the shopper sees and sends; the
 * server re-prices every line anyway and answers 409 PRICE_CHANGED if these
 * numbers are stale.
 */
export function withCampaignPrices(cartItem, offsetMs = 0) {
  if (!Array.isArray(cartItem)) return [];
  return cartItem.map((item) => {
    const cp = getCampaignPricing(item, item.priceOption || "regular", { offsetMs });
    return cp ? { ...item, selectedPrice: cp.finalPrice, campaignPricing: cp } : item;
  });
}

/** { unit, original, campaign } for a logged-in cart line, using the campaign price when live. */
export function lineCampaignInfo(item, offsetMs = 0) {
  const cp = getCampaignPricing(item, item?.priceOption || "regular", { offsetMs });
  return cp ? { unit: cp.finalPrice, original: cp.originalPrice, campaign: cp } : null;
}
