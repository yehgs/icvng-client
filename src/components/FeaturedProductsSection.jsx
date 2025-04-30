import React, { useState, useEffect } from 'react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import ProductCarousel from './ProductCarousel';
import AxiosToastError from '../utils/AxiosToastError';

/**
 * Section component for displaying featured products
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
      // Assuming your API can filter featured products
      // You might need to adjust this based on your actual API
      const response = await Axios({
        ...SummaryApi.getProduct,
        data: {
          page: 1,
          limit: 8,
          featured: true, // Filter by featured flag
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
        title="Featured Products"
        subtitle="Our favorite selections for you"
        autoplay={false}
        itemsPerSlide={4}
      />
    </section>
  );
};

export default FeaturedProductsSection;
