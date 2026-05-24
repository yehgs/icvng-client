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
import { useDispatch } from "react-redux";
import { setCompatibleSystemFilter, setCategoryFilter, setBrandFilter } from "../store/filterSlice";

const EnhancedShopPage = () => {
  const dispatch = useDispatch();

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

  // Initialize search input from URL on mount AND whenever ?q= changes
  // This handles: direct navigation, "See all results" click, browser back/forward
  useEffect(() => {
    const searchText = searchParams.get("q") || "";
    setSearchInput(searchText);
    updateSearchTerm(searchText);
  }, [searchParams]);

  // Read compatible system (+ optional category + brand) from URL query params.
  // Runs on every URL change AFTER initial mount. Dispatches to Redux AND directly
  // triggers a fetch so the mega menu nav always applies fresh filters immediately.
  useEffect(() => {
    const csId = searchParams.get("compatibleSystem") || "";
    const csName = searchParams.get("compatibleSystemName") || "";
    const catId = searchParams.get("category") || "";
    const catName = searchParams.get("categoryName") || "";
    const brandId = searchParams.get("brand") || "";
    const brandName = searchParams.get("brandName") || "";

    // Sync into Redux for the sidebar filter to reflect correctly
    dispatch(setCompatibleSystemFilter({
      compatibleSystemId: csId,
      compatibleSystemName: csName,
      compatibleSystemSlug: "",
    }));

    dispatch(setCategoryFilter({
      categoryId: catId,
      categoryName: catName,
      categorySlug: "",
    }));

    dispatch(setBrandFilter({
      brandId,
      brandName,
      brandSlug: "",
      replace: true,
    }));

    // Skip on initial mount — that's handled by the mount useEffect above
    // to avoid a race condition where both effects fetch simultaneously and
    // the mount effect (with no overrides) overwrites the filtered results.
    if (firstLoadRef.current) return;

    // After initial mount: fetch immediately with the URL values as overrides
    if (csId || catId || brandId) {
      fetchProducts(true, null, {
        compatibleSystem: csId || undefined,
        category: catId || undefined,
        brand: brandId ? [brandId] : undefined,
      });
    }
  }, [searchParams]);

  // Fetch products when component mounts — reads all URL params immediately
  // so the very first load is correctly filtered (fixes first-click menu bug)
  useEffect(() => {
    const initialLoad = async () => {
      if (firstLoadRef.current) {
        firstLoadRef.current = false; // mark done BEFORE fetching so no second fetch overwrites

        const urlSearch = searchParams.get("q") || "";
        const csId = searchParams.get("compatibleSystem") || "";
        const catId = searchParams.get("category") || "";
        const brandId = searchParams.get("brand") || "";

        const overrides = {};
        if (csId) overrides.compatibleSystem = csId;
        if (catId) overrides.category = catId;
        if (brandId) overrides.brand = [brandId];

        fetchProducts(true, urlSearch, Object.keys(overrides).length > 0 ? overrides : null);
      }
    };
    initialLoad();
    return () => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, []);

  // Re-fetch immediately whenever the ?q= param changes on the same /shop route.
  // This is what fires when "See all results" is clicked (same pathname, new ?q=).
  const prevQRef = useRef(searchParams.get("q") || "");
  useEffect(() => {
    const currentQ = searchParams.get("q") || "";
    // Only act after the initial mount fetch is done, and only if q actually changed
    if (!firstLoadRef.current && currentQ !== prevQRef.current) {
      prevQRef.current = currentQ;
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = setTimeout(() => {
        fetchProducts(true, currentQ);
      }, 50);
    } else {
      // Update ref even on first render so subsequent changes are detected
      prevQRef.current = currentQ;
    }
  }, [searchParams]);

  // Debounced effect for non-search filter changes (category, brand, sort etc.)
  // The search term change from URL is handled by the searchParams effect above.
  useEffect(() => {
    // Don't trigger on initial render
    if (firstLoadRef.current) return;

    // Don't fetch when URL is still processing
    if (urlState.isLoading || isProcessingUrl) {
      console.log("Skipping fetch during URL processing");
      return;
    }

    // If the search term change matches the current URL q param,
    // it was already handled by the searchParams effect — skip
    const urlQ = searchParams.get("q") || "";
    if (activeFilters.search === urlQ && activeFilters.search === prevQRef.current) {
      // This change was triggered by our URL sync — don't double-fetch
      return;
    }

    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);

    fetchTimeoutRef.current = setTimeout(() => {
      fetchProducts(true);
    }, 300);

    return () => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
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
    activeFilters.compatibleSystem,
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
  // filterOverrides: pass URL-resolved values directly to bypass Redux timing lag
  const fetchProducts = async (resetPage = false, urlSearchOverride = null, filterOverrides = null) => {
    try {
      setLoading(true);
      const currentPage = resetPage ? 1 : page;

      if (resetPage) {
        setPage(1);
      }

      let sortValue = activeFilters.sort;
      if (sortValue === "newest") {
        sortValue = "";
      }

      const searchTerm = urlSearchOverride !== null ? urlSearchOverride : activeFilters.search;

      // Merge Redux state with any direct overrides (overrides win — no timing lag)
      const merged = {
        category: activeFilters.category,
        subCategory: activeFilters.subCategory,
        brand: activeFilters.brand,
        compatibleSystem: activeFilters.compatibleSystem,
        productType: activeFilters.productType,
        roastLevel: activeFilters.roastLevel,
        intensity: activeFilters.intensity,
        blend: activeFilters.blend,
        minPrice: activeFilters.minPrice,
        maxPrice: activeFilters.maxPrice,
        ...(filterOverrides || {}),
      };

      const response = await Axios({
        ...SummaryApi.searchProduct,
        data: {
          search: searchTerm,
          page: currentPage,
          productType: merged.productType?.length > 0 ? merged.productType : undefined,
          category: merged.category || undefined,
          subCategory: merged.subCategory || undefined,
          brand: merged.brand?.length > 0 ? merged.brand : undefined,
          compatibleSystem: merged.compatibleSystem || undefined,
          roastLevel: merged.roastLevel?.length > 0 ? merged.roastLevel : undefined,
          intensity: merged.intensity?.length > 0 ? merged.intensity : undefined,
          blend: merged.blend?.length > 0 ? merged.blend : undefined,
          minPrice: merged.minPrice || undefined,
          maxPrice: merged.maxPrice || undefined,
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
    applyFilters(filters);
    // Directly fetch with the new filter values — don't wait for Redux to propagate
    fetchProducts(true, null, {
      category: filters.category || undefined,
      subCategory: filters.subCategory || undefined,
      brand: filters.brand?.length > 0 ? filters.brand : undefined,
      compatibleSystem: filters.compatibleSystem || undefined,
      productType: filters.productType?.length > 0 ? filters.productType : undefined,
      roastLevel: filters.roastLevel?.length > 0 ? filters.roastLevel : undefined,
      intensity: filters.intensity?.length > 0 ? filters.intensity : undefined,
      blend: filters.blend?.length > 0 ? filters.blend : undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
    });
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
