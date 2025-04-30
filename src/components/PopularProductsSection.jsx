import React, { useState, useEffect } from 'react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import ProductCarousel from './ProductCarousel';
import AxiosToastError from '../utils/AxiosToastError';

/**
 * Section component for displaying popular/best-selling products
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
      // For popular products, we might sort by average rating or sales count
      // Adjust based on your API capabilities
      const response = await Axios({
        ...SummaryApi.getProduct,
        data: {
          page: 1,
          limit: 8,
          sort: { averageRating: -1 }, // Sort by highest rated first
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        setProducts(responseData.data);
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
        title="Most Popular Products"
        subtitle="Loved by our customers"
        autoplay={true}
        autoplaySpeed={7000}
        itemsPerSlide={4}
      />
    </section>
  );
};

export default PopularProductsSection;
