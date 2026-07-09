// client/src/components/LimitedEditionSection.jsx
import React, { useState, useEffect } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import ProductCarousel from "./ProductCarousel";
import AxiosToastError from "../utils/AxiosToastError";
import { Sparkles } from "lucide-react";
import { useCountry } from "../context/CountryContext";

/**
 * Section component for displaying Limited Edition products.
 * Shows an eye-catching banner (using the first product's bannerText/bannerColor)
 * followed by a carousel of all limited edition products.
 */
const LimitedEditionSection = () => {
  const { t } = useCountry();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLimitedEditionProducts();
  }, []);

  const fetchLimitedEditionProducts = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getLimitedEditionProducts,
        data: { page: 1, limit: 12 },
      });

      const { data: responseData } = response;
      if (responseData.success && responseData.data) {
        setProducts(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  // Don't render the section at all if there are no limited edition products
  if (!loading && products.length === 0) return null;

  // Use the first product's banner settings for the section banner
  const bannerProduct = products[0];
  const bannerText = bannerProduct?.limitedEdition?.bannerText || t("product.limitedEdition");
  const bannerColor = bannerProduct?.limitedEdition?.bannerColor || "#c8102e";

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 mb-6">
        {/* Banner */}
        <div
          className="rounded-xl px-6 py-5 flex items-center gap-3 shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${bannerColor} 0%, ${bannerColor}cc 100%)`,
          }}
        >
          <Sparkles className="text-white w-7 h-7 flex-shrink-0" />
          <div>
            <h2 className="text-white text-lg md:text-2xl font-bold tracking-wide">
              {bannerText}
            </h2>
            <p className="text-white/80 text-sm">
              {t("homeSections.limitedEditionSubtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <ProductCarousel
        products={products}
        title=""
        subtitle=""
        autoplay={false}
        itemsPerSlide={4}
      />
    </section>
  );
};

export default LimitedEditionSection;
