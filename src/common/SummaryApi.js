// client/src/common/SummaryApi.js
//
// The endpoint map itself now lives in @yehgs/icvng-core (shared with
// admin and the mobile app) — this file only keeps the one thing that's
// legitimately web-specific: reading Vite's env var for the API base URL.
import { endpoints } from "@yehgs/icvng-core/api";

export const baseURL = import.meta.env.VITE_API_URL;

const SummaryApi = endpoints;

export default SummaryApi;
