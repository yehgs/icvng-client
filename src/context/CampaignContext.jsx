/**
 * context/CampaignContext.jsx
 *
 * Seasonal-campaign state for the storefront. The SERVER decides everything
 * (which campaign is live for this storefront's country, every price, every
 * discount). This provider only fetches and exposes that, plus a server-clock
 * offset so countdowns are correct even when the shopper's clock is wrong.
 *
 * Failure policy: if the campaign API is down the storefront renders exactly as
 * it did before campaigns existed — no discounts, no effects, no banner.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchActiveCampaign,
  getServerClockOffset,
  getCampaignPricing,
  themeToCssVars,
} from "@yehgs/icvng-core/campaigns";
import Axios from "../utils/Axios.js";
import { useCountry } from "./CountryContext.jsx";

const CampaignContext = createContext(null);

// A hidden tab is refreshed on return if the data is older than this.
const STALE_AFTER_MS = 2 * 60 * 1000;

export function CampaignProvider({ children }) {
  const { countryCode, language } = useCountry();
  const [campaign, setCampaign] = useState(null);
  const [offsetMs, setOffsetMs] = useState(0);
  const [loaded, setLoaded] = useState(false);
  // Bumps when a campaign ends or a refresh lands so memoised totals recompute.
  const [epoch, setEpoch] = useState(0);
  const lastFetchedAt = useRef(0);
  const reqId = useRef(0);

  const refresh = useCallback(async () => {
    const id = ++reqId.current;
    const res = await fetchActiveCampaign({ apiClient: Axios, language });
    if (id !== reqId.current) return; // a newer request superseded this one
    lastFetchedAt.current = Date.now();
    setCampaign(res.campaign || null);
    setOffsetMs(res.serverTime ? getServerClockOffset(res.serverTime) : 0);
    setLoaded(true);
    setEpoch((e) => e + 1);
  }, [language]);

  // Country / language switch: drop the old country's campaign immediately so a
  // stale badge or snowfall can never linger, then fetch the right one.
  useEffect(() => {
    setCampaign(null);
    setLoaded(false);
    refresh();
  }, [countryCode, refresh]);

  // Refresh stale data when the tab comes back to the foreground.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastFetchedAt.current > STALE_AFTER_MS) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  // When the campaign's end passes (server time), drop it and re-sync.
  useEffect(() => {
    if (!campaign?.endsAt) return undefined;
    const ms = Date.parse(campaign.endsAt) - (Date.now() + offsetMs);
    if (!Number.isFinite(ms)) return undefined;
    if (ms <= 0) {
      setCampaign(null);
      refresh();
      return undefined;
    }
    // setTimeout caps at ~24.8 days; re-arm periodically for longer windows.
    const timer = setTimeout(() => {
      setEpoch((e) => e + 1);
      refresh();
    }, Math.min(ms + 500, 2 ** 31 - 1));
    return () => clearTimeout(timer);
  }, [campaign, offsetMs, refresh]);

  const cssVars = useMemo(() => (campaign ? themeToCssVars(campaign.theme) : {}), [campaign]);

  const pricingFor = useCallback(
    (productOrLine, option) => getCampaignPricing(productOrLine, option, { offsetMs }),
    [offsetMs],
  );

  const value = useMemo(
    () => ({ campaign, offsetMs, loaded, epoch, cssVars, refresh, pricingFor }),
    [campaign, offsetMs, loaded, epoch, cssVars, refresh, pricingFor],
  );
  return <CampaignContext.Provider value={value}>{children}</CampaignContext.Provider>;
}

const FALLBACK = {
  campaign: null, offsetMs: 0, loaded: true, epoch: 0, cssVars: {}, refresh: async () => {},
  pricingFor: () => null,
};

/** Safe outside the provider (returns "no campaign"), so shared components never crash. */
export const useCampaign = () => useContext(CampaignContext) || FALLBACK;
