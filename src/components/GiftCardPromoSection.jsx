// client/src/components/GiftCardPromoSection.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Gift, ArrowRight, Mail, Clock } from "lucide-react";
import { useCountry } from "../context/CountryContext";

/**
 * Homepage promo band for gift cards, placed after Testimonials and before
 * the footer (see Home.jsx). Follows the same visual language already used
 * by CoffeeOriginSection/TrustBadgesSection — amber-tinted band, the site's
 * `secondary-200`/`secondary-100` button pair (same as the header's "Coffee
 * Blog"/"Shop Now" buttons) — rather than introducing new colors.
 */
const GiftCardPromoSection = () => {
  const { t } = useCountry();

  return (
    <section className="bg-amber-50 py-14">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col md:flex-row items-stretch">
          {/* Left: copy + CTA */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <span className="inline-flex items-center gap-2 text-amber-800 font-semibold text-sm uppercase tracking-wide mb-3">
              <Gift size={18} />
              {t("homeSections.giftCardEyebrow")}
            </span>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              {t("homeSections.giftCardTitle")}
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
              {t("homeSections.giftCardSubtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex items-start gap-2">
                <Mail size={18} className="text-amber-800 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{t("homeSections.giftCardFeatureEmail")}</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock size={18} className="text-amber-800 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{t("homeSections.giftCardFeatureInstant")}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/gift-cards/buy"
                className="inline-flex items-center gap-2 bg-secondary-200 hover:bg-secondary-100 text-white font-semibold rounded-lg px-6 py-3 transition-colors"
              >
                {t("homeSections.giftCardCta")}
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/gift-cards/balance"
                className="inline-flex items-center gap-2 border border-gray-300 hover:border-amber-800 text-gray-700 hover:text-amber-800 font-semibold rounded-lg px-6 py-3 transition-colors"
              >
                {t("homeSections.giftCardBalanceCta")}
              </Link>
            </div>
          </div>

          {/* Right: decorative card mockup */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-secondary-200 to-amber-900 flex items-center justify-center p-10 min-h-[220px]">
            <div className="w-full max-w-sm bg-white/10 backdrop-blur-sm border border-white/25 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-8">
                <Gift size={28} />
                <span className="text-xs uppercase tracking-widest opacity-80">
                  {t("homeSections.giftCardLabel")}
                </span>
              </div>
              <p className="text-2xl font-bold tracking-wide mb-1">I-COFFEE</p>
              <p className="text-sm opacity-80">{t("homeSections.giftCardMockupNote")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GiftCardPromoSection;
