import React, { useState, useEffect, useRef } from 'react';
import {
  useParams,
  useSearchParams,
  Link,
  useNavigate,
} from 'react-router-dom';
import CardLoading from '../components/CardLoading';
import SummaryApi from '../common/SummaryApi';
import Axios from '../utils/Axios';
import AxiosToastError from '../utils/AxiosToastError';
import CardProduct from '../components/CardProduct';
import InfiniteScroll from 'react-infinite-scroll-component';
import noDataImage from '../assets/nothing here yet.webp';
import ShopFilter from '../components/EnhancedShopFilter';
import { FaSearch, FaChevronRight } from 'react-icons/fa';

const CategoryDetailPage = () => {
  const navigate = useNavigate();
  const { categorySlug, subcategorySlug, brandSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchText = searchParams.get('q') || '';

  // Products data state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter and URL resolution state
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [brandId, setBrandId] = useState('');
  const [brandName, setBrandName] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [searchInput, setSearchInput] = useState(searchText);
  const [resolutionError, setResolutionError] = useState(null);

  // Additional filter state
  const [filters, setFilters] = useState({
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

  // UI state
  const loadingArrayCard = new Array(10).fill(null);
  const isInitialLoad = useRef(true);
  const apiRequestInProgress = useRef(false);
  const parametersResolved = useRef(false);
  const productsLoaded = useRef(false);

  // Log the actual URL parameters for debugging
  useEffect(() => {
    console.log('URL Parameters:', {
      categorySlug,
      subcategorySlug,
      brandSlug,
      fullPath: window.location.pathname,
    });

    // Reset state on URL change
    setResolutionError(null);
    parametersResolved.current = false;
    productsLoaded.current = false;

    // Reset the filter state when URL changes
    resetFilterState();

    // Begin parameter resolution
    resolveUrlParams();
  }, [categorySlug, subcategorySlug, brandSlug]);

  // Reset filter state (fix for Problem 2)
  const resetFilterState = () => {
    setCategoryId('');
    setCategoryName('');
    setSubcategoryId('');
    setSubcategoryName('');
    setBrandId('');
    setBrandName('');
    setPageTitle('All Products');
    setBreadcrumbs([
      { label: 'Home', url: '/' },
      { label: 'Shop', url: '/shop' },
    ]);

    // Only reset filter state that's not derived from URL
    setFilters((prevFilters) => ({
      ...prevFilters,
      productType: [],
      roastLevel: [],
      intensity: [],
      blend: [],
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
      search: searchText,
    }));
  };

  // FIX: Extracted this function from useEffect to make it directly callable
  const resolveUrlParams = async () => {
    // Skip if no URL parameters
    if (!categorySlug && !subcategorySlug && !brandSlug) {
      console.log('No URL parameters to resolve');
      setLoading(false);
      return;
    }

    setLoading(true);
    parametersResolved.current = false;
    setResolutionError(null);

    try {
      console.log('Resolving URL parameters:', {
        categorySlug,
        subcategorySlug,
        brandSlug,
      });

      // FIX: Create dedicated variables to track resolution status
      let categoryResolved = false;
      let subcategoryResolved = false;
      let brandResolved = false;

      // Reset IDs
      let resolvedCategoryId = '';
      let resolvedCategoryName = '';
      let resolvedSubcategoryId = '';
      let resolvedSubcategoryName = '';
      let resolvedBrandId = '';
      let resolvedBrandName = '';

      // Step 1: Resolve category if present
      if (categorySlug) {
        console.log('Fetching category:', categorySlug);

        try {
          const categoryResponse = await Axios({
            ...SummaryApi.getCategory,
            params: { slug: categorySlug },
          });

          console.log('Category response:', categoryResponse.data);

          if (
            categoryResponse.data.success &&
            categoryResponse.data.data.length > 0
          ) {
            // FIX: Check if the response contains exactly the slug we're looking for
            const exactCategory = categoryResponse.data.data.find(
              (cat) => cat.slug === categorySlug
            );

            if (exactCategory) {
              resolvedCategoryId = exactCategory._id;
              resolvedCategoryName = exactCategory.name;
              categoryResolved = true;
              console.log('Resolved category exactly:', {
                id: resolvedCategoryId,
                name: resolvedCategoryName,
              });
            } else {
              console.warn(
                `Exact category "${categorySlug}" not found in results`
              );
              setResolutionError(
                `Category "${categorySlug}" not found or doesn't match exactly.`
              );
            }
          } else {
            console.warn('Category not found:', categorySlug);
            setResolutionError(`Category "${categorySlug}" not found.`);
          }
        } catch (error) {
          console.error('Error fetching category:', error);
          setResolutionError(`Error fetching category: ${error.message}`);
        }
      }

      // Step 2: Resolve subcategory if present
      if (subcategorySlug && resolvedCategoryId) {
        console.log(
          'Fetching subcategory:',
          subcategorySlug,
          'in category:',
          resolvedCategoryId
        );

        try {
          const subcategoryResponse = await Axios({
            ...SummaryApi.getSubCategory,
            data: {
              category: resolvedCategoryId,
              slug: subcategorySlug,
            },
          });

          console.log('Subcategory response:', subcategoryResponse.data);

          if (
            subcategoryResponse.data.success &&
            subcategoryResponse.data.data.length > 0
          ) {
            // FIX: Check if the response contains exactly the slug we're looking for
            const exactSubcategory = subcategoryResponse.data.data.find(
              (subcat) => subcat.slug === subcategorySlug
            );

            if (exactSubcategory) {
              resolvedSubcategoryId = exactSubcategory._id;
              resolvedSubcategoryName = exactSubcategory.name;
              subcategoryResolved = true;
              console.log('Resolved subcategory exactly:', {
                id: resolvedSubcategoryId,
                name: resolvedSubcategoryName,
              });
            } else {
              console.warn(
                `Exact subcategory "${subcategorySlug}" not found in results`
              );
              setResolutionError(
                `Subcategory "${subcategorySlug}" not found or doesn't match exactly.`
              );
            }
          } else {
            console.warn('Subcategory not found:', subcategorySlug);
            setResolutionError(`Subcategory "${subcategorySlug}" not found.`);
          }
        } catch (error) {
          console.error('Error fetching subcategory:', error);
          setResolutionError(`Error fetching subcategory: ${error.message}`);
        }
      }

      // Step 3: Resolve brand if present
      if (brandSlug) {
        console.log('Fetching brand:', brandSlug);

        try {
          const brandResponse = await Axios({
            ...SummaryApi.getBrand,
            params: { slug: brandSlug },
          });

          console.log('Brand response:', brandResponse.data);

          if (
            brandResponse.data.success &&
            brandResponse.data.data.length > 0
          ) {
            // FIX: Check if the response contains exactly the slug we're looking for
            const exactBrand = brandResponse.data.data.find(
              (brand) => brand.slug === brandSlug
            );

            if (exactBrand) {
              resolvedBrandId = exactBrand._id;
              resolvedBrandName = exactBrand.name;
              brandResolved = true;
              console.log('Resolved brand exactly:', {
                id: resolvedBrandId,
                name: resolvedBrandName,
              });
            } else {
              console.warn(`Exact brand "${brandSlug}" not found in results`);
              setResolutionError(
                `Brand "${brandSlug}" not found or doesn't match exactly.`
              );
            }
          } else {
            console.warn('Brand not found:', brandSlug);
            setResolutionError(`Brand "${brandSlug}" not found.`);
          }
        } catch (error) {
          console.error('Error fetching brand:', error);
          setResolutionError(`Error fetching brand: ${error.message}`);
        }
      }

      // FIX: Check if all requested parameters were properly resolved
      if (
        (categorySlug && !categoryResolved) ||
        (subcategorySlug && !subcategoryResolved) ||
        (brandSlug && !brandResolved)
      ) {
        console.error('Not all URL parameters were successfully resolved');
        if (!resolutionError) {
          setResolutionError('Could not resolve one or more URL parameters');
        }
        setLoading(false);
        return;
      }

      // Update state with resolved IDs
      setCategoryId(resolvedCategoryId);
      setCategoryName(resolvedCategoryName);
      setSubcategoryId(resolvedSubcategoryId);
      setSubcategoryName(resolvedSubcategoryName);
      setBrandId(resolvedBrandId);
      setBrandName(resolvedBrandName);

      // Generate page title based on resolved names
      generatePageTitle(
        resolvedCategoryName,
        resolvedSubcategoryName,
        resolvedBrandName
      );

      // Generate breadcrumbs based on resolved names
      generateBreadcrumbs(
        resolvedCategoryName,
        resolvedSubcategoryName,
        resolvedBrandName
      );

      // Mark parameters as resolved
      parametersResolved.current = true;

      // Update filters state to reflect resolved IDs
      setFilters((prevFilters) => ({
        ...prevFilters,
        category: resolvedCategoryId || '',
        subCategory: resolvedSubcategoryId || '',
        brand: resolvedBrandId ? [resolvedBrandId] : [],
      }));

      // Fetch products with a slight delay to ensure state is updated
      setTimeout(() => {
        // Call the product API directly with the resolved IDs
        fetchProductsWithResolvedIds(
          resolvedCategoryId,
          resolvedSubcategoryId,
          resolvedBrandId,
          searchText
        );
      }, 100);
    } catch (error) {
      console.error('Error resolving URL parameters:', error);
      setResolutionError(`Error: ${error.message}`);
      AxiosToastError(error);
      setLoading(false);
    }
  };

  // Generate page title based on available parameters
  const generatePageTitle = (catName, subCatName, bName) => {
    let title = '';

    if (bName && subCatName && catName) {
      title = `${bName} ${subCatName} - ${catName}`;
    } else if (bName && catName) {
      title = `${bName} - ${catName}`;
    } else if (subCatName && catName) {
      title = `${subCatName} - ${catName}`;
    } else if (catName) {
      title = catName;
    } else if (bName) {
      title = bName;
    } else {
      title = 'All Products';
    }

    console.log('Setting page title:', title);
    setPageTitle(title);
  };

  // Generate breadcrumbs based on available parameters
  const generateBreadcrumbs = (catName, subCatName, bName) => {
    const crumbs = [
      { label: 'Home', url: '/' },
      { label: 'Shop', url: '/shop' },
    ];

    if (catName) {
      crumbs.push({
        label: catName,
        url: `/category/${categorySlug}`,
      });
    }

    if (subCatName) {
      crumbs.push({
        label: subCatName,
        url: `/category/${categorySlug}/subcategory/${subcategorySlug}`,
      });
    }

    if (bName) {
      if (subCatName) {
        crumbs.push({
          label: bName,
          url: `/category/${categorySlug}/subcategory/${subcategorySlug}/brand/${brandSlug}`,
        });
      } else if (catName) {
        crumbs.push({
          label: bName,
          url: `/category/${categorySlug}/brand/${brandSlug}`,
        });
      } else {
        crumbs.push({
          label: bName,
          url: `/brand/${brandSlug}`,
        });
      }
    }

    console.log('Setting breadcrumbs:', crumbs);
    setBreadcrumbs(crumbs);
  };

  // Direct API call with resolved IDs - bypass the filter state
  const fetchProductsWithResolvedIds = async (
    categoryId,
    subcategoryId,
    brandId,
    searchText,
    currentPage = 1
  ) => {
    try {
      setLoading(true);
      apiRequestInProgress.current = true;

      // Define API parameters directly from resolved IDs
      const apiParams = {
        search: searchText || undefined,
        page: currentPage,
        category: categoryId || undefined,
        subCategory: subcategoryId || undefined,
        brand: brandId ? [brandId] : undefined,
        productType:
          filters.productType.length > 0 ? filters.productType : undefined,
        roastLevel:
          filters.roastLevel.length > 0 ? filters.roastLevel : undefined,
        intensity: filters.intensity.length > 0 ? filters.intensity : undefined,
        blend: filters.blend.length > 0 ? filters.blend : undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        sort: filters.sort === 'newest' ? '' : filters.sort,
      };

      console.log('Directly fetching products with resolved IDs:', apiParams);

      const response = await Axios({
        ...SummaryApi.searchProduct,
        data: apiParams,
      });

      const { data: responseData } = response;

      if (responseData.success) {
        console.log(
          `Received ${responseData.data.length} products (page ${currentPage}/${responseData.totalPage})`
        );

        // Update filter state to match the API call we just made
        setFilters((prev) => ({
          ...prev,
          category: categoryId || '',
          subCategory: subcategoryId || '',
          brand: brandId ? [brandId] : [],
          search: searchText || '',
        }));

        if (currentPage === 1) {
          setProducts(responseData.data);
        } else {
          setProducts((prev) => [...prev, ...responseData.data]);
        }

        setTotalPage(responseData.totalPage);
        setTotalCount(responseData.totalCount);
        productsLoaded.current = true;
      }
    } catch (error) {
      console.error('Error in direct product fetch:', error);
      AxiosToastError(error);
    } finally {
      setLoading(false);
      apiRequestInProgress.current = false;
    }
  };

  // Regular fetch products for additional filters
  const fetchProducts = async (resetPage = false) => {
    // If there's already a request in progress, skip
    if (apiRequestInProgress.current) {
      return;
    }

    try {
      apiRequestInProgress.current = true;
      setLoading(true);

      // Handle pagination
      const currentPage = resetPage ? 1 : page;
      if (resetPage) {
        setPage(1);
      }

      // Make sure we're using the correct IDs
      const apiParams = {
        search: filters.search,
        page: currentPage,
        category: categoryId || filters.category || undefined,
        subCategory: subcategoryId || filters.subCategory || undefined,
        brand: brandId
          ? [brandId]
          : filters.brand.length > 0
          ? filters.brand
          : undefined,
        productType:
          filters.productType.length > 0 ? filters.productType : undefined,
        roastLevel:
          filters.roastLevel.length > 0 ? filters.roastLevel : undefined,
        intensity: filters.intensity.length > 0 ? filters.intensity : undefined,
        blend: filters.blend.length > 0 ? filters.blend : undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        sort: filters.sort === 'newest' ? '' : filters.sort,
      };

      console.log('Fetching products with params:', apiParams);

      const response = await Axios({
        ...SummaryApi.searchProduct,
        data: apiParams,
      });

      const { data: responseData } = response;

      if (responseData.success) {
        console.log(
          `Received ${responseData.data.length} products (page ${currentPage}/${responseData.totalPage})`
        );

        if (currentPage === 1) {
          setProducts(responseData.data);
        } else {
          setProducts((prev) => [...prev, ...responseData.data]);
        }

        setTotalPage(responseData.totalPage);
        setTotalCount(responseData.totalCount);
        productsLoaded.current = true;
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      AxiosToastError(error);
    } finally {
      setLoading(false);
      apiRequestInProgress.current = false;
    }
  };

  // Load more products for infinite scroll
  const handleFetchMore = () => {
    if (totalPage > page && !apiRequestInProgress.current) {
      const nextPage = page + 1;
      setPage(nextPage);

      // Use direct API call with resolved IDs for consistency
      if (categoryId || subcategoryId || brandId) {
        fetchProductsWithResolvedIds(
          categoryId,
          subcategoryId,
          brandId,
          searchText,
          nextPage
        );
      } else {
        fetchProducts(false);
      }
    }
  };

  // Handle additional filter changes (non-URL based)
  const handleApplyFilters = (newFilters) => {
    // Preserve URL-based filters
    const updatedFilters = {
      ...newFilters,
      category: categoryId || newFilters.category,
      subCategory: subcategoryId || newFilters.subCategory,
      brand: brandId ? [brandId] : newFilters.brand,
      search: searchText || newFilters.search,
    };

    console.log('Applying filters:', updatedFilters);
    setFilters(updatedFilters);

    // Apply filters with the original IDs to ensure consistency
    fetchProductsWithResolvedIds(
      categoryId,
      subcategoryId,
      brandId,
      searchText
    );
  };

  // Navigate back to the shop page
  const handleBackToShop = () => {
    navigate('/shop');
  };

  // FIX: Completely rewrote the handleRemoveFilter function to properly handle URL-based filters
  const handleRemoveFilter = (type, value) => {
    // Handle the case of resetting all filters
    if (type === 'all') {
      // If we're on a URL-filtered page, we need to navigate away
      if (categorySlug || subcategorySlug || brandSlug) {
        navigate('/shop');
        return;
      }

      // Otherwise just reset the filter state
      const resetFilters = {
        productType: [],
        roastLevel: [],
        intensity: [],
        blend: [],
        minPrice: '',
        maxPrice: '',
        sort: 'newest',
        search: searchText,
        // Preserve URL-based filters
        category: categoryId,
        subCategory: subcategoryId,
        brand: brandId ? [brandId] : [],
      };

      console.log('Resetting filters to:', resetFilters);
      setFilters(resetFilters);
      fetchProductsWithResolvedIds(
        categoryId,
        subcategoryId,
        brandId,
        searchText
      );
      return;
    }

    // Handle removing URL-based filters by navigating
    if (type === 'category' && categorySlug) {
      navigate('/shop');
      return;
    }

    if (type === 'subCategory' && subcategorySlug) {
      navigate(`/category/${categorySlug}`);
      return;
    }

    if (type === 'brand' && brandSlug) {
      if (subcategorySlug) {
        navigate(`/category/${categorySlug}/subcategory/${subcategorySlug}`);
      } else if (categorySlug) {
        navigate(`/category/${categorySlug}`);
      } else {
        navigate('/shop');
      }
      return;
    }

    // Handle removing price range
    if (type === 'priceRange') {
      setFilters((prev) => ({
        ...prev,
        minPrice: '',
        maxPrice: '',
      }));
      fetchProductsWithResolvedIds(
        categoryId,
        subcategoryId,
        brandId,
        searchText
      );
      return;
    }

    // Handle removing array-based filters
    if (Array.isArray(filters[type])) {
      setFilters((prev) => ({
        ...prev,
        [type]: prev[type].filter((item) => item !== value),
      }));
      fetchProductsWithResolvedIds(
        categoryId,
        subcategoryId,
        brandId,
        searchText
      );
      return;
    }

    // Handle removing single-value filters
    setFilters((prev) => ({
      ...prev,
      [type]: '',
    }));
    fetchProductsWithResolvedIds(
      categoryId,
      subcategoryId,
      brandId,
      searchText
    );
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();

    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <section className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4">
        {/* Breadcrumbs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <nav className="flex text-sm flex-wrap">
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

        {/* Debug Panel - Remove in production */}
        {/* <div className="bg-gray-200 p-3 mb-4 rounded text-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">Filter Parameters</h3>
            <button
              onClick={handleBackToShop}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
            >
              Back to Shop
            </button>
          </div>
          <p>
            URL: <code>{window.location.pathname}</code>
          </p>
          <p>
            Category: {categoryName} (ID: {categoryId || 'N/A'})
          </p>
          <p>
            Subcategory: {subcategoryName} (ID: {subcategoryId || 'N/A'})
          </p>
          <p>
            Brand: {brandName} (ID: {brandId || 'N/A'})
          </p>
          <p>Search: {searchText || 'N/A'}</p>
        </div> */}

        {/* Error message if parameters couldn't be resolved */}
        {resolutionError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-bold">Error</h3>
            <p>{resolutionError}</p>
            <p>The URL may contain invalid parameters.</p>
            <button
              onClick={handleBackToShop}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Back to Shop
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row">
          {/* Filter Column - Sticky on desktop */}
          <div className="lg:w-1/4 lg:pr-4">
            <div className="lg:sticky lg:top-20">
              {loading && isInitialLoad.current ? (
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
                  initialFilters={filters}
                  onRemoveFilter={handleRemoveFilter}
                  onResetFilters={() => handleRemoveFilter('all')}
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
                  {loading &&
                    loadingArrayCard.map((_, index) => (
                      <CardLoading key={`loading-${index}`} />
                    ))}
                </div>
              </InfiniteScroll>

              {/* No results message */}
              {!products.length && !loading && productsLoaded.current && (
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

export default CategoryDetailPage;
