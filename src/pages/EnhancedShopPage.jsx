// icvng-client/src/pages/EnhancedShopPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import CardLoading from "../components/CardLoading";
import SummaryApi from "../common/SummaryApi";
import Axios from "../utils/Axios";
import AxiosToastError from "../utils/AxiosToastError";
import CardProduct from "../components/CardProduct";
import InfiniteScroll from "react-infinite-scroll-component";
import noDataImage from "../assets/nothing here yet.webp";
import ShopFilter from "../components/EnhancedShopFilter";
import { FaSearch, FaChevronRight } from "react-icons/fa";
import { useFilterState } from "../hooks/useFilterState.js";
import { useUrlFilters } from "../hooks/useUrlFilters.js";

const EnhancedShopPage = () => {
  // Products data state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Local UI state
  const loadingArrayCard = new Array(10).fill(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState("");
  const firstLoadRef = useRef(true);
  const fetchTimeoutRef = useRef(null);

  // Get filter state from centralized store
  const {
    activeFilters,
    filterData,
    urlState,
    applyFilters,
    updateSearchTerm,
    removeFilter,
    resetFilters,
  } = useFilterState();

  // Monitor URL parameters with enhanced useUrlFilters hook
  const { isProcessingUrl } = useUrlFilters();

  // Initialize search input from URL on mount
  useEffect(() => {
    const searchText = searchParams.get("q") || "";
    setSearchInput(searchText);
    updateSearchTerm(searchText);
  }, [searchParams]);

  // Fetch products when component mounts
  useEffect(() => {
    const initialLoad = async () => {
      if (firstLoadRef.current) {
        // Short delay to ensure all filter states are initialized
        setTimeout(() => {
          console.log("Initial product fetch with filters:", activeFilters);
          fetchProducts(true);
          firstLoadRef.current = false;
        }, 200);
      }
    };

    initialLoad();

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // Debounced effect for filter changes
  useEffect(() => {
    // Don't trigger on initial render
    if (firstLoadRef.current) {
      return;
    }

    // Don't fetch when URL is still processing
    if (urlState.isLoading || isProcessingUrl) {
      console.log("Skipping fetch during URL processing");
      return;
    }

    console.log("Filter changed, scheduling product fetch");

    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Set a debounce timeout for filter changes
    fetchTimeoutRef.current = setTimeout(() => {
      console.log("Executing debounced product fetch");
      fetchProducts(true);
    }, 300);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [
    activeFilters.category,
    activeFilters.subCategory,
    activeFilters.brand,
    activeFilters.search,
    activeFilters.sort,
    activeFilters.minPrice,
    activeFilters.maxPrice,
    activeFilters.productType,
    activeFilters.roastLevel,
    activeFilters.intensity,
    activeFilters.blend,
    urlState.isLoading,
    isProcessingUrl,
  ]);

  // Fetch more products when page changes
  useEffect(() => {
    if (page > 1 && !firstLoadRef.current) {
      fetchProducts(false);
    }
  }, [page]);

  // Fetch products with current filters
  const fetchProducts = async (resetPage = false) => {
    try {
      setLoading(true);
      const currentPage = resetPage ? 1 : page;

      if (resetPage) {
        setPage(1);
      }

      // Convert the sort values to API values
      let sortValue = activeFilters.sort;
      if (sortValue === "newest") {
        // The API uses createdAt: -1 by default
        sortValue = "";
      }

      console.log("Fetching products with filters:", {
        search: activeFilters.search,
        category: activeFilters.category,
        subCategory: activeFilters.subCategory,
        brand: activeFilters.brand,
        productType: activeFilters.productType,
        page: currentPage,
      });

      const response = await Axios({
        ...SummaryApi.searchProduct,
        data: {
          search: activeFilters.search,
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
        console.log(
          `Received ${responseData.data.length} products (page ${currentPage}/${responseData.totalPage})`,
        );

        if (currentPage === 1) {
          setProducts(responseData.data);
        } else {
          setProducts((prev) => [...prev, ...responseData.data]);
        }

        setTotalPage(responseData.totalPage);
        setTotalCount(responseData.totalCount);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes from the ShopFilter component
  const handleApplyFilters = (filters) => {
    console.log("Applying new filters from ShopFilter:", filters);
    applyFilters(filters);
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    } else {
      setSearchParams({});
    }

    updateSearchTerm(searchInput.trim());
  };

  // Load more products for infinite scroll
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
          <nav className="flex text-sm flex-wrap">
            {urlState.breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <Link
                  to={crumb.url}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {crumb.label}
                </Link>
                {index < urlState.breadcrumbs.length - 1 && (
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
            {/* <div className="lg:sticky lg:top-20"> */}
            <div>
              {loading && urlState.isLoading ? (
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
                  onRemoveFilter={removeFilter}
                  onResetFilters={resetFilters}
                />
              )}
            </div>
          </div>

          {/* Product Column */}
          <div className="lg:w-3/4">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h1 className="text-xl font-bold">{urlState.pageTitle}</h1>
                  <p className="text-gray-600 text-sm">
                    Showing {products.length} of {totalCount} products
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
                dataLength={products.length}
                next={handleFetchMore}
                hasMore={page < totalPage}
                loader={
                  <div className="text-center py-4">
                    Loading more products...
                  </div>
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  {products.map((product, index) => (
                    <CardProduct
                      data={product}
                      key={`product-${product._id}-${index}`}
                    />
                  ))}

                  {/* Loading placeholders */}
                  {(loading || urlState.isLoading) &&
                    loadingArrayCard.map((_, index) => (
                      <CardLoading key={`loading-${index}`} />
                    ))}
                </div>
              </InfiniteScroll>

              {/* No results message */}
              {!products.length && !loading && !urlState.isLoading && (
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

export default EnhancedShopPage;
