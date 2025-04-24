import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { baseURL } from '../common/SummaryApi';
import Loading from '../components/Loading';
import NoData from '../components/NoData';
import CardProduct from '../components/common/CardProduct';
import { IoSearchOutline, IoFilterOutline } from 'react-icons/io5';
import { FaSortAmountDown, FaSortAmountUpAlt } from 'react-icons/fa';

// Create a public axios instance that doesn't require authentication
const publicAxios = axios.create({
  baseURL: baseURL,
});

// Add optional error handler for debugging
publicAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const ShopPage = () => {
  const [productData, setProductData] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter states
  const [productType, setProductType] = useState('');
  const [sortBy, setSortBy] = useState(''); // 'price-asc', 'price-desc', 'name-asc', 'name-desc'
  const [showFilter, setShowFilter] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // More items per page for grid layout

  const fetchProductData = async () => {
    try {
      setLoading(true);
      // Use a POST request with body parameters to match the controller
      const response = await publicAxios.post('/api/products/get', {
        page: 1,
        limit: 100, // Fetch more to handle client-side filtering and pagination
        search: '',
        productType: productType || undefined,
        sortBy: sortBy || undefined,
        // You can add more filters based on your API
        // Make sure publish status is included if needed in your backend
      });

      if (response.data.success) {
        setProductData(response.data.data);
        setFilteredProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  // Filter and sort products
  useEffect(() => {
    // If we want to refetch from the API when filters change, we can call
    // fetchProductData() here, but let's stick with client-side filtering for now

    let filtered = [...productData];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply product type filter
    if (productType) {
      filtered = filtered.filter(
        (product) => product.productType === productType
      );
    }

    // Apply sorting
    if (sortBy) {
      const [field, direction] = sortBy.split('-');

      filtered.sort((a, b) => {
        if (field === 'price') {
          // Calculate prices with discount
          const priceA = a.price * (1 - a.discount / 100);
          const priceB = b.price * (1 - b.discount / 100);

          return direction === 'asc' ? priceA - priceB : priceB - priceA;
        } else if (field === 'name') {
          return direction === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        }
        return 0;
      });
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, productType, sortBy, productData]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Generate page numbers (show limited range around current page)
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than or equal to maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Calculate range of pages to show
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push('...');
      }

      // Add pages in range
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add last page and ellipsis if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Products</h1>
        <p className="text-gray-600">
          Discover our premium selection of coffee, tea, and accessories
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <IoSearchOutline
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <IoFilterOutline size={18} />
              <span>Filters</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Sort By</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>

        {/* Expandable filters */}
        {showFilter && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="font-medium mb-2">Product Type</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setProductType('')}
                className={`px-3 py-1 rounded-full text-sm ${
                  productType === ''
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setProductType('COFFEE')}
                className={`px-3 py-1 rounded-full text-sm ${
                  productType === 'COFFEE'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Coffee
              </button>
              <button
                onClick={() => setProductType('COFFEE_BEANS')}
                className={`px-3 py-1 rounded-full text-sm ${
                  productType === 'COFFEE_BEANS'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Coffee Beans
              </button>
              <button
                onClick={() => setProductType('TEA')}
                className={`px-3 py-1 rounded-full text-sm ${
                  productType === 'TEA'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Tea
              </button>
              <button
                onClick={() => setProductType('MACHINE')}
                className={`px-3 py-1 rounded-full text-sm ${
                  productType === 'MACHINE'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Machines
              </button>
              <button
                onClick={() => setProductType('ACCESSORIES')}
                className={`px-3 py-1 rounded-full text-sm ${
                  productType === 'ACCESSORIES'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Accessories
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results summary */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          Showing {filteredProducts.length > 0 ? indexOfFirstItem + 1 : 0} to{' '}
          {Math.min(indexOfLastItem, filteredProducts.length)} of{' '}
          {filteredProducts.length} products
        </p>
      </div>

      {/* Product Grid */}
      {loading ? (
        <Loading />
      ) : filteredProducts.length === 0 ? (
        <NoData message="No products found. Try adjusting your filters." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentProducts.map((product) => (
            <CardProduct key={product._id} data={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredProducts.length > itemsPerPage && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-md border disabled:opacity-50 hover:bg-gray-50 transition-colors"
              aria-label="Previous page"
            >
              Previous
            </button>

            {getPageNumbers().map((number, index) =>
              number === '...' ? (
                <span key={`ellipsis-${index}`} className="px-3 py-2">
                  ...
                </span>
              ) : (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  className={`px-4 py-2 rounded-md ${
                    number === currentPage
                      ? 'bg-amber-600 text-white'
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {number}
                </button>
              )
            )}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-md border disabled:opacity-50 hover:bg-gray-50 transition-colors"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ShopPage;
