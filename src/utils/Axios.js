// client/src/utils/Axios.js
//
// Thin web-specific wrapper around @yehgs/icvng-core's createApiClient.
// The auth/refresh-token interceptor logic now lives in core (identical
// behavior); this file only supplies the two things that are genuinely
// web-specific: a localStorage-backed token adapter, and the
// X-Storefront-Host / X-Language headers the country-detection middleware
// (server/middleware/countryDetect.js) reads for this SPA.
import { createApiClient, createStorageAdapter } from "@yehgs/icvng-core/api";
import { baseURL } from "../common/SummaryApi";

const tokenStorage = createStorageAdapter({
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: (key) => localStorage.removeItem(key),
});

// Exported so Login.jsx/Register.jsx can pass the exact same adapter
// instance into @yehgs/icvng-core/auth's login()/register() — those
// write tokens the same way this file's own interceptor reads them back.
export { tokenStorage };

const getExtraHeaders = () => {
  const headers = {};

  // The API runs on one shared domain across every country deployment, so
  // req.headers.host on the server is always the API's own host — never the
  // storefront's (i-coffee.tg, i-coffee.bj, etc). Without this,
  // countryDetect middleware can never resolve anything but the default
  // country. Send the actual browser hostname so it can.
  if (typeof window !== "undefined" && window.location?.hostname) {
    headers["X-Storefront-Host"] = window.location.host; // includes :port for local dev
  }

  // Active UI language (kept in sync with i18n's saved preference) — lets
  // language-aware endpoints (category structure, country config, etc.)
  // localize their response instead of always returning English.
  const savedLanguage = localStorage.getItem("icvng_language");
  if (savedLanguage) {
    headers["X-Language"] = savedLanguage;
  }

  return headers;
};

const Axios = createApiClient({ baseURL, tokenStorage, getExtraHeaders });

export default Axios;
