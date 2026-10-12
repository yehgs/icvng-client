// utils/lazyRetry.js
//
// After every deploy Vite emits new hashed chunk names, and the old ones are
// deleted. A visitor whose tab (or cached index.html) predates the deploy then
// clicks a link, the browser asks for e.g. /assets/GiftCardBuyPage-DdhPj7a2.js,
// the host answers with index.html (SPA fallback) and React shows
// "Failed to fetch dynamically imported module". Reloading once fetches the
// fresh index.html and the correct chunk names, so do exactly that — guarded
// so a genuinely broken chunk can't cause a reload loop.
import { lazy } from "react";

const KEY = "icvng_chunk_reload_at";

export function reloadOnceForNewDeploy() {
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0);
    if (Date.now() - last > 15000) {
      sessionStorage.setItem(KEY, String(Date.now()));
      window.location.reload();
      return true;
    }
  } catch {
    /* storage blocked — fall through and surface the error */
  }
  return false;
}

export function lazyRetry(factory) {
  return lazy(() =>
    factory().catch((err) => {
      if (reloadOnceForNewDeploy()) return new Promise(() => {}); // page is reloading
      throw err;
    }),
  );
}
