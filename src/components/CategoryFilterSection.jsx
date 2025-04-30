import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import CategoryFilterProductCarousel from './CategoryFilterProductCarousel';
import AxiosToastError from '../utils/AxiosToastError';

/**
 * Section component that displays products filtered by category
 */
const CategoryFilterSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Get categories from Redux store
  const categories = useSelector((state) => state.product.allCategory) || [];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getProduct,
        data: {
          page: 1,
          limit: 20, // Fetch more products to ensure we have some for each category
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
      <CategoryFilterProductCarousel
        products={products}
        categories={categories}
        title="Shop by Category"
        itemsPerSlide={4}
      />
    </section>
  );
};

export default CategoryFilterSection;
