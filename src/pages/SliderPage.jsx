import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaFilter,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaCoffee,
  FaSearch,
  FaList,
  FaThLarge,
} from 'react-icons/fa';
import CardProduct from '../components/CardProduct';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';

// Shop page component
const ShopPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCounts, setFilterCounts] = useState({
    total: 0,
    categories: 0,
    brands: 0,
    productTypes: 0,
    other: 0,
  });

  // Filter accordion state
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    productType: true,
    brand: true,
    intensity: false,
    roastLevel: false,
    blend: false,
    price: false,
  });

  // Filter state
  const [filters, setFilters] = useState({
    categoryId: null,
    subCategoryId: null,
    brandId: null,
    productType: [],
    roastLevel: [],
    intensity: [],
    blend: [],
    minPrice: '',
    maxPrice: '',
    sort: 'newest', // newest, price-low, price-high, popularity
  });

  // Get category structure from redux
  const categoryStructure = useSelector(
    (state) => state.product.categoryStructure
  );

  // Additional state
  const [brands, setBrands] = useState([]);
  const [pageTitle, setPageTitle] = useState('Shop');
  const [breadcrumbs, setBreadcrumbs] = useState([
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
  ]);
  const [productsPerPage, setProductsPerPage] = useState(12);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortOptions] = useState([
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popularity', label: 'Popularity' },
  ]);

  // Fetch brands once when component mounts
  const fetchBrands = useCallback(async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getBrand,
      });

      if (response.data.success) {
        setBrands(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  }, []);

  // Parse URL params for filtering
  useEffect(() => {
    const parseUrl = async () => {
      try {
        await fetchBrands(); // Make sure brands are loaded

        const pathParts = location.pathname.split('/').filter((part) => part);
        let newFilters = { ...filters };
        let newBreadcrumbs = [{ name: 'Home', path: '/' }];
        let title = 'Shop';
        let currentPath = '';

        // Reset filters first
        newFilters = {
          ...newFilters,
          categoryId: null,
          subCategoryId: null,
          brandId: null,
        };

        if (pathParts.length > 0) {
          // Initialize breadcrumbs with Shop if we're in shop-related page
          if (
            pathParts[0] === 'shop' ||
            pathParts[0] === 'category' ||
            pathParts[0] === 'brand'
          ) {
            newBreadcrumbs.push({ name: 'Shop', path: '/shop' });
          }

          // Parse each part of the URL
          for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            currentPath += `/${part}`;

            // Handle category paths
            if (part === 'category' && i + 1 < pathParts.length) {
              const categorySlug = pathParts[i + 1];
              const category = categoryStructure.find(
                (cat) => cat.slug === categorySlug
              );

              if (category) {
                newFilters.categoryId = category._id;
                title = category.name;
                newBreadcrumbs.push({
                  name: category.name,
                  path: `/category/${categorySlug}`,
                });

                // Check if there's a subcategory
                if (
                  i + 3 < pathParts.length &&
                  pathParts[i + 2] === 'subcategory'
                ) {
                  const subcategorySlug = pathParts[i + 3];
                  let subcategory = null;

                  if (category.subcategories) {
                    subcategory = category.subcategories.find(
                      (sub) => sub.slug === subcategorySlug
                    );

                    if (subcategory) {
                      newFilters.subCategoryId = subcategory._id;
                      title = subcategory.name;
                      newBreadcrumbs.push({
                        name: subcategory.name,
                        path: `/category/${categorySlug}/subcategory/${subcategorySlug}`,
                      });

                      // Skip these parts
                      i += 3;

                      // Check if there's a brand after the subcategory
                      if (
                        i + 2 < pathParts.length &&
                        pathParts[i + 1] === 'brand'
                      ) {
                        const brandSlug = pathParts[i + 2];
                        const brand = brands.find((b) => b.slug === brandSlug);

                        if (brand) {
                          newFilters.brandId = brand._id;
                          title = brand.name;
                          newBreadcrumbs.push({
                            name: brand.name,
                            path: `/category/${categorySlug}/subcategory/${subcategorySlug}/brand/${brandSlug}`,
                          });
                          i += 2;
                        }
                      }
                    }
                  }

                  if (!subcategory) {
                    console.warn(
                      `Subcategory with slug ${subcategorySlug} not found`
                    );
                  }
                }
                // Check if there's a brand after the category (no subcategory)
                else if (
                  i + 3 < pathParts.length &&
                  pathParts[i + 2] === 'brand'
                ) {
                  const brandSlug = pathParts[i + 3];
                  const brand = brands.find((b) => b.slug === brandSlug);

                  if (brand) {
                    newFilters.brandId = brand._id;
                    title = brand.name;
                    newBreadcrumbs.push({
                      name: brand.name,
                      path: `/category/${categorySlug}/brand/${brandSlug}`,
                    });
                    i += 3;
                  }
                } else {
                  // Skip one part (the category slug)
                  i += 1;
                }
              } else {
                console.warn(`Category with slug ${categorySlug} not found`);
                i += 1;
              }
            }
            // Handle brand paths
            else if (part === 'brand' && i + 1 < pathParts.length) {
              const brandSlug = pathParts[i + 1];
              const brand = brands.find((b) => b.slug === brandSlug);

              if (brand) {
                newFilters.brandId = brand._id;
                title = brand.name;
                newBreadcrumbs.push({
                  name: brand.name,
                  path: `/brand/${brandSlug}`,
                });
                i += 1;
              } else {
                console.warn(`Brand with slug ${brandSlug} not found`);
                i += 1;
              }
            }
            // Shop main page
            else if (part === 'shop') {
              title = 'Shop';
              // Already added Shop to breadcrumbs above
            }
          }
        }

        // Set state with parsed data
        setFilters(newFilters);
        setBreadcrumbs(newBreadcrumbs);
        setPageTitle(title);

        // Fetch products with the parsed filters
        fetchProducts(1, newFilters);
      } catch (error) {
        console.error('Error parsing URL:', error);
        setLoading(false);
      }
    };

    parseUrl();
  }, [location.pathname, categoryStructure, fetchBrands]);

  // Fetch products based on current filters
  const fetchProducts = async (page = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      // Build query object for API
      const query = {};

      // Add category filter
      if (currentFilters.categoryId) {
        query.category = currentFilters.categoryId;
      }

      // Add subcategory filter
      if (currentFilters.subCategoryId) {
        query.subCategory = currentFilters.subCategoryId;
      }

      // Add brand filter
      if (currentFilters.brandId) {
        query.brand = currentFilters.brandId;
      }

      // Add product type filter
      if (currentFilters.productType && currentFilters.productType.length > 0) {
        query.productType = currentFilters.productType;
      }

      // Add roast level filter
      if (currentFilters.roastLevel && currentFilters.roastLevel.length > 0) {
        query.roastLevel = currentFilters.roastLevel;
      }

      // Add intensity filter
      if (currentFilters.intensity && currentFilters.intensity.length > 0) {
        query.intensity = currentFilters.intensity;
      }

      // Add blend filter
      if (currentFilters.blend && currentFilters.blend.length > 0) {
        query.blend = currentFilters.blend;
      }

      // Add price range filters
      if (currentFilters.minPrice && !isNaN(currentFilters.minPrice)) {
        query.minPrice = parseFloat(currentFilters.minPrice);
      }

      if (currentFilters.maxPrice && !isNaN(currentFilters.maxPrice)) {
        query.maxPrice = parseFloat(currentFilters.maxPrice);
      }

      // Add sorting
      let sort = {};
      switch (currentFilters.sort) {
        case 'price-low':
          sort = { price: 1 };
          break;
        case 'price-high':
          sort = { price: -1 };
          break;
        case 'popularity':
          sort = { averageRating: -1 };
          break;
        case 'newest':
        default:
          sort = { createdAt: -1 };
          break;
      }

      // Make API request
      const response = await Axios({
        ...SummaryApi.searchProduct,
        data: {
          ...query,
          page: page,
          limit: productsPerPage,
          sort: sort,
        },
      });

      if (response.data.success) {
        setProducts(response.data.data);
        setTotalProducts(response.data.totalCount);
        setTotalPages(response.data.totalPage);
        setCurrentPage(page);

        // Update filter counts
        updateFilterCounts(response.data.data);
      } else {
        console.error('API returned unsuccessful response:', response.data);
      }
    } catch (error) {
      AxiosToastError(error);
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update filter counts for the sidebar
  const updateFilterCounts = (productData) => {
    // Count logic would go here to update the filter counts state
    // This would tally how many products match each potential filter

    // Example:
    setFilterCounts({
      total: productData.length,
      categories: new Set(productData.map((p) => p.category?._id)).size,
      brands: new Set(productData.map((p) => p.brand?._id)).size,
      productTypes: new Set(productData.map((p) => p.productType)).size,
      other: 0,
    });
  };

  // Toggle filter section expansion
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  // Handle filter changes
  const handleFilterChange = (type, value) => {
    let newFilters = { ...filters };

    // Handle different filter types
    switch (type) {
      case 'category':
        newFilters.categoryId = value;
        newFilters.subCategoryId = null; // Reset subcategory when category changes
        break;
      case 'subcategory':
        newFilters.subCategoryId = value;
        break;
      case 'brand':
        newFilters.brandId = value;
        break;
      case 'productType':
      case 'roastLevel':
      case 'intensity':
      case 'blend':
        // Toggle array values
        if (newFilters[type].includes(value)) {
          newFilters[type] = newFilters[type].filter((item) => item !== value);
        } else {
          newFilters[type] = [...newFilters[type], value];
        }
        break;
      case 'minPrice':
      case 'maxPrice':
        newFilters[type] = value;
        break;
      case 'sort':
        newFilters.sort = value;
        break;
      default:
        break;
    }

    setFilters(newFilters);

    // Fetch products with new filters
    fetchProducts(1, newFilters);
  };

  // Apply price range filter
  const applyPriceRange = () => {
    fetchProducts(1, filters);
  };

  // Reset all filters
  const resetFilters = () => {
    const newFilters = {
      categoryId: null,
      subCategoryId: null,
      brandId: null,
      productType: [],
      roastLevel: [],
      intensity: [],
      blend: [],
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
    };

    setFilters(newFilters);
    fetchProducts(1, newFilters);

    // Navigate to base shop URL
    navigate('/shop');
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchProducts(page, filters);

    // Scroll to top when page changes
    window.scrollTo(0, 0);
  };

  // Get product types from product schema
  const productTypes = [
    { value: 'COFFEE', label: 'Coffee' },
    { value: 'MACHINE', label: 'Machines' },
    { value: 'ACCESSORIES', label: 'Accessories' },
    { value: 'COFFEE_BEANS', label: 'Coffee Beans' },
    { value: 'TEA', label: 'Tea' },
  ];

  // Get roast levels from product schema
  const roastLevels = [
    { value: 'LIGHT', label: 'Light Roast' },
    { value: 'MEDIUM', label: 'Medium Roast' },
    { value: 'DARK', label: 'Dark Roast' },
  ];

  // Get intensity levels
  const intensityLevels = [
    { value: '1/10', label: 'Intensity 1' },
    { value: '2/10', label: 'Intensity 2' },
    { value: '3/10', label: 'Intensity 3' },
    { value: '4/10', label: 'Intensity 4' },
    { value: '5/10', label: 'Intensity 5' },
    { value: '6/10', label: 'Intensity 6' },
    { value: '7/10', label: 'Intensity 7' },
    { value: '8/10', label: 'Intensity 8' },
    { value: '9/10', label: 'Intensity 9' },
    { value: '10/10', label: 'Intensity 10' },
  ];

  // Get coffee blends
  const blendTypes = [
    { value: '100% Arabica', label: '100% Arabica' },
    { value: '100% Robusta', label: '100% Robusta' },
    {
      value: 'Arabica/Robusta Blend (70/30)',
      label: 'Arabica/Robusta (70/30)',
    },
    {
      value: 'Arabica/Robusta Blend (80/20)',
      label: 'Arabica/Robusta (80/20)',
    },
    {
      value: 'Arabica/Robusta Blend (40/60)',
      label: 'Arabica/Robusta (40/60)',
    },
    { value: 'Single Origin Arabica', label: 'Single Origin Arabica' },
    { value: 'Espresso Blend', label: 'Espresso Blend' },
    { value: 'Italian Roast Blend', label: 'Italian Roast Blend' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url('/images/coffee-shop-bg.jpg')" }}
        ></div>
        <div className="container mx-auto py-12 px-4 relative z-10">
          <h1 className="text-4xl font-bold mb-4">{pageTitle}</h1>

          {/* Breadcrumbs */}
          <nav className="text-sm">
            <ol className="list-none p-0 inline-flex">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2">/</span>}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-gray-300">{crumb.name}</span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="text-white hover:text-gray-300"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter panel - shown/hidden on mobile */}
          <div
            className={`
              fixed inset-0 z-50 overflow-hidden lg:relative lg:inset-auto
              ${showFilters ? 'block' : 'hidden lg:block'}
            `}
          >
            <div
              className="absolute inset-0 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setShowFilters(false)}
            ></div>

            <div className="w-80 h-full bg-white right-0 absolute lg:relative overflow-y-auto shadow-lg p-4 lg:p-0 lg:shadow-none transition-all transform">
              <div className="flex justify-between items-center mb-4 lg:hidden">
                <h3 className="font-bold text-lg">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Reset filters button */}
              <div className="mb-4">
                <button
                  onClick={resetFilters}
                  className="w-full py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                >
                  Reset All Filters
                </button>
              </div>

              {/* Category Filter */}
              <div className="border-b pb-4 mb-4">
                <div
                  className="flex justify-between items-center mb-2 cursor-pointer"
                  onClick={() => toggleSection('category')}
                >
                  <h3 className="font-semibold">Categories</h3>
                  {expandedSections.category ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </div>

                {expandedSections.category && (
                  <div className="pl-2 space-y-2">
                    {categoryStructure.map((category) => (
                      <div key={category._id} className="flex flex-col">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`category-${category._id}`}
                            checked={filters.categoryId === category._id}
                            onChange={() =>
                              handleFilterChange('category', category._id)
                            }
                            className="mr-2"
                          />
                          <label
                            htmlFor={`category-${category._id}`}
                            className="text-gray-700 hover:text-secondary-200 cursor-pointer"
                          >
                            {category.name}
                          </label>
                        </div>

                        {/* Show subcategories if parent category is selected */}
                        {filters.categoryId === category._id &&
                          category.subcategories &&
                          category.subcategories.length > 0 && (
                            <div className="ml-4 mt-2 space-y-2">
                              {category.subcategories.map((subcategory) => (
                                <div
                                  key={subcategory._id}
                                  className="flex items-center"
                                >
                                  <input
                                    type="checkbox"
                                    id={`subcategory-${subcategory._id}`}
                                    checked={
                                      filters.subCategoryId === subcategory._id
                                    }
                                    onChange={() =>
                                      handleFilterChange(
                                        'subcategory',
                                        subcategory._id
                                      )
                                    }
                                    className="mr-2"
                                  />
                                  <label
                                    htmlFor={`subcategory-${subcategory._id}`}
                                    className="text-gray-700 hover:text-secondary-200 cursor-pointer text-sm"
                                  >
                                    {subcategory.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Type Filter */}
              <div className="border-b pb-4 mb-4">
                <div
                  className="flex justify-between items-center mb-2 cursor-pointer"
                  onClick={() => toggleSection('productType')}
                >
                  <h3 className="font-semibold">Product Type</h3>
                  {expandedSections.productType ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </div>

                {expandedSections.productType && (
                  <div className="pl-2 space-y-2">
                    {productTypes.map((type) => (
                      <div key={type.value} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`product-type-${type.value}`}
                          checked={filters.productType.includes(type.value)}
                          onChange={() =>
                            handleFilterChange('productType', type.value)
                          }
                          className="mr-2"
                        />
                        <label
                          htmlFor={`product-type-${type.value}`}
                          className="text-gray-700 hover:text-secondary-200 cursor-pointer"
                        >
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Brand Filter */}
              <div className="border-b pb-4 mb-4">
                <div
                  className="flex justify-between items-center mb-2 cursor-pointer"
                  onClick={() => toggleSection('brand')}
                >
                  <h3 className="font-semibold">Brands</h3>
                  {expandedSections.brand ? <FaChevronUp /> : <FaChevronDown />}
                </div>

                {expandedSections.brand && (
                  <div className="pl-2 space-y-2 max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                      <div key={brand._id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`brand-${brand._id}`}
                          checked={filters.brandId === brand._id}
                          onChange={() =>
                            handleFilterChange('brand', brand._id)
                          }
                          className="mr-2"
                        />
                        <label
                          htmlFor={`brand-${brand._id}`}
                          className="text-gray-700 hover:text-secondary-200 cursor-pointer"
                        >
                          {brand.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Roast Level (for coffee products) */}
              <div className="border-b pb-4 mb-4">
                <div
                  className="flex justify-between items-center mb-2 cursor-pointer"
                  onClick={() => toggleSection('roastLevel')}
                >
                  <h3 className="font-semibold">Roast Level</h3>
                  {expandedSections.roastLevel ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </div>

                {expandedSections.roastLevel && (
                  <div className="pl-2 space-y-2">
                    {roastLevels.map((level) => (
                      <div key={level.value} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`roast-level-${level.value}`}
                          checked={filters.roastLevel.includes(level.value)}
                          onChange={() =>
                            handleFilterChange('roastLevel', level.value)
                          }
                          className="mr-2"
                        />
                        <label
                          htmlFor={`roast-level-${level.value}`}
                          className="text-gray-700 hover:text-secondary-200 cursor-pointer"
                        >
                          {level.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Intensity (for coffee products) */}
              <div className="border-b pb-4 mb-4">
                <div
                  className="flex justify-between items-center mb-2 cursor-pointer"
                  onClick={() => toggleSection('intensity')}
                >
                  <h3 className="font-semibold">Intensity</h3>
                  {expandedSections.intensity ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </div>

                {expandedSections.intensity && (
                  <div className="pl-2 space-y-2">
                    {intensityLevels.map((level) => (
                      <div key={level.value} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`intensity-${level.value}`}
                          checked={filters.intensity.includes(level.value)}
                          onChange={() =>
                            handleFilterChange('intensity', level.value)
                          }
                          className="mr-2"
                        />
                        <label
                          htmlFor={`intensity-${level.value}`}
                          className="text-gray-700 hover:text-secondary-200 cursor-pointer"
                        >
                          {level.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Blend Types (for coffee products) */}
              <div className="border-b pb-4 mb-4">
                <div
                  className="flex justify-between items-center mb-2 cursor-pointer"
                  onClick={() => toggleSection('blend')}
                >
                  <h3 className="font-semibold">Blend Type</h3>
                  {expandedSections.blend ? <FaChevronUp /> : <FaChevronDown />}
                </div>

                {expandedSections.blend && (
                  <div className="pl-2 space-y-2">
                    {blendTypes.map((blend) => (
                      <div key={blend.value} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`blend-${blend.value}`}
                          checked={filters.blend.includes(blend.value)}
                          onChange={() =>
                            handleFilterChange('blend', blend.value)
                          }
                          className="mr-2"
                        />
                        <label
                          htmlFor={`blend-${blend.value}`}
                          className="text-gray-700 hover:text-secondary-200 cursor-pointer"
                        >
                          {blend.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="pb-4 mb-4">
                <div
                  className="flex justify-between items-center mb-2 cursor-pointer"
                  onClick={() => toggleSection('price')}
                >
                  <h3 className="font-semibold">Price Range</h3>
                  {expandedSections.price ? <FaChevronUp /> : <FaChevronDown />}
                </div>

                {expandedSections.price && (
                  <div className="pl-2 space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">₦</span>
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) =>
                          handleFilterChange('minPrice', e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">₦</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) =>
                          handleFilterChange('maxPrice', e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <button
                      onClick={applyPriceRange}
                      className="w-full bg-secondary-200 text-white rounded py-1 text-sm hover:bg-secondary-100 transition"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Display */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex flex-wrap justify-between items-center">
                <div className="flex items-center mb-4 md:mb-0">
                  <button
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-md mr-4"
                  >
                    <FaFilter />
                    <span>Filters</span>
                  </button>
                  <span className="text-gray-600">
                    Showing{' '}
                    <span className="font-medium">{products.length}</span> of{' '}
                    <span className="font-medium">{totalProducts}</span>{' '}
                    products
                  </span>
                </div>

                <div className="flex flex-wrap items-center space-x-4">
                  {/* Sort dropdown */}
                  <div className="relative">
                    <select
                      value={filters.sort}
                      onChange={(e) =>
                        handleFilterChange('sort', e.target.value)
                      }
                      className="appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-8 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-secondary-200"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <FaChevronDown className="text-gray-500" size={12} />
                    </div>
                  </div>

                  {/* View switcher */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md ${
                        viewMode === 'grid'
                          ? 'bg-secondary-200 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      aria-label="Grid view"
                    >
                      <FaThLarge size={14} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md ${
                        viewMode === 'list'
                          ? 'bg-secondary-200 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      aria-label="List view"
                    >
                      <FaList size={14} />
                    </button>
                  </div>

                  {/* Items per page dropdown */}
                  <div className="relative">
                    <select
                      value={productsPerPage}
                      onChange={(e) => {
                        setProductsPerPage(Number(e.target.value));
                        fetchProducts(1, filters);
                      }}
                      className="appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-8 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-secondary-200"
                    >
                      <option value={12}>12 per page</option>
                      <option value={24}>24 per page</option>
                      <option value={36}>36 per page</option>
                      <option value={48}>48 per page</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <FaChevronDown className="text-gray-500" size={12} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              // Loading state
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary-200"></div>
              </div>
            ) : products.length === 0 ? (
              // No products found
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="text-gray-400 mb-4">
                  <FaSearch size={48} className="mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any products matching your filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-secondary-200 hover:bg-secondary-100 text-white font-medium py-2 px-4 rounded-md transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              // Grid view
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <CardProduct key={product._id} data={product} />
                ))}
              </div>
            ) : (
              // List view
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="flex flex-col md:flex-row bg-white rounded-lg shadow-sm overflow-hidden"
                  >
                    <div className="md:w-1/4 p-4 flex items-center justify-center bg-gray-50">
                      <div className="h-36 w-full relative">
                        <img
                          src={
                            product.image && product.image.length > 0
                              ? product.image[0]
                              : '/api/placeholder/200/200'
                          }
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="md:w-3/4 p-4 flex flex-col">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium mb-2">
                          <Link
                            to={`/product/${product.slug}`}
                            className="hover:text-secondary-200"
                          >
                            {product.name}
                          </Link>
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {product.productType && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              {product.productType
                                .replace('_', ' ')
                                .toLowerCase()
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                          )}
                          {product.brand && product.brand.length > 0 && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                              {product.brand[0].name}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {product.shortDescription ||
                            product.description?.substr(0, 150)}
                        </p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          {product.discount ? (
                            <div>
                              <span className="text-lg font-bold">
                                {typeof product.price === 'number' &&
                                typeof product.discount === 'number'
                                  ? `₦${(
                                      product.price *
                                      (1 - product.discount / 100)
                                    ).toFixed(2)}`
                                  : `₦${product.price}`}
                              </span>
                              <span className="text-sm text-gray-500 line-through ml-2">
                                ₦{product.price}
                              </span>
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full ml-2">
                                {product.discount}% OFF
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold">
                              ₦{product.price}
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                              product.stock > 0
                                ? 'bg-green-700 text-white hover:bg-green-800'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            disabled={product.stock <= 0}
                          >
                            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    First
                  </button>

                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Prev
                  </button>

                  {/* Page numbers */}
                  {[...Array(totalPages).keys()].map((page) => {
                    // Show current page, 2 pages before and after, first and last page
                    const pageNumber = page + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 2 &&
                        pageNumber <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === pageNumber
                              ? 'bg-secondary-200 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }

                    // Show dots for skipped pages
                    if (
                      (pageNumber === 2 && currentPage > 4) ||
                      (pageNumber === totalPages - 1 &&
                        currentPage < totalPages - 3)
                    ) {
                      return (
                        <span key={pageNumber} className="px-3 py-1">
                          ...
                        </span>
                      );
                    }

                    return null;
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Next
                  </button>

                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
