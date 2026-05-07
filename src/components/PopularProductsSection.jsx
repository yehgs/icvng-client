import React, { useState, useEffect } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import ProductCarousel from "./ProductCarousel";
import AxiosToastError from "../utils/AxiosToastError";

/**
 * Section component for displaying popular/best-selling products
 * Layout: 2 rows (5+5 on desktop, 3+3 on tablet, 2+2 on mobile)
 * Products sorted by: 1) Average rating, 2) Review count, 3) Featured status
 */
const PopularProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularProducts();
  }, []);

  const fetchPopularProducts = async () => {
    try {
      setLoading(true);

      // Use the dedicated popular products endpoint
      // Backend sorts by averageRating DESC, reviewCount DESC, featured DESC
      const response = await Axios({
        ...SummaryApi.getPopularProducts,
        data: {
          page: 1,
          limit: 20, // Fetch 20 products (10 per slide × 2 slides for 2-row layout)
        },
      });

      const { data: responseData } = response;

      if (responseData.success && responseData.data) {
        console.log(
          `PopularProductsSection: Loaded ${responseData.data.length} popular products`,
        );
        setProducts(responseData.data);
      }
    } catch (error) {
      console.error("PopularProductsSection: Error fetching products", error);
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-8 bg-gray-50">
      <ProductCarousel
        products={products}
        title="Most Popular Products"
        subtitle="Loved by our customers"
        autoplay={true}
        autoplaySpeed={7000}
        itemsPerSlide={5}
      />
    </section>
  );
};

export default PopularProductsSection;
