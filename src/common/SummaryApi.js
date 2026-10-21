// client/src/common/SummaryApi.js
//
// The endpoint map itself now lives in @yehgs/icvng-core (shared with
// admin and the mobile app) — this file only keeps the one thing that's
// legitimately web-specific: reading Vite's env var for the API base URL.
import { endpoints } from "@yehgs/icvng-core/api";

export const baseURL = import.meta.env.VITE_API_URL;

// Gift-card purchase via CinetPay (Togo/Benin). Defined here, not in the core
// package, so it ships without a core release.
const SummaryApi = {
  ...endpoints,
  // Banner landing pages (training / machine rental) -> saved for the Nigeria team + emailed via Resend
  submitBookingRequest: {
    url: "/api/booking-requests",
    method: "post",
  },
  purchaseGiftCardCinetpay: {
    url: "/api/gift-card/purchase/cinetpay",
    method: "post",
  },
  verifyGiftCardCinetpay: {
    url: "/api/gift-card/purchase/cinetpay/verify", // + /:reference
    method: "get",
  },
};

export default SummaryApi;
