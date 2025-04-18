import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import CardLoading from '../components/CardLoading';
import CardProduct from '../components/CardProduct';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchFilterOptions,
  fetchFilteredProducts,
} from '../store/productApiSlice';

import Axios from '../utils/Axios';
import AxiosToastError from '../utils/AxiosToastError';
import InfiniteScroll from 'react-infinite-scroll-component';
import noDataImage from '../assets/nothing here yet.webp';
import { FaFilter, FaTimes, FaSort, FaArrowLeft } from 'react-icons/fa';
import { MdGridView, MdViewList } from 'react-icons/md';
import { DisplayPriceInNaira } from '../utils/DisplayPriceInNaira';
import useMobile from '../hooks/useMobile';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [gridView, setGridView] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isMobile] = useMobile();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { type, slug } = useParams(); // For routes like /shop/category/coffee

  // Filter States
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    subCategory: '',
    brand: '',
    productType: [],
    priceRange: [0, 50000000],
    roastLevel: [],
    blend: [],
    intensity: [],
    stock: false, // In stock only
    sortBy: 'newest', // Default sort
  });

  const [appliedFilters, setAppliedFilters] = useState({});
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([
    'COFFEE',
    'COFFEE_BEANS',
    'EQUIPMENT',
    'ACCESSORY',
  ]);
  const [roastLevels, setRoastLevels] = useState([
    'LIGHT',
    'MEDIUM',
    'DARK',
    'EXTRA_DARK',
  ]);
  const [intensityLevels, setIntensityLevels] = useState([
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
  ]);
  const [blendTypes, setBlendTypes] = useState(['ARABICA', 'ROBUSTA', 'MIXED']);

  const allCategories = useSelector((state) => state.product.allCategory || []);
  const loadingArrayCard = new Array(isMobile ? 4 : 10).fill(null);

  // Parse URL search params on initial load
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const initialFilters = { ...filters };

    // Extract params from URL
    if (searchParams.has('search'))
      initialFilters.search = searchParams.get('search');
    if (searchParams.has('minPrice'))
      initialFilters.priceRange[0] = parseInt(searchParams.get('minPrice'));
    if (searchParams.has('maxPrice'))
      initialFilters.priceRange[1] = parseInt(searchParams.get('maxPrice'));
    if (searchParams.has('sort'))
      initialFilters.sortBy = searchParams.get('sort');
    if (searchParams.has('inStock'))
      initialFilters.stock = searchParams.get('inStock') === 'true';

    // Handle array-based filters
    if (searchParams.has('productType'))
      initialFilters.productType = searchParams.get('productType').split(',');
    if (searchParams.has('roastLevel'))
      initialFilters.roastLevel = searchParams.get('roastLevel').split(',');
    if (searchParams.has('intensity'))
      initialFilters.intensity = searchParams.get('intensity').split(',');
    if (searchParams.has('blend'))
      initialFilters.blend = searchParams.get('blend').split(',');

    // Apply route params (category, brand, etc.)
    if (type && slug) {
      initialFilters[type] = slug;
    }

    setFilters(initialFilters);
    setAppliedFilters(initialFilters);

    // Reset page when filters change
    setPage(1);
  }, [location.search, type, slug]);

  // Fetch filter metadata (available options)
  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await Axios({
        url: '/api/product/filter-options',
        method: 'GET',
      });

      if (response.data.success) {
        setAvailableBrands(response.data.brands || []);
        // We're using the categories from redux, but we could also load them here if needed
        setAvailableSubCategories(response.data.subCategories || []);

        // If the API returns these values
        if (response.data.productTypes)
          setProductTypes(response.data.productTypes);
        if (response.data.roastLevels)
          setRoastLevels(response.data.roastLevels);
        if (response.data.intensityLevels)
          setIntensityLevels(response.data.intensityLevels);
        if (response.data.blendTypes) setBlendTypes(response.data.blendTypes);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  }, []);

  // Fetch products based on current filters and pagination
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(page === 1);

      // Build filters object for API
      const apiFilters = { ...appliedFilters, page };

      const response = await Axios({
        url: '/api/product/filtered',
        method: 'POST',
        data: apiFilters,
      });

      if (response.data.success) {
        if (page === 1) {
          setProducts(response.data.data);
        } else {
          setProducts((prev) => [...prev, ...response.data.data]);
        }

        setTotalPages(response.data.totalPages);
        setTotalProducts(response.data.total);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  }, [page, appliedFilters]);

  // Load initial data
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // Fetch products when applied filters or page changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, page, appliedFilters]);

  // Apply filters and update URL
  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    setPage(1);

    // Update URL with filters
    const searchParams = new URLSearchParams();

    if (filters.search) searchParams.set('search', filters.search);
    if (filters.priceRange[0] > 0)
      searchParams.set('minPrice', filters.priceRange[0].toString());
    if (filters.priceRange[1] < 500000)
      searchParams.set('maxPrice', filters.priceRange[1].toString());
    if (filters.stock) searchParams.set('inStock', 'true');
    if (filters.sortBy !== 'newest') searchParams.set('sort', filters.sortBy);

    // Array filters
    if (filters.productType.length > 0)
      searchParams.set('productType', filters.productType.join(','));
    if (filters.roastLevel.length > 0)
      searchParams.set('roastLevel', filters.roastLevel.join(','));
    if (filters.intensity.length > 0)
      searchParams.set('intensity', filters.intensity.join(','));
    if (filters.blend.length > 0)
      searchParams.set('blend', filters.blend.join(','));

    // Keep route params if present (category, brand, etc.) or create a URL with the filters
    if (type && slug) {
      navigate(`/shop/${type}/${slug}?${searchParams.toString()}`);
    } else if (filters.category) {
      navigate(`/shop/category/${filters.category}?${searchParams.toString()}`);
    } else if (filters.subCategory) {
      navigate(
        `/shop/subcategory/${filters.subCategory}?${searchParams.toString()}`
      );
    } else if (filters.brand) {
      navigate(`/shop/brand/${filters.brand}?${searchParams.toString()}`);
    } else {
      navigate(`/shop?${searchParams.toString()}`);
    }

    setIsFilterOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      category: type === 'category' ? slug : '',
      subCategory: type === 'subcategory' ? slug : '',
      brand: type === 'brand' ? slug : '',
      productType: [],
      priceRange: [0, 500000],
      roastLevel: [],
      blend: [],
      intensity: [],
      stock: false,
      sortBy: 'newest',
    });
  };

  // Load more products for infinite scroll
  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  // Handle price range change
  const handlePriceChange = (value, index) => {
    const newPriceRange = [...filters.priceRange];
    newPriceRange[index] = parseInt(value);
    setFilters({ ...filters, priceRange: newPriceRange });
  };

  // Toggle filter for array-based selections
  const toggleFilter = (field, value) => {
    const currentValues = [...filters[field]];
    const valueIndex = currentValues.indexOf(value);

    if (valueIndex === -1) {
      // Add value
      currentValues.push(value);
    } else {
      // Remove value
      currentValues.splice(valueIndex, 1);
    }

    setFilters({ ...filters, [field]: currentValues });
  };

  // Toggle checkbox values
  const toggleCheckbox = (field) => {
    setFilters({ ...filters, [field]: !filters[field] });
  };

  // Format the page title based on current filters
  const getPageTitle = () => {
    if (type === 'category') {
      const category = allCategories.find((c) => c.slug === slug);
      return category ? category.name : 'Shop';
    } else if (type === 'subcategory') {
      const subCategory = availableSubCategories.find((sc) => sc.slug === slug);
      return subCategory ? subCategory.name : 'Shop';
    } else if (type === 'brand') {
      const brand = availableBrands.find((b) => b.slug === slug);
      return brand ? brand.name + ' Products' : 'Shop';
    } else if (filters.search) {
      return `Search Results: "${filters.search}"`;
    }
    return 'Shop All Products';
  };

  // Get filtered product count text
  const getFilteredCountText = () => {
    if (loading && page === 1) return 'Loading products...';
    return `Showing ${products.length} of ${totalProducts} products`;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-2">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500">
              <button
                onClick={() => navigate('/')}
                className="hover:text-secondary-200"
              >
                Home
              </button>
              <span className="mx-2">/</span>
              <span className="font-medium text-secondary-200">Shop</span>
              {type && (
                <>
                  <span className="mx-2">/</span>
                  <span className="capitalize">{type}</span>
                  <span className="mx-2">/</span>
                  <span>{slug}</span>
                </>
              )}
            </div>

            {/* Page title */}
            <h1 className="text-2xl font-bold text-gray-800">
              {getPageTitle()}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">{getFilteredCountText()}</p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Filter toggle button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 bg-secondary-200 hover:bg-secondary-100 text-white px-4 py-2 rounded"
            >
              <FaFilter />
              <span>Filter</span>
            </button>

            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => {
                  setFilters({ ...filters, sortBy: e.target.value });
                  setAppliedFilters({
                    ...appliedFilters,
                    sortBy: e.target.value,
                  });
                  setPage(1);
                }}
                className="pl-8 pr-4 py-2 border rounded bg-white appearance-none"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="bestselling">Bestselling</option>
              </select>
              <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>

            {/* View toggle buttons */}
            <div className="flex border rounded overflow-hidden">
              <button
                onClick={() => setGridView(true)}
                className={`p-2 ${
                  gridView
                    ? 'bg-secondary-200 text-white'
                    : 'bg-white text-gray-600'
                }`}
                aria-label="Grid view"
              >
                <MdGridView size={20} />
              </button>
              <button
                onClick={() => setGridView(false)}
                className={`p-2 ${
                  !gridView
                    ? 'bg-secondary-200 text-white'
                    : 'bg-white text-gray-600'
                }`}
                aria-label="List view"
              >
                <MdViewList size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Active filters display */}
        {Object.keys(appliedFilters).some((key) => {
          if (key === 'priceRange')
            return (
              appliedFilters[key][0] > 0 || appliedFilters[key][1] < 500000
            );
          if (Array.isArray(appliedFilters[key]))
            return appliedFilters[key].length > 0;
          if (key === 'stock') return appliedFilters[key] === true;
          if (['search', 'category', 'subCategory', 'brand'].includes(key))
            return !!appliedFilters[key];
          return false;
        }) && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Active Filters:</h3>
              <button
                onClick={resetFilters}
                className="text-secondary-200 hover:text-secondary-100 text-sm"
              >
                Clear All
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {appliedFilters.search && (
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Search: {appliedFilters.search}
                </span>
              )}

              {appliedFilters.category && type !== 'category' && (
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Category: {appliedFilters.category}
                </span>
              )}

              {appliedFilters.subCategory && type !== 'subcategory' && (
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Subcategory: {appliedFilters.subCategory}
                </span>
              )}

              {appliedFilters.brand && type !== 'brand' && (
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Brand: {appliedFilters.brand}
                </span>
              )}

              {appliedFilters.stock && (
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center">
                  In Stock Only
                </span>
              )}

              {(appliedFilters.priceRange[0] > 0 ||
                appliedFilters.priceRange[1] < 500000) && (
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Price: {DisplayPriceInNaira(appliedFilters.priceRange[0])} -{' '}
                  {DisplayPriceInNaira(appliedFilters.priceRange[1])}
                </span>
              )}

              {appliedFilters.productType?.map((type) => (
                <span
                  key={type}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  Type: {type}
                </span>
              ))}

              {appliedFilters.roastLevel?.map((level) => (
                <span
                  key={level}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  Roast: {level}
                </span>
              ))}

              {appliedFilters.intensity?.map((intensity) => (
                <span
                  key={intensity}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  Intensity: {intensity}
                </span>
              ))}

              {appliedFilters.blend?.map((blend) => (
                <span
                  key={blend}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  Blend: {blend}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="flex flex-col md:flex-row">
          {/* Products grid/list */}
          <div className="w-full">
            <InfiniteScroll
              dataLength={products.length}
              next={handleLoadMore}
              hasMore={page < totalPages}
              loader={
                <div className="flex justify-center my-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-secondary-200"></div>
                </div>
              }
            >
              {/* Grid View */}
              {gridView ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {/* Products */}
                  {products.map((product) => (
                    <CardProduct key={product._id} data={product} />
                  ))}

                  {/* Loading placeholders */}
                  {loading &&
                    page === 1 &&
                    loadingArrayCard.map((_, index) => (
                      <CardLoading key={`loading-${index}`} />
                    ))}
                </div>
              ) : (
                /* List View */
                <div className="flex flex-col gap-4">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Product image */}
                        <div className="w-full md:w-48 h-48 p-4 flex items-center justify-center bg-gray-50">
                          <img
                            src={product.image[0]}
                            alt={product.name}
                            className="h-full object-contain mix-blend-multiply"
                          />
                        </div>

                        {/* Product details */}
                        <div className="flex-1 p-4 flex flex-col">
                          <div className="mb-auto">
                            {product.brand?.length > 0 && (
                              <div className="text-xs text-gray-500 uppercase mb-1">
                                {product.brand[0]?.name || 'Premium Brand'}
                              </div>
                            )}

                            <h3 className="font-medium text-lg mb-2 text-gray-800">
                              {product.name}
                            </h3>

                            {product.shortDescription && (
                              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {product.shortDescription}
                              </p>
                            )}

                            {/* Coffee Attributes */}
                            {(product.productType === 'COFFEE' ||
                              product.productType === 'COFFEE_BEANS') && (
                              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                                {product.roastLevel && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <span className="text-gray-700">
                                      Roast:
                                    </span>
                                    <span className="font-medium capitalize">
                                      {product.roastLevel.toLowerCase()}
                                    </span>
                                  </div>
                                )}

                                {product.blend && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <span className="text-gray-700">
                                      Blend:
                                    </span>
                                    <span className="font-medium">
                                      {product.blend}
                                    </span>
                                  </div>
                                )}

                                {product.coffeeOrigin && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <span className="text-gray-700">
                                      Origin:
                                    </span>
                                    <span className="font-medium">
                                      {product.coffeeOrigin}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Price and CTA */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex flex-col">
                              {product.discount > 0 && (
                                <span className="text-xs text-gray-500 line-through">
                                  {DisplayPriceInNaira(product.price)}
                                </span>
                              )}
                              <span className="font-bold text-lg text-gray-900">
                                {DisplayPriceInNaira(
                                  product.discount > 0
                                    ? product.price *
                                        (1 - product.discount / 100)
                                    : product.price
                                )}
                              </span>
                            </div>

                            {product.stock > 0 ? (
                              <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded">
                                Add to Cart
                              </button>
                            ) : (
                              <span className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded">
                                Out of stock
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Loading placeholders for list view */}
                  {loading &&
                    page === 1 &&
                    loadingArrayCard.slice(0, 3).map((_, index) => (
                      <div
                        key={`loading-list-${index}`}
                        className="bg-white rounded-lg shadow-sm p-4 h-40 animate-pulse"
                      >
                        <div className="flex gap-4">
                          <div className="w-32 h-32 bg-gray-200 rounded"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* No products found */}
              {!loading && products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <img
                    src={noDataImage}
                    alt="No products found"
                    className="w-64 h-64 object-contain mb-4"
                  />
                  <p className="text-lg font-medium text-gray-800">
                    No products found
                  </p>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search query
                  </p>
                  <button
                    onClick={resetFilters}
                    className="bg-secondary-200 hover:bg-secondary-100 text-white px-6 py-2 rounded"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </InfiniteScroll>
          </div>
        </div>
      </div>

      {/* Filter Sidebar Overlay - Animated when opened */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Dark overlay with opacity transition */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setIsFilterOpen(false)}
          ></div>

          {/* Filter panel that slides in */}
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div
              className={`w-screen max-w-md transform transition-transform duration-300 ease-in-out ${
                isFilterOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                {/* Filter header */}
                <div className="px-4 py-6 bg-secondary-200 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsFilterOpen(false)}>
                      <FaArrowLeft />
                    </button>
                    <h2 className="text-lg font-medium">Filters</h2>
                  </div>
                  <button onClick={resetFilters} className="text-sm underline">
                    Reset All
                  </button>
                </div>

                {/* Filter content */}
                <div className="p-6 flex-1 overflow-y-auto">
                  {/* Price Range Filter */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Price Range</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">
                            Min
                          </label>
                          <input
                            type="number"
                            value={filters.priceRange[0]}
                            onChange={(e) =>
                              handlePriceChange(e.target.value, 0)
                            }
                            className="w-full border rounded px-3 py-2"
                            min="0"
                            max={filters.priceRange[1]}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">
                            Max
                          </label>
                          <input
                            type="number"
                            value={filters.priceRange[1]}
                            onChange={(e) =>
                              handlePriceChange(e.target.value, 1)
                            }
                            className="w-full border rounded px-3 py-2"
                            min={filters.priceRange[0]}
                          />
                        </div>
                      </div>
                      <div className="px-2">
                        <input
                          type="range"
                          min="0"
                          max="500000"
                          value={filters.priceRange[1]}
                          onChange={(e) => handlePriceChange(e.target.value, 1)}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{DisplayPriceInNaira(0)}</span>
                          <span>{DisplayPriceInNaira(250000)}</span>
                          <span>{DisplayPriceInNaira(500000)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Categories Filter */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Categories</h3>
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                      {allCategories.map((category) => (
                        <div key={category._id} className="flex items-center">
                          <input
                            type="radio"
                            id={`category-${category._id}`}
                            name="category"
                            checked={filters.category === category.slug}
                            onChange={() =>
                              setFilters({
                                ...filters,
                                category: category.slug,
                                subCategory: '',
                              })
                            }
                            className="mr-2"
                          />
                          <label
                            htmlFor={`category-${category._id}`}
                            className="cursor-pointer"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subcategories Filter */}
                  {filters.category && (
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4">
                        Subcategories
                      </h3>
                      <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                        {availableSubCategories
                          .filter((sub) => {
                            // Find the category this subcategory belongs to
                            const parentCategory = allCategories.find((cat) =>
                              cat.subcategories?.some(
                                (subcat) => subcat.slug === sub.slug
                              )
                            );
                            return (
                              parentCategory &&
                              parentCategory.slug === filters.category
                            );
                          })
                          .map((subCategory) => (
                            <div
                              key={subCategory._id}
                              className="flex items-center"
                            >
                              <input
                                type="radio"
                                id={`subcategory-${subCategory._id}`}
                                name="subcategory"
                                checked={
                                  filters.subCategory === subCategory.slug
                                }
                                onChange={() =>
                                  setFilters({
                                    ...filters,
                                    subCategory: subCategory.slug,
                                  })
                                }
                                className="mr-2"
                              />
                              <label
                                htmlFor={`subcategory-${subCategory._id}`}
                                className="cursor-pointer"
                              >
                                {subCategory.name}
                              </label>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Brands Filter */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Brands</h3>
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                      {availableBrands.map((brand) => (
                        <div key={brand._id} className="flex items-center">
                          <input
                            type="radio"
                            id={`brand-${brand._id}`}
                            name="brand"
                            checked={filters.brand === brand.slug}
                            onChange={() =>
                              setFilters({ ...filters, brand: brand.slug })
                            }
                            className="mr-2"
                          />
                          <label
                            htmlFor={`brand-${brand._id}`}
                            className="cursor-pointer"
                          >
                            {brand.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Product Type Filter */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Product Type</h3>
                    <div className="space-y-2">
                      {productTypes.map((type) => (
                        <div key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`type-${type}`}
                            checked={filters.productType.includes(type)}
                            onChange={() => toggleFilter('productType', type)}
                            className="mr-2"
                          />
                          <label
                            htmlFor={`type-${type}`}
                            className="cursor-pointer"
                          >
                            {type.replace('_', ' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Roast Level Filter - Only show for coffee products */}
                  {(filters.productType.includes('COFFEE') ||
                    filters.productType.includes('COFFEE_BEANS')) && (
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4">Roast Level</h3>
                      <div className="space-y-2">
                        {roastLevels.map((level) => (
                          <div key={level} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`roast-${level}`}
                              checked={filters.roastLevel.includes(level)}
                              onChange={() => toggleFilter('roastLevel', level)}
                              className="mr-2"
                            />
                            <label
                              htmlFor={`roast-${level}`}
                              className="cursor-pointer capitalize"
                            >
                              {level.toLowerCase()}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Blend Filter - Only show for coffee products */}
                  {(filters.productType.includes('COFFEE') ||
                    filters.productType.includes('COFFEE_BEANS')) && (
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4">Blend</h3>
                      <div className="space-y-2">
                        {blendTypes.map((blend) => (
                          <div key={blend} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`blend-${blend}`}
                              checked={filters.blend.includes(blend)}
                              onChange={() => toggleFilter('blend', blend)}
                              className="mr-2"
                            />
                            <label
                              htmlFor={`blend-${blend}`}
                              className="cursor-pointer capitalize"
                            >
                              {blend.toLowerCase()}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Intensity Filter - Only show for coffee products */}
                  {(filters.productType.includes('COFFEE') ||
                    filters.productType.includes('COFFEE_BEANS')) && (
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4">Intensity</h3>
                      <div className="flex flex-wrap gap-2">
                        {intensityLevels.map((level) => (
                          <button
                            key={level}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                              ${
                                filters.intensity.includes(level)
                                  ? 'bg-secondary-200 text-white font-bold'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            onClick={() => toggleFilter('intensity', level)}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stock Filter */}
                  <div className="mb-8">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="in-stock"
                        checked={filters.stock}
                        onChange={() => toggleCheckbox('stock')}
                        className="mr-2"
                      />
                      <label htmlFor="in-stock" className="cursor-pointer">
                        In Stock Only
                      </label>
                    </div>
                  </div>
                </div>

                {/* Filter footer with action buttons */}
                <div className="p-4 border-t flex justify-between">
                  <button
                    onClick={resetFilters}
                    className="text-gray-700 hover:text-gray-900 px-4 py-2 border rounded"
                  >
                    Reset
                  </button>
                  <button
                    onClick={applyFilters}
                    className="bg-secondary-200 hover:bg-secondary-100 text-white px-6 py-2 rounded"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
