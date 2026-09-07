// client/src/utils/getApplicablePrice.js
// Thin re-export shim — the pricing rule now lives in @yehgs/icvng-core
// (shared with admin and the mobile app; previously duplicated inline in
// CardProduct.jsx, ProductDisplayPage.jsx, and Search.jsx too — see the
// history in @yehgs/icvng-core/src/pricing/getApplicablePrice.js).
export {
  getApplicablePrice,
  getApplicablePrice as default,
} from "@yehgs/icvng-core/pricing";
