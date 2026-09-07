// client/src/config/deliveryCategories.js
// Thin re-export shim — this file used to need manual sync with
// admin/src/config/deliveryCategories.js (and had already drifted in
// comments). Both now point at the one copy in @yehgs/icvng-core.
export {
  FIVE_WEEK_DELIVERY_SLUGS,
  isFiveWeekDeliveryCategory,
} from "@yehgs/icvng-core/pricing";
