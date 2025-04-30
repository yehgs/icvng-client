import React, { useEffect, useState } from 'react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import Loading from '../components/Loading';
import NoData from '../components/NoData';
import ConfirmBox from '../components/ConfirmBox';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import {
  FaStar,
  FaRegStar,
  FaSearch,
  FaFilter,
  FaSort,
  FaTrashAlt,
  FaEye,
} from 'react-icons/fa';
import { format, formatDistanceToNow } from 'date-fns';
import { DisplayPriceInNaira } from '../utils/DisplayPriceInNaira';

const AdminRatingsPage = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    productId: '',
    userId: '',
    minRating: '',
    maxRating: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch all ratings with pagination and filters
  const fetchRatings = async (page = 1) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: pagination.limit,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach(
        (key) =>
          (params[key] === '' || params[key] === null) && delete params[key]
      );

      const response = await Axios({
        ...SummaryApi.getAllRatingsAdmin,
        params,
      });

      if (response.data.success) {
        setRatings(response.data.data);
        setPagination({
          ...pagination,
          page: response.data.pagination.page,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages,
        });
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch when filters change
  useEffect(() => {
    fetchRatings(1); // Reset to first page when filters change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Search products
  const searchProducts = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await Axios({
        ...SummaryApi.searchProducts,
        params: { q: searchTerm },
      });

      if (response.data.success) {
        setSearchResults(response.data.data);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length > 2) {
      // Use debounce to avoid too many API calls
      clearTimeout(window.searchTimeout);
      window.searchTimeout = setTimeout(() => {
        searchProducts();
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  // Select product from search results
  const selectProduct = (product) => {
    setSelectedProduct(product);
    setFilters({ ...filters, productId: product._id });
    setSearchTerm(product.name);
    setSearchResults([]);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      productId: '',
      userId: '',
      minRating: '',
      maxRating: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setSelectedProduct(null);
    setSearchTerm('');
  };

  // Delete rating
  const handleDeleteRating = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteRating,
        data: { _id: selectedRating._id },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchRatings(pagination.page);
        setShowDeleteConfirm(false);
        setShowDetails(false);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  // Render stars for a rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i}>
          {i <= rating ? (
            <FaStar className="text-yellow-400" />
          ) : (
            <FaRegStar className="text-gray-300" />
          )}
        </span>
      );
    }
    return <div className="flex space-x-1">{stars}</div>;
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return dateString;
    }
  };

  // Get time ago
  const getTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  // Pagination controls
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchRatings(newPage);
    }
  };

  // Generate pagination buttons
  const getPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, pagination.page - Math.floor(maxButtons / 2));
    let endPage = Math.min(pagination.pages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            pagination.page === i
              ? 'bg-secondary-200 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center mt-4">
        <button
          onClick={() => handlePageChange(1)}
          disabled={pagination.page === 1}
          className={`px-3 py-1 mx-1 rounded ${
            pagination.page === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          First
        </button>
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className={`px-3 py-1 mx-1 rounded ${
            pagination.page === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Prev
        </button>

        {buttons}

        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.pages}
          className={`px-3 py-1 mx-1 rounded ${
            pagination.page === pagination.pages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Next
        </button>
        <button
          onClick={() => handlePageChange(pagination.pages)}
          disabled={pagination.page === pagination.pages}
          className={`px-3 py-1 mx-1 rounded ${
            pagination.page === pagination.pages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Last
        </button>
      </div>
    );
  };

  return (
    <section className="p-4">
      <div className="bg-white shadow-md flex items-center justify-between p-4 mb-4">
        <h2 className="font-semibold text-xl">Ratings & Reviews</h2>
        <div className="flex items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors mr-2"
          >
            <FaFilter className="mr-1" /> Filters
          </button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white shadow-md p-4 mb-4 rounded">
          <h3 className="font-medium mb-3">Filter Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Product Search */}
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Product</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search products..."
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-secondary-200"
                />
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {searchResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto">
                  {searchResults.map((product) => (
                    <div
                      key={product._id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => selectProduct(product)}
                    >
                      {product.image && product.image.length > 0 ? (
                        <img
                          src={product.image[0]}
                          alt={product.name}
                          className="w-8 h-8 object-cover rounded mr-2"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded mr-2 flex items-center justify-center">
                          <span className="text-xs text-gray-500">No img</span>
                        </div>
                      )}
                      <span>{product.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User ID filter */}
            <div>
              <label className="block text-sm font-medium mb-1">User ID</label>
              <input
                type="text"
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
                placeholder="Filter by user ID"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-secondary-200"
              />
            </div>

            {/* Rating Range */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Rating Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="minRating"
                  value={filters.minRating}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  min="1"
                  max="5"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-secondary-200"
                />
                <input
                  type="number"
                  name="maxRating"
                  value={filters.maxRating}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  min="1"
                  max="5"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-secondary-200"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <div className="flex space-x-2">
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="w-2/3 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-secondary-200"
                >
                  <option value="createdAt">Date</option>
                  <option value="rating">Rating</option>
                </select>
                <select
                  name="sortOrder"
                  value={filters.sortOrder}
                  onChange={handleFilterChange}
                  className="w-1/3 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-secondary-200"
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-end mt-4">
            <button
              onClick={resetFilters}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors mr-2"
            >
              Reset
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="bg-secondary-200 text-white px-4 py-2 rounded hover:bg-secondary-100 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Ratings Table */}
      {loading ? (
        <Loading />
      ) : ratings.length === 0 ? (
        <NoData message="No ratings found" />
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ratings.map((rating) => (
                  <tr key={rating._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {rating.product?.image &&
                        rating.product.image.length > 0 ? (
                          <img
                            src={rating.product.image[0]}
                            alt={rating.product.name}
                            className="w-10 h-10 object-cover rounded-md mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-md mr-3 flex items-center justify-center">
                            <span className="text-xs text-gray-500">
                              No image
                            </span>
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {rating.product?.name || 'Unknown Product'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {rating.user?.avatar ? (
                          <img
                            src={rating.user.avatar}
                            alt={rating.user.name}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded-full mr-2 flex items-center justify-center">
                            <span className="text-xs text-gray-500">
                              {rating.user?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {rating.user?.name || 'Unknown User'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {rating.user?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {renderStars(rating.rating)}
                        <span className="ml-2 text-sm text-gray-600">
                          {rating.rating}/5
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {rating.review || (
                          <span className="text-gray-400 italic">
                            No review
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(rating.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getTimeAgo(rating.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedRating(rating);
                          setShowDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRating(rating);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Rating"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && getPaginationButtons()}

          <div className="px-6 py-3 bg-gray-50 text-xs text-gray-500">
            Showing {ratings.length} of {pagination.total} ratings
          </div>
        </div>
      )}

      {/* Rating Details Modal */}
      {showDetails && selectedRating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Rating Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              {/* Product Details */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium mb-2">Product Information</h4>
                <div className="flex items-start mb-2">
                  {selectedRating.product?.image &&
                  selectedRating.product.image.length > 0 ? (
                    <img
                      src={selectedRating.product.image[0]}
                      alt={selectedRating.product.name}
                      className="w-16 h-16 object-cover rounded mr-3"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded mr-3 flex items-center justify-center">
                      <span className="text-xs text-gray-500">No image</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {selectedRating.product?.name || 'Unknown Product'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedRating.product?.price
                        ? DisplayPriceInNaira(selectedRating.product.price)
                        : 'No price'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Average Rating:{' '}
                      {selectedRating.product?.averageRating?.toFixed(1) ||
                        'N/A'}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Product ID:</span>{' '}
                  {selectedRating.product?._id}
                </p>
              </div>

              {/* User Details */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium mb-2">User Information</h4>
                <div className="flex items-center mb-2">
                  {selectedRating.user?.avatar ? (
                    <img
                      src={selectedRating.user.avatar}
                      alt={selectedRating.user.name}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                      <span className="text-sm text-gray-500">
                        {selectedRating.user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {selectedRating.user?.name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedRating.user?.email || 'No email'}
                    </p>
                    {selectedRating.user?.mobile && (
                      <p className="text-sm text-gray-600">
                        {selectedRating.user.mobile}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">User ID:</span>{' '}
                  {selectedRating.user?._id}
                </p>
              </div>
            </div>

            {/* Rating & Review Details */}
            <div className="bg-gray-50 p-4 rounded mb-4">
              <h4 className="font-medium mb-2">Rating & Review</h4>
              <div className="flex items-center mb-3">
                <span className="font-medium mr-2">Rating:</span>
                <div className="flex items-center">
                  {renderStars(selectedRating.rating)}
                  <span className="ml-2 text-gray-600">
                    ({selectedRating.rating}/5)
                  </span>
                </div>
              </div>

              {selectedRating.review ? (
                <div>
                  <p className="font-medium mb-1">Review:</p>
                  <p className="text-gray-700 bg-white p-3 rounded border">
                    {selectedRating.review}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No review provided</p>
              )}

              <div className="mt-3 text-sm text-gray-500">
                <p>
                  <span className="font-medium">Created:</span>{' '}
                  {formatDate(selectedRating.createdAt)}
                </p>
                {selectedRating.updatedAt !== selectedRating.createdAt && (
                  <p>
                    <span className="font-medium">Last Updated:</span>{' '}
                    {formatDate(selectedRating.updatedAt)}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDetails(false);
                  setShowDeleteConfirm(true);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete Rating
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedRating && (
        <ConfirmBox
          title="Delete Rating"
          message={`Are you sure you want to delete this rating by ${
            selectedRating.user?.name || 'Unknown User'
          } for the product "${
            selectedRating.product?.name || 'Unknown Product'
          }"? This action cannot be undone.`}
          close={() => setShowDeleteConfirm(false)}
          cancel={() => setShowDeleteConfirm(false)}
          confirm={handleDeleteRating}
        />
      )}
    </section>
  );
};

export default AdminRatingsPage;
