// client/src/hooks/useSocialLinks.js
//
// Country-specific social media handles. Reads the same country-scoped
// "footer" HomeContentBlock that already holds contact details (Admin →
// Site Content → Footer), so a market can point Facebook/Twitter/Instagram
// at its own accounts instead of inheriting Nigeria's by default.
import { useState, useEffect } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";

const DEFAULTS = {
  facebook: "https://www.facebook.com/Italiancoffeeonline/?ref=pages_you_manage",
  twitter: "https://twitter.com/italiancoffee_v",
  instagram: "https://www.instagram.com/italiancofeeventure/",
};

export function useSocialLinks() {
  const [links, setLinks] = useState(DEFAULTS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await Axios({ ...SummaryApi.getHomeContentBlocks, params: { type: "footer" } });
        const block = res.data?.data?.[0];
        if (!cancelled && block) {
          setLinks({
            facebook: block.socialFacebook || DEFAULTS.facebook,
            twitter: block.socialTwitter || DEFAULTS.twitter,
            instagram: block.socialInstagram || DEFAULTS.instagram,
          });
        }
      } catch {
        // non-fatal — DEFAULTS already set
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return links;
}

export default useSocialLinks;
