import React, { useState, useEffect } from 'react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import ProductCarousel from './ProductCarousel';
import AxiosToastError from '../utils/AxiosToastError';

/**
 * Section component for displaying new arrival products
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
      const response = await Axios({
        ...SummaryApi.getProduct,
        data: {
          page: 1,
          limit: 8, // Fetch 8 products
          sort: { createdAt: -1 }, // Sort by creation date (newest first)
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
    <section className="py-8 bg-white">
      <ProductCarousel
        products={products}
        title="New Arrivals"
        subtitle="Check out our latest products"
        autoplay={true}
        autoplaySpeed={6000}
        itemsPerSlide={4}
      />
    </section>
  );
};

export default NewArrivalsSection;
