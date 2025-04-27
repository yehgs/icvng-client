import React, { useEffect, useState, useRef } from 'react';
import CardLoading from '../components/CardLoading';
import SummaryApi from '../common/SummaryApi';
import Axios from '../utils/Axios';
import AxiosToastError from '../utils/AxiosToastError';
import CardProduct from '../components/CardProduct';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  useLocation,
  useSearchParams,
  useParams,
  Link,
} from 'react-router-dom';
import noDataImage from '../assets/nothing here yet.webp';
import ShopFilter from '../components/ShopFilter';
import { FaSearch, FaChevronRight } from 'react-icons/fa';
import useUrlFilters from '../utils/urlFilterHandler';

const ShopPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [urlLoading, setUrlLoading] = useState(true);
  const loadingArrayCard = new Array(10).fill(null);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const location = useLocation();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchText = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(searchText);
  const firstLoadRef = useRef(true);
  const isUrlFilterActive = Boolean(params.categorySlug || params.brandSlug);

  // Get URL filter handling functions
  const { resolveFiltersFromUrl, generatePageTitle, generateBreadcrumbs } =
    useUrlFilters();
  const [pageTitle, setPageTitle] = useState('Shop');
  const [breadcrumbs, setBreadcrumbs] = useState([
    { label: 'Home', url: '/' },
    { label: 'Shop', url: '/shop' },
  ]);

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

  useEffect(() => {
    const loadInitialData = async () => {
      // If there are URL filters, wait for them to resolve
      if (isUrlFilterActive) {
        if (!urlLoading) {
          fetchData(true);
        }
      } else {
        // Otherwise, load data immediately
        fetchData(true);
      }
      firstLoadRef.current = false;
    };

    if (firstLoadRef.current) {
      loadInitialData();
    }
  }, [urlLoading]);

  useEffect(() => {
    if (!urlLoading && firstLoadRef.current) {
      fetchData(true);
      firstLoadRef.current = false;
    }
  }, [urlLoading]);

  useEffect(() => {
    const loadUrlFilters = async () => {
      if (isUrlFilterActive) {
        setUrlLoading(true);
        try {
          const { urlFilters, displayNames } = await resolveFiltersFromUrl();

          // Update filter state with URL values
          setActiveFilters((prev) => ({
            ...prev,
            ...urlFilters,
          }));

          // Set page title and breadcrumbs
          setPageTitle(generatePageTitle(displayNames));
          setBreadcrumbs(generateBreadcrumbs(displayNames));
        } catch (error) {
          console.error('Error loading URL filters:', error);
        } finally {
          setUrlLoading(false);
        }
      }
    };

    loadUrlFilters();
  }, [location.pathname]);

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

    if (!urlLoading) {
      fetchData(true); // Reset to page 1 when search changes
    }
  }, [searchText, urlLoading]);

  useEffect(() => {
    if (page > 1) {
      fetchData();
    }
  }, [page]);

  // Initial data load after URL filters are resolved
  useEffect(() => {
    if (!urlLoading && firstLoadRef.current) {
      fetchData(true);
      firstLoadRef.current = false;
    }
  }, [urlLoading]);

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
        {/* Breadcrumbs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <nav className="flex text-sm">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <Link
                  to={crumb.url}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {crumb.label}
                </Link>
                {index < breadcrumbs.length - 1 && (
                  <FaChevronRight
                    className="mx-2 text-gray-400 self-center"
                    size={12}
                  />
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Filter Column - Sticky on desktop */}
          <div className="lg:w-1/4 lg:pr-4">
            <div className="lg:sticky lg:top-20">
              {loading && urlLoading ? (
                <div className="bg-white p-8 rounded-lg shadow-sm mb-4 text-center">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-1/2 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                  </div>
                </div>
              ) : (
                <ShopFilter
                  onApplyFilters={handleApplyFilters}
                  initialFilters={activeFilters}
                />
              )}
            </div>
          </div>

          {/* Product Column */}
          <div className="lg:w-3/4">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h1 className="text-xl font-bold">{pageTitle}</h1>
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
                  {(loading || urlLoading) &&
                    loadingArrayCard.map((_, index) => (
                      <CardLoading key={`loading-${index}`} />
                    ))}
                </div>
              </InfiniteScroll>

              {/* No results message */}
              {!data.length && !loading && !urlLoading && (
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
