import React, { useState, useEffect } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import ProductCarousel from "./ProductCarousel";
import AxiosToastError from "../utils/AxiosToastError";

/**
 * Section component for displaying new arrival products
 * Layout: 2 rows (6+6 on desktop, 4+4 on tablet, 2+2 on mobile)
 */
const NewArrivalsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewArrivals();
  }, []);

  const fetchNewArrivals = async () => {
    try {
      setLoading(true);

      // Use searchProduct API to get newest products
      const response = await Axios({
        ...SummaryApi.searchProduct,
        data: {
          page: 1,
          limit: 24, // Fetch 24 products (12 per slide × 2 slides for 2-row layout)
          sort: "newest", // Sort by newest first
        },
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

  return (
    <section className="py-8 bg-white">
      <ProductCarousel
        products={products}
        title="New Arrivals"
        subtitle="Check out our latest products"
        autoplay={true}
        autoplaySpeed={6000}
        itemsPerSlide={6}
      />
    </section>
  );
};

export default NewArrivalsSection;
