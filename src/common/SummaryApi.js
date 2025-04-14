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
  CashOnDeliveryOrder: {
    url: '/api/order/cash-on-delivery',
    method: 'post',
  },
  payment_url: {
    url: '/api/order/checkout',
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
};

export default SummaryApi;
