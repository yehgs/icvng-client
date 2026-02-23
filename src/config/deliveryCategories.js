// src/config/deliveryCategories.js
//
// Controls which categories show 5-week delivery pricing vs 3-week delivery pricing.
//
// HOW IT WORKS:
//   - Categories whose slug is listed in FIVE_WEEK_DELIVERY_SLUGS show:
//       Regular Price  +  5-Week Delivery Price
//   - All other categories show:
//       Regular Price  +  3-Week Delivery Price
//
// HOW TO ADD / REMOVE A CATEGORY:
//   Simply add or remove the category slug string below.
//   Slugs are stable — they survive DB record changes unlike _id values.
//
// WHERE TO FIND A SLUG:
//   Admin panel → Categories → click a category → copy the "slug" field.

export const FIVE_WEEK_DELIVERY_SLUGS = ["capsule-machine", "coffee-maker"];

/**
 * Returns true if the product's category should display 5-week delivery pricing.
 *
 * Accepts the full range of shapes that product.category can arrive in:
 *   - A populated object:  { _id, name, slug, ... }
 *   - An array of objects: [{ _id, name, slug }]
 *   - A raw string ID:     "67e37da1..."  ← cannot slug-match; returns false
 *
 * NOTE: Make sure your API populates `category` with at least `{ slug }` so
 * this function can match correctly. The getProductByCategoryAndSubCategory
 * and getProductDetails endpoints already do this via .populate("category").
 *
 * @param {object|string|Array|null} category - value of product.category
 * @returns {boolean}
 */
export const isFiveWeekDeliveryCategory = (category) => {
  if (!category) return false;

  const cats = Array.isArray(category) ? category : [category];

  return cats.some((cat) => {
    if (!cat) return false;
    // Populated object with a slug field
    if (typeof cat === "object" && cat.slug) {
      return FIVE_WEEK_DELIVERY_SLUGS.includes(cat.slug);
    }
    // Raw string ID — we cannot match by slug, so return false.
    // Ensure your API populates category with at least { slug }.
    return false;
  });
};
