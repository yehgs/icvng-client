import React, { useEffect, useState, useRef } from 'react';
import CardLoading from '../components/CardLoading';
import SummaryApi from '../common/SummaryApi';
import Axios from '../utils/Axios';
import AxiosToastError from '../utils/AxiosToastError';
import CardProduct from '../components/CardProduct';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useLocation, useSearchParams } from 'react-router-dom';
import noDataImage from '../assets/nothing here yet.webp';
import ShopFilter from '../components/ShopFilter';
import { FaSearch } from 'react-icons/fa';

const ShopPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadingArrayCard = new Array(10).fill(null);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchText = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(searchText);
  const firstLoadRef = useRef(true);

  // Filter state
  const [activeFilters, setActiveFilters] = useState({
    productType: [],
    category: '',
    subCategory: '',
    brand: [],
    roastLevel: [],
    intensity: [],
    blend: [],
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
    search: searchText,
  });

  const fetchData = async (resetPage = false) => {
    try {
      setLoading(true);
      const currentPage = resetPage ? 1 : page;

      if (resetPage) {
        setPage(1);
      }

      // Convert the sort values to API values
      let sortValue = activeFilters.sort;
      if (sortValue === 'newest') {
        // The API uses createdAt: -1 by default
        sortValue = '';
      }

      const response = await Axios({
        ...SummaryApi.searchProduct,
        data: {
          search: searchText,
          page: currentPage,
          productType:
            activeFilters.productType.length > 0
              ? activeFilters.productType
              : undefined,
          category: activeFilters.category || undefined,
          subCategory: activeFilters.subCategory || undefined,
          brand:
            activeFilters.brand.length > 0 ? activeFilters.brand : undefined,
          roastLevel:
            activeFilters.roastLevel.length > 0
              ? activeFilters.roastLevel
              : undefined,
          intensity:
            activeFilters.intensity.length > 0
              ? activeFilters.intensity
              : undefined,
          blend:
            activeFilters.blend.length > 0 ? activeFilters.blend : undefined,
          minPrice: activeFilters.minPrice || undefined,
          maxPrice: activeFilters.maxPrice || undefined,
          sort: sortValue,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        if (currentPage === 1) {
          setData(responseData.data);
        } else {
          setData((prev) => [...prev, ...responseData.data]);
        }
        setTotalPage(responseData.totalPage);
        setTotalCount(responseData.totalCount);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleApplyFilters = (filters) => {
    setActiveFilters({ ...filters, search: searchText });
    fetchData(true); // Reset to page 1 when filters change
  };

  useEffect(() => {
    // Reset active filters when search text changes
    setActiveFilters((prev) => ({
      ...prev,
      search: searchText,
    }));

    fetchData(true); // Reset to page 1 when search changes
  }, [searchText]);

  useEffect(() => {
    if (page > 1) {
      fetchData();
    }
  }, [page]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    } else {
      setSearchParams({});
    }
    setPage(1);
  };

  const handleFetchMore = () => {
    if (totalPage > page) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <section className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4">
        <div className="flex flex-col lg:flex-row">
          {/* Filter Column - Sticky on desktop */}
          <div className="lg:w-1/4 lg:pr-4">
            <div className="lg:sticky lg:top-20">
              <ShopFilter
                onApplyFilters={handleApplyFilters}
                initialFilters={activeFilters}
              />
            </div>
          </div>

          {/* Product Column */}
          <div className="lg:w-3/4">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h1 className="text-xl font-bold">
                    {searchText
                      ? `Search Results: "${searchText}"`
                      : 'All Coffee Products'}
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Showing {data.length} of {totalCount} products
                  </p>
                </div>

                {/* Search bar */}
                <form
                  onSubmit={handleSearch}
                  className="w-full md:w-auto mt-3 md:mt-0"
                >
                  <div className="relative">
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search coffee products..."
                      className="w-full md:w-64 pr-10 pl-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-700"
                    >
                      <FaSearch />
                    </button>
                  </div>
                </form>
              </div>

              <InfiniteScroll
                dataLength={data.length}
                next={handleFetchMore}
                hasMore={page < totalPage}
                loader={
                  <div className="text-center py-4">
                    Loading more products...
                  </div>
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  {data.map((product, index) => (
                    <CardProduct
                      data={product}
                      key={`product-${product._id}-${index}`}
                    />
                  ))}

                  {/* Loading placeholders */}
                  {loading &&
                    loadingArrayCard.map((_, index) => (
                      <CardLoading key={`loading-${index}`} />
                    ))}
                </div>
              </InfiniteScroll>

              {/* No results message */}
              {!data.length && !loading && (
                <div className="flex flex-col justify-center items-center w-full mx-auto py-10">
                  <img
                    src={noDataImage}
                    alt="No results found"
                    className="w-full h-full max-w-xs max-h-xs block"
                  />
                  <p className="font-semibold my-2">No products found</p>
                  <p className="text-gray-500 text-center">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopPage;
