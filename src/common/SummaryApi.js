//client
export const baseURL = import.meta.env.VITE_API_URL;

const SummaryApi = {
  register: {
    url: '/api/user/register',
    method: 'post',
  },
  login: {
    url: '/api/user/login',
    method: 'post',
  },
  forgot_password: {
    url: '/api/user/forgot-password',
    method: 'put',
  },
  forgot_password_otp_verification: {
    url: 'api/user/verify-forgot-password-otp',
    method: 'put',
  },
  resetPassword: {
    url: '/api/user/reset-password',
    method: 'put',
  },
  refreshToken: {
    url: 'api/user/refresh-token',
    method: 'post',
  },
  userDetails: {
    url: '/api/user/user-details',
    method: 'get',
  },
  logout: {
    url: '/api/user/logout',
    method: 'get',
  },
  uploadAvatar: {
    url: '/api/user/upload-avatar',
    method: 'put',
  },
  uploadImage: {
    url: '/api/file/upload',
    method: 'post',
  },
  updateUserDetails: {
    url: '/api/user/update-user',
    method: 'put',
  },
  addCategory: {
    url: '/api/category/add-category',
    method: 'post',
  },
  getCategoryStructure: {
    url: '/api/product/category-structure',
    method: 'get',
  },
  getCategory: {
    url: '/api/category/get',
    method: 'get',
  },
  updateCategory: {
    url: '/api/category/update',
    method: 'put',
  },
  deleteCategory: {
    url: '/api/category/delete',
    method: 'delete',
  },
  addTags: {
    url: '/api/tag/add',
    method: 'post',
  },
  getTags: {
    url: '/api/tag/get',
    method: 'get',
  },
  updateTags: {
    url: '/api/tag/update',
    method: 'put',
  },
  deleteTags: {
    url: '/api/tag/delete',
    method: 'delete',
  },
  addCoffeeRoastArea: {
    url: '/api/coffee-roast-area/add',
    method: 'post',
  },
  getCoffeeRoastAreas: {
    url: '/api/coffee-roast-area/get',
    method: 'get',
  },
  updateCoffeeRoastArea: {
    url: '/api/coffee-roast-area/update',
    method: 'put',
  },
  deleteCoffeeRoastArea: {
    url: '/api/coffee-roast-area/delete',
    method: 'delete',
  },
  addAttribute: {
    url: '/api/attribute/add',
    method: 'post',
  },
  getAttribute: {
    url: '/api/attribute/get',
    method: 'get',
  },
  updateAttribute: {
    url: '/api/attribute/update',
    method: 'put',
  },
  deleteAttribute: {
    url: '/api/attribute/delete',
    method: 'delete',
  },
  createSubCategory: {
    url: '/api/subcategory/create',
    method: 'post',
  },
  getSubCategory: {
    url: '/api/subcategory/get',
    method: 'post',
  },
  updateSubCategory: {
    url: '/api/subcategory/update',
    method: 'put',
  },
  deleteSubCategory: {
    url: '/api/subcategory/delete',
    method: 'delete',
  },
  addBrand: {
    url: '/api/brand/add-brand',
    method: 'post',
  },
  getBrand: {
    url: '/api/brand/get',
    method: 'get',
  },
  updateBrand: {
    url: '/api/brand/update',
    method: 'put',
  },
  deleteBrand: {
    url: '/api/brand/delete',
    method: 'delete',
  },
  createProduct: {
    url: '/api/product/create',
    method: 'post',
  },
  getProduct: {
    url: '/api/product/get',
    method: 'post',
  },
  getProductByCategory: {
    url: '/api/product/get-product-by-category',
    method: 'post',
  },
  getProductByCategoryAndSubCategory: {
    url: '/api/product/get-pruduct-by-category-and-subcategory',
    method: 'post',
  },
  getProductDetails: {
    url: '/api/product/get-product-details',
    method: 'post',
  },
  updateProductDetails: {
    url: '/api/product/update-product-details',
    method: 'put',
  },
  deleteProduct: {
    url: '/api/product/delete-product',
    method: 'delete',
  },
  searchProduct: {
    url: '/api/product/search-product',
    method: 'post',
  },
  // Cart endpoints
  addTocart: {
    url: '/api/cart/create',
    method: 'post',
  },
  getCartItem: {
    url: '/api/cart/get',
    method: 'get',
  },
  updateCartItemQty: {
    url: '/api/cart/update-qty',
    method: 'put',
  },
  deleteCartItem: {
    url: '/api/cart/delete-cart-item',
    method: 'delete',
  },
  validateCart: {
    url: '/api/cart/validate',
    method: 'get',
  },
  createAddress: {
    url: '/api/address/create',
    method: 'post',
  },
  getAddress: {
    url: '/api/address/get',
    method: 'get',
  },
  updateAddress: {
    url: '/api/address/update',
    method: 'put',
  },
  disableAddress: {
    url: '/api/address/disable',
    method: 'delete',
  },
  // Payment and Order endpoints
  directBankTransferOrder: {
    url: '/api/order/direct-bank-transfer',
    method: 'post',
  },
  payment_url: {
    url: '/api/order/checkout',
    method: 'post',
  },
  flutterwavePaymentController: {
    url: '/api/order/flutterwave-payment',
    method: 'post',
  },
  getOrderItems: {
    url: '/api/order/order-list',
    method: 'get',
  },
  addSlider: {
    url: '/api/slider/add',
    method: 'POST',
  },
  getAllSliders: {
    url: '/api/slider/all',
    method: 'GET',
  },
  getActiveSliders: {
    url: '/api/slider/active',
    method: 'GET',
  },
  updateSlider: {
    url: '/api/slider/update',
    method: 'PUT',
  },
  deleteSlider: {
    url: '/api/slider/delete',
    method: 'DELETE',
  },
  createProductRequest: {
    url: '/api/product-request/create',
    method: 'POST',
  },
  getUserProductRequests: {
    url: '/api/product-request/user',
    method: 'GET',
  },
  getAllProductRequests: {
    url: '/api/product-request/all',
    method: 'GET',
  },
  getProductRequestDetails: (requestId) => ({
    url: `/api/product-request/details/${requestId}`,
    method: 'GET',
  }),
  updateProductRequestStatus: {
    url: '/api/product-request/update-status',
    method: 'PUT',
  },
  deleteProductRequest: {
    url: '/api/product-request/delete',
    method: 'DELETE',
  },
  getRatings: {
    url: '/api/rating/get',
    method: 'GET',
  },
  addRating: {
    url: '/api/rating/add',
    method: 'POST',
  },
  updateRating: {
    url: '/api/rating/update',
    method: 'PUT',
  },
  deleteRating: {
    url: '/api/rating/delete',
    method: 'DELETE',
  },
  getAllRatingsAdmin: {
    url: '/api/rating/admin/all',
    method: 'GET',
  },
  addBanner: {
    url: '/api/banner/add',
    method: 'post',
  },
  getBanner: {
    url: '/api/banner/get',
    method: 'get',
  },
  getActiveBanners: {
    url: '/api/banner/active',
    method: 'get',
  },
  updateBanner: {
    url: '/api/banner/update',
    method: 'put',
  },
  deleteBanner: {
    url: '/api/banner/delete',
    method: 'delete',
  },

  addToWishlist: {
    url: '/api/wishlist/add',
    method: 'POST',
  },
  removeFromWishlist: {
    url: '/api/wishlist/remove',
    method: 'DELETE',
  },
  getWishlist: {
    url: '/api/wishlist/get',
    method: 'GET',
  },
  toggleWishlist: {
    url: '/api/wishlist/toggle',
    method: 'POST',
  },
  clearWishlist: {
    url: '/api/wishlist/clear',
    method: 'DELETE',
  },
  checkWishlist: (productId) => ({
    url: `/api/wishlist/check/${productId}`,
    method: 'GET',
  }),

  // Compare endpoints
  addToCompare: {
    url: '/api/compare/add',
    method: 'POST',
  },
  removeFromCompare: {
    url: '/api/compare/remove',
    method: 'DELETE',
  },
  getCompareList: {
    url: '/api/compare/get',
    method: 'GET',
  },
  toggleCompare: {
    url: '/api/compare/toggle',
    method: 'POST',
  },
  clearCompareList: {
    url: '/api/compare/clear',
    method: 'DELETE',
  },
  checkCompare: (productId) => ({
    url: `/api/compare/check/${productId}`,
    method: 'GET',
  }),

  // Exchange Rate endpoints
  getExchangeRates: {
    url: '/api/exchange-rate/get',
    method: 'GET',
  },
  fetchRatesFromAPI: {
    url: '/api/exchange-rate/fetch-api-rates',
    method: 'POST',
  },
  createOrUpdateRate: {
    url: '/api/exchange-rate/create-update',
    method: 'POST',
  },
  getSpecificRate: (baseCurrency, targetCurrency) => ({
    url: `/api/exchange-rates/rate/${baseCurrency}/${targetCurrency}`,
    method: 'GET',
  }),
  deleteExchangeRate: {
    url: '/api/exchange-rates/delete',
    method: 'DELETE',
  },
  getSupportedCurrencies: {
    url: '/api/exchange-rates/currencies',
    method: 'GET',
  },
  convertCurrency: {
    url: '/api/exchange-rates/convert',
    method: 'POST',
  },
  getExchangeRateStats: {
    url: '/api/exchange-rates/stats',
    method: 'GET',
  },
  getStaleRates: {
    url: '/api/exchange-rates/stale',
    method: 'GET',
  },
  bulkUpdateRates: {
    url: '/api/exchange-rates/bulk-update',
    method: 'POST',
  },
};

export default SummaryApi;
