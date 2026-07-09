// client/src/components/TrustBadgesSection.jsx
import React, { useEffect, useState } from "react";
import { Truck, Repeat, HelpCircle, Package, ShieldCheck, Star } from "lucide-react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useCountry } from "../context/CountryContext";

// Maps the admin-picked icon key to a lucide component. Falls back to Truck
// for anything unrecognized so a bad/blank value never breaks the layout.
const ICONS = {
  truck: Truck,
  repeat: Repeat,
  "help-circle": HelpCircle,
  package: Package,
  shield: ShieldCheck,
  star: Star,
};

/**
 * Content-managed per country (Admin → Content → Home Content → Trust
 * Badges) instead of hardcoded — falls back to translated generic defaults
 * (via i18n) if a market hasn't configured its own badges yet, and to
 * HQ's (Nigeria's) badges server-side if the visited market has none at all.
 */
const TrustBadgesSection = () => {
  const { t, country } = useCountry();
  const [badges, setBadges] = useState(null); // null = loading, [] = confirmed empty

  useEffect(() => {
    (async () => {
      try {
        const res = await Axios({
          ...SummaryApi.getHomeContentBlocks,
          params: { type: "trustBadge" },
        });
        if (res.data?.success) setBadges(res.data.data || []);
        else setBadges([]);
      } catch {
        setBadges([]);
      }
    })();
  }, []);

  // Generic translated defaults — used until an admin sets up real content
  // for this market (also doubles as the shape reference for admin CRUD).
  const defaults = [
    {
      icon: "truck",
      title: t("homeSections.freeShipping"),
      description: t("homeSections.freeShippingDesc", {
        amount: "₦100,000",
        area: "Lagos",
      }),
    },
    {
      icon: "repeat",
      title: t("homeSections.coffeeSubscription"),
      description: t("homeSections.coffeeSubscriptionDesc"),
    },
    {
      icon: "help-circle",
      title: t("homeSections.expertSupport"),
      description: t("homeSections.expertSupportDesc"),
    },
  ];

  const items = badges && badges.length > 0 ? badges : defaults;

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((badge, idx) => {
          const Icon = ICONS[badge.icon] || Truck;
          return (
            <div
              key={badge._id || idx}
              className="bg-amber-50 p-6 rounded-lg shadow flex items-center"
            >
              <div className="mr-4 text-amber-800">
                <Icon size={24} strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-bold text-amber-900">{badge.title}</h3>
                <p className="text-sm text-amber-800">{badge.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrustBadgesSection;
