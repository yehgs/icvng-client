import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchCampaignLanding, fetchCampaignProducts } from "@yehgs/icvng-core/campaigns";
import Axios from "../utils/Axios";
import { useCountry } from "../context/CountryContext";
import { useCampaign } from "../context/CampaignContext";
import CardProduct from "../components/CardProduct";
import CampaignBlocks from "../components/campaign/CampaignBlocks";
import CampaignCountdown from "../components/campaign/CampaignCountdown";

const PAGE_SIZE = 24;

/**
 * /campaign/:slug — landing page. The API only answers for a campaign that is
 * live in THIS storefront's country, so an expired / paused / foreign-country
 * link shows the friendly "not available" state, never a stale offer.
 */
export default function CampaignLandingPage() {
  const { slug } = useParams();
  const { t, language, countryCode } = useCountry();
  const { epoch } = useCampaign();
  const [state, setState] = useState({ status: "loading", campaign: null });
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let alive = true;
    setState({ status: "loading", campaign: null });
    setProducts([]); setPage(1); setPages(1);
    (async () => {
      const landing = await fetchCampaignLanding({ apiClient: Axios, slug });
      if (!alive) return;
      if (!landing?.campaign) { setState({ status: "unavailable", campaign: null }); return; }
      setState({ status: "ready", campaign: landing.campaign });
      const res = await fetchCampaignProducts({ apiClient: Axios, slug, page: 1, limit: PAGE_SIZE });
      if (!alive) return;
      setProducts(res.products); setPages(res.pagination.pages || 1);
    })();
    return () => { alive = false; };
  }, [slug, language, countryCode, epoch]);

  const loadMore = async () => {
    setLoadingMore(true);
    const next = page + 1;
    const res = await fetchCampaignProducts({ apiClient: Axios, slug, page: next, limit: PAGE_SIZE });
    setProducts((p) => [...p, ...res.products]);
    setPage(next); setPages(res.pagination.pages || pages);
    setLoadingMore(false);
  };

  if (state.status === "loading") {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-4" aria-busy="true">
        <div className="h-40 rounded-xl bg-gray-100 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-64 rounded-lg bg-gray-100 animate-pulse" />)}</div>
      </div>
    );
  }
  if (state.status === "unavailable") {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">{t("campaign.unavailableTitle")}</h1>
        <p className="text-gray-600 mb-6">{t("campaign.unavailableBody")}</p>
        <Link to="/shop" className="inline-block px-6 py-3 rounded-lg bg-green-700 text-white font-medium hover:bg-green-800">{t("cart.continueShopping")}</Link>
      </div>
    );
  }

  const c = state.campaign;
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--campaign-background, #fff)", color: "var(--campaign-text, inherit)" }}>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">{c.name}</h1>
          {c.tagline && <p className="mt-2 text-lg opacity-90">{c.tagline}</p>}
          {c.description && <p className="mt-2 max-w-2xl mx-auto text-sm opacity-80">{c.description}</p>}
          {c.showCountdown && <CampaignCountdown endsAt={c.endsAt} className="block mt-3 text-lg" />}
        </header>
        <CampaignBlocks campaign={c} />
        <section aria-labelledby="campaign-products">
          <h2 id="campaign-products" className="text-xl font-bold mb-3">{t("campaign.dealsHeading")}</h2>
          {products.length === 0 ? (
            <p className="text-center opacity-70 py-10">{t("campaign.noProducts")}</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((p) => <CardProduct key={p._id} data={p} />)}
            </div>
          )}
          {page < pages && (
            <div className="text-center mt-6">
              <button onClick={loadMore} disabled={loadingMore} className="px-6 py-2 rounded-md border font-medium hover:bg-gray-50 disabled:opacity-50">
                {loadingMore ? t("common.loading") : t("campaign.loadMore")}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
