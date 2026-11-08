import React, { useEffect, useState } from "react";
import { getCountdownParts } from "@yehgs/icvng-core/campaigns";
import { useCountry } from "../../context/CountryContext";
import { useCampaign } from "../../context/CampaignContext";

const pad = (n) => String(n).padStart(2, "0");

/** Ticks once a second only while visible; uses the server clock offset. */
export default function CampaignCountdown({ endsAt, compact = false, className = "" }) {
  const { t } = useCountry();
  const { offsetMs } = useCampaign();
  const [parts, setParts] = useState(() => getCountdownParts(endsAt, offsetMs));

  useEffect(() => {
    setParts(getCountdownParts(endsAt, offsetMs));
    let timer;
    const tick = () => setParts(getCountdownParts(endsAt, offsetMs));
    const start = () => { clearInterval(timer); timer = setInterval(tick, 1000); };
    const onVis = () => { if (document.visibilityState === "visible") { tick(); start(); } else clearInterval(timer); };
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", onVis); };
  }, [endsAt, offsetMs]);

  if (!endsAt || parts.expired) return null;
  const label = t("campaign.endsIn");
  const text = compact
    ? parts.days > 0 ? `${parts.days}${t("campaign.dayShort")} ${pad(parts.hours)}:${pad(parts.minutes)}` : `${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`
    : `${parts.days > 0 ? `${parts.days}${t("campaign.dayShort")} ` : ""}${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`;
  return (
    // role=timer, not live: screen readers read it on focus without chattering every second.
    <span className={className} role="timer" aria-live="off" aria-label={`${label} ${text}`}>
      <span className="opacity-80">{label} </span>
      <span className="font-semibold tabular-nums">{text}</span>
    </span>
  );
}
