// src/config/deliveryCategories.js
//
// MUST stay in sync with icvng-admin/src/config/deliveryCategories.js and
// icvng-server/controllers/product.controller.js (isMachineType /
// FIVE_WEEK_DELIVERY_SLUGS).
//
// Controls which products show 5-week delivery pricing vs 2-week ("3-week"
// in the DB/admin — same field, price3weeksDelivery) delivery pricing.
//
// A product is treated as "5-week only" if EITHER signal says so:
//   - productType === "MACHINE" (the explicit product type field), OR
//   - its category slug is one of FIVE_WEEK_DELIVERY_SLUGS
//
// Both signals are checked (not just one) because data quality on either
// field alone isn't fully reliable — e.g. a capsule machine's coffee-pod
// variant might get tagged productType "COFFEE", or a product might not
// have its category populated with a slug on a given API response. Treating
// it as five-week-only if EITHER field indicates it errs on the side of
// showing the correct delivery price rather than silently hiding a machine
// product because one of the two signals was missed.

export const FIVE_WEEK_DELIVERY_SLUGS = ["capsule-machine", "coffee-maker"];

const categoryMatchesFiveWeekSlug = (category) => {
  if (!category) return false;
  const cats = Array.isArray(category) ? category : [category];
  return cats.some((cat) => {
    if (!cat) return false;
    if (typeof cat === "object" && cat.slug) {
      return FIVE_WEEK_DELIVERY_SLUGS.includes(cat.slug);
    }
    return false;
  });
};

/**
 * Returns true if the product should display 5-week delivery pricing
 * instead of 2-week ("3-week") delivery pricing.
 *
 * @param {string|null|undefined} productType e.g. "MACHINE", "COFFEE", ...
 * @param {object|string|Array|null} [category] value of product.category
 *   (optional — pass it when available for the extra safety net; callers
 *   that only have productType handy can omit it)
 * @returns {boolean}
 */
export const isFiveWeekDeliveryCategory = (productType, category = null) =>
  productType === "MACHINE" || categoryMatchesFiveWeekSlug(category);
