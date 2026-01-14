import React, { useState, useEffect } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import ProductCarousel from "./ProductCarousel";
import AxiosToastError from "../utils/AxiosToastError";

/**
 * Section component for displaying featured products
 * Layout: Single row (6 on desktop, 4 on tablet, 2 on mobile)
 */
const FeaturedProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);

      // Use the dedicated featured products endpoint
      const response = await Axios({
        ...SummaryApi.getFeaturedProducts,
        data: {
          page: 1,
          limit: 24, // Fetch 24 products (6 per slide × 4 slides)
        },
      });

      const { data: responseData } = response;

      if (responseData.success && responseData.data) {
        // Randomize using Fisher-Yates shuffle
        const shuffledProducts = [...responseData.data];
        for (let i = shuffledProducts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledProducts[i], shuffledProducts[j]] = [
            shuffledProducts[j],
            shuffledProducts[i],
          ];
        }
        setProducts(shuffledProducts);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-8 bg-gray-50">
      <ProductCarousel
        products={products}
        title="Featured Products"
        subtitle="Our favorite selections for you"
        autoplay={false}
        itemsPerSlide={6} // Single row: 6 (desktop), 4 (tablet), 2 (mobile)
      />
    </section>
  );
};

export default FeaturedProductsSection;
