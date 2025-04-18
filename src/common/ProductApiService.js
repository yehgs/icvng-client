import Axios from '../utils/Axios';

class ProductApiService {
  // Get filter options for the shop page
  async getFilterOptions() {
    try {
      const response = await Axios({
        url: '/api/product/filter-options',
        method: 'GET',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get filtered products
  async getFilteredProducts(filters, page = 1, limit = 16) {
    try {
      const response = await Axios({
        url: '/api/product/filtered',
        method: 'POST',
        data: { ...filters, page, limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get product by slug
  async getProductBySlug(slug) {
    try {
      const response = await Axios({
        url: `/api/product/${slug}`,
        method: 'GET',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ProductApiService();
