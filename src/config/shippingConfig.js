// client/src/config/shippingConfig.js

// ✅ OPTION 1: STRICT MODE (Recommended for your case)
// This will ALWAYS select table_shipping, ignoring free shipping
export const SHIPPING_METHOD_PRIORITY = {
  defaultType: "table_shipping",
  strictMode: true, // 👈 Only select the defaultType
  selectFreeIfAvailable: false,
  selectCheapestAsFallback: false,
};

// ✅ OPTION 2: PREFER TABLE SHIPPING, FALLBACK TO FREE
// This will try table_shipping first, but select free if table_shipping unavailable
// export const SHIPPING_METHOD_PRIORITY = {
//   defaultType: "table_shipping",
//   strictMode: false,
//   selectFreeIfAvailable: false, // Don't prefer free
//   selectCheapestAsFallback: true, // Fall back to cheapest
// };

// ✅ OPTION 3: PREFER FREE SHIPPING, THEN TABLE SHIPPING
// This will select free shipping first, table_shipping second
// export const SHIPPING_METHOD_PRIORITY = {
//   defaultType: "table_shipping",
//   strictMode: false,
//   selectFreeIfAvailable: true, // 👈 Prefer free shipping
//   selectCheapestAsFallback: true,
// };

// Available types:
// - "table_shipping" - Weight-based table rates
// - "flat_rate" - Flat rate shipping
// - "pickup" - Customer pickup
