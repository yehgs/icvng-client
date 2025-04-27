import React, { useState, useEffect } from 'react';
import { FaFilter, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { DisplayPriceInNaira } from '../utils/DisplayPriceInNaira';
import ActiveFilterChips from './ActiveFilterChips';

const ShopFilter = ({ onApplyFilters, initialFilters = {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const searchParams = new URLSearchParams(location.search);
  const searchText = searchParams.get('q') || '';
  const isUrlFilterActive = Boolean(params.categorySlug || params.brandSlug);

  // Filter states
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
    ...initialFilters,
  });

  // UI states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    productType: false,
    category: !isUrlFilterActive,
    subCategory: false,
    brand: false,
    roastLevel: false,
    intensity: false,
    blend: false,
    price: false,
  });
  const [priceRange, setPriceRange] = useState({
    min: '',
    max: '',
  });

  // Data states
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryMap, setCategoryMap] = useState({});
  const [subCategoryMap, setSubCategoryMap] = useState({});
  const [brandMap, setBrandMap] = useState({});

  // Available filter options
  const productTypeOptions = [
    { value: 'COFFEE', label: 'Coffee' },
    { value: 'COFFEE_BEANS', label: 'Coffee Beans' },
    { value: 'MACHINE', label: 'Machines' },
    { value: 'ACCESSORIES', label: 'Accessories' },
    { value: 'TEA', label: 'Tea' },
    { value: 'DRINKS', label: 'Drinks' },
  ];

  // Available filter options
  const roastLevelOptions = [
    { value: 'LIGHT', label: 'Light Roast' },
    { value: 'MEDIUM', label: 'Medium Roast' },
    { value: 'DARK', label: 'Dark Roast' },
  ];

  const intensityOptions = [
    { value: '1/10', label: '1 - Very Mild' },
    { value: '2/10', label: '2' },
    { value: '3/10', label: '3' },
    { value: '4/10', label: '4' },
    { value: '5/10', label: '5 - Medium' },
    { value: '6/10', label: '6' },
    { value: '7/10', label: '7' },
    { value: '8/10', label: '8' },
    { value: '9/10', label: '9' },
    { value: '10/10', label: '10 - Very Strong' },
  ];

  const blendOptions = [
    { value: '100% Arabica', label: '100% Arabica' },
    { value: '100% Robusta', label: 'Pure Robusta' },
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
    { value: 'Breakfast Blend', label: 'Breakfast Blend' },
    { value: 'House Blend', label: 'House Blend' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'alphabet', label: 'Name (A-Z)' },
  ];

  // Fetch categories, subcategories, and brands on component mount
  useEffect(() => {
    const fetchFilterData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const categoryResponse = await Axios({
          ...SummaryApi.getCategory,
          params: { active: true },
        });

        if (categoryResponse.data.success) {
          const categoryData = categoryResponse.data.data || [];
          setCategories(categoryData);

          // Create category ID to name mapping
          const catMap = {};
          categoryData.forEach((cat) => {
            catMap[cat._id] = cat.name;
          });
          setCategoryMap(catMap);
        }

        // Fetch brands
        const brandResponse = await Axios({
          ...SummaryApi.getBrand,
          params: { active: true },
        });

        if (brandResponse.data.success) {
          const brandData = brandResponse.data.data || [];
          setBrands(brandData);

          // Create brand ID to name mapping
          const bMap = {};
          brandData.forEach((brand) => {
            bMap[brand._id] = brand.name;
          });
          setBrandMap(bMap);
        }

        // If category is already selected, fetch subcategories
        if (filters.category) {
          fetchSubCategories(filters.category);
        }
      } catch (error) {
        AxiosToastError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterData();
  }, []);

  // Set initial price range from filters
  useEffect(() => {
    if (filters.minPrice || filters.maxPrice) {
      setPriceRange({
        min: filters.minPrice || '',
        max: filters.maxPrice || '',
      });
    }
  }, [filters.minPrice, filters.maxPrice]);

  // Fetch subcategories when category changes
  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }

    try {
      const response = await Axios({
        ...SummaryApi.getSubCategory,
        data: { category: categoryId },
      });

      if (response.data.success) {
        const subCategoryData = response.data.data || [];
        setSubCategories(subCategoryData);

        // Create subcategory ID to name mapping
        const subCatMap = {};
        subCategoryData.forEach((subCat) => {
          subCatMap[subCat._id] = subCat.name;
        });
        setSubCategoryMap(subCatMap);

        // Expand subcategory section if subcategories exist
        if (subCategoryData.length > 0) {
          setExpandedSections((prev) => ({ ...prev, subCategory: true }));
        }
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  // Handle filter change for categories
  const handleCategoryChange = (categoryId) => {
    // Clear subcategory if category changes
    setFilters((prevFilters) => ({
      ...prevFilters,
      category: categoryId,
      subCategory: '',
    }));

    // Fetch subcategories for the selected category
    fetchSubCategories(categoryId);
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'category') {
      handleCategoryChange(value);
      return;
    }

    setFilters((prevFilters) => {
      if (Array.isArray(prevFilters[filterType])) {
        // For array filters (checkboxes)
        if (prevFilters[filterType].includes(value)) {
          return {
            ...prevFilters,
            [filterType]: prevFilters[filterType].filter(
              (item) => item !== value
            ),
          };
        } else {
          return {
            ...prevFilters,
            [filterType]: [...prevFilters[filterType], value],
          };
        }
      } else {
        // For single value filters
        return {
          ...prevFilters,
          [filterType]: value,
        };
      }
    });
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle price range change
  const handlePriceChange = (type, value) => {
    setPriceRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    const updatedFilters = {
      ...filters,
      minPrice: priceRange.min ? Number(priceRange.min) : undefined,
      maxPrice: priceRange.max ? Number(priceRange.max) : undefined,
    };

    onApplyFilters(updatedFilters);
    setIsFilterOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {
      productType: [],
      category: '',
      subCategory: '',
      brand: [],
      roastLevel: [],
      intensity: [],
      blend: [],
      sort: 'newest',
    };

    setFilters(defaultFilters);
    setPriceRange({ min: '', max: '' });
    setSubCategories([]);
    onApplyFilters(defaultFilters);

    // If we're on a URL-filtered page, navigate back to shop
    if (isUrlFilterActive) {
      const currentSearch = location.search;
      navigate(`/shop${currentSearch}`);
    }
  };

  // Handle removing a single filter
  const handleRemoveFilter = (type, value) => {
    if (type === 'all') {
      resetFilters();
      return;
    }

    if (type === 'priceRange') {
      setPriceRange({ min: '', max: '' });
      setFilters((prev) => ({
        ...prev,
        minPrice: undefined,
        maxPrice: undefined,
      }));

      onApplyFilters({
        ...filters,
        minPrice: undefined,
        maxPrice: undefined,
      });

      return;
    }

    if (type === 'category') {
      // If we're on a URL-filtered page by category, navigate back to shop
      if (params.categorySlug) {
        const currentSearch = location.search;
        navigate(`/shop${currentSearch}`);
        return;
      }

      setFilters((prev) => ({
        ...prev,
        category: '',
        subCategory: '', // Also clear subcategory when category is removed
      }));

      setSubCategories([]);

      onApplyFilters({
        ...filters,
        category: '',
        subCategory: '',
      });
      return;
    }

    if (type === 'subCategory') {
      // If we're on a URL-filtered page by subcategory, navigate back to category
      if (params.subcategorySlug && params.categorySlug) {
        const currentSearch = location.search;
        navigate(`/category/${params.categorySlug}${currentSearch}`);
        return;
      }

      setFilters((prev) => ({
        ...prev,
        subCategory: '',
      }));

      onApplyFilters({
        ...filters,
        subCategory: '',
      });
      return;
    }

    if (type === 'brand' && params.brandSlug) {
      // If we're on a URL-filtered page by brand, navigate appropriately
      const currentSearch = location.search;

      if (params.subcategorySlug && params.categorySlug) {
        navigate(
          `/category/${params.categorySlug}/subcategory/${params.subcategorySlug}${currentSearch}`
        );
      } else if (params.categorySlug) {
        navigate(`/category/${params.categorySlug}${currentSearch}`);
      } else {
        navigate(`/shop${currentSearch}`);
      }
      return;
    }

    // Handle array filters (checkboxes)
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item !== value),
    }));

    onApplyFilters({
      ...filters,
      [type]: filters[type].filter((item) => item !== value),
    });
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.productType?.length) count += filters.productType.length;
    if (filters.category) count += 1;
    if (filters.subCategory) count += 1;
    if (filters.brand?.length) count += filters.brand.length;
    if (filters.roastLevel?.length) count += filters.roastLevel.length;
    if (filters.intensity?.length) count += filters.intensity.length;
    if (filters.blend?.length) count += filters.blend.length;
    if (priceRange.min || priceRange.max) count += 1;
    return count;
  };

  // Fetch categories, subcategories, and brands on component mount
  // useEffect(() => {
  //   const fetchFilterData = async () => {
  //     setLoading(true);
  //     try {
  //       // Fetch categories
  //       const categoryResponse = await Axios({
  //         ...SummaryApi.getCategory,
  //         params: { active: true },
  //       });

  //       if (categoryResponse.data.success) {
  //         setCategories(categoryResponse.data.data || []);
  //       }

  //       // Fetch brands - This is where brands are fetched
  //       const brandResponse = await Axios({
  //         ...SummaryApi.getBrand,
  //         params: { active: true },
  //       });

  //       if (brandResponse.data.success) {
  //         setBrands(brandResponse.data.data || []);
  //       }

  //       // If category is already selected, fetch subcategories
  //       if (filters.category) {
  //         fetchSubCategories(filters.category);
  //       }
  //     } catch (error) {
  //       AxiosToastError(error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchFilterData();
  // }, []);

  // //Set initial price range from filters
  // useEffect(() => {
  //   if (filters.minPrice || filters.maxPrice) {
  //     setPriceRange({
  //       min: filters.minPrice || '',
  //       max: filters.maxPrice || '',
  //     });
  //   }
  // }, []);

  return (
    <div className="w-full mb-4">
      {/* Mobile filter trigger */}
      <div className="lg:hidden flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm mb-4">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center text-gray-700 font-medium"
        >
          <FaFilter className="mr-2" />
          Filters
          {getActiveFilterCount() > 0 && (
            <span className="ml-2 bg-green-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
              {getActiveFilterCount()}
            </span>
          )}
        </button>

        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Sort by:</span>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="text-sm border rounded py-1 px-2"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Chips - Mobile */}
      <div className="lg:hidden">
        <ActiveFilterChips
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
        />
      </div>

      {/* Desktop sidebar filter */}
      <div className="hidden lg:block lg:w-64 lg:mr-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Filters</h2>
            {getActiveFilterCount() > 0 && (
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Active Filter Chips - Desktop */}
          <ActiveFilterChips
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
          />

          {/* Sort options */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Sort By</h3>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full border rounded py-2 px-3"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4 border-t pt-4">
            <div
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleSection('productType')}
            >
              <h3 className="font-medium">Product Type</h3>
              {expandedSections.productType ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </div>

            {expandedSections.productType && (
              <div className="space-y-2">
                {productTypeOptions.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`type-${option.value}`}
                      checked={filters.productType?.includes(option.value)}
                      onChange={() =>
                        handleFilterChange('productType', option.value)
                      }
                      className="mr-2"
                    />
                    <label htmlFor={`type-${option.value}`} className="text-sm">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category */}
          <div className="mb-4 border-t pt-4">
            <div
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleSection('category')}
            >
              <h3 className="font-medium">Category</h3>
              {expandedSections.category ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            {expandedSections.category && (
              <div className="space-y-2">
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    id="category-all"
                    name="category"
                    checked={!filters.category}
                    onChange={() => handleCategoryChange('')}
                    className="mr-2"
                  />
                  <label htmlFor="category-all" className="text-sm">
                    All Categories
                  </label>
                </div>

                {categories.map((category) => (
                  <div key={category._id} className="flex items-center">
                    <input
                      type="radio"
                      id={`category-${category._id}`}
                      name="category"
                      checked={filters.category === category._id}
                      onChange={() => handleCategoryChange(category._id)}
                      className="mr-2"
                    />
                    <label
                      htmlFor={`category-${category._id}`}
                      className="text-sm"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}

                {loading && (
                  <div className="text-sm text-gray-500">
                    Loading categories...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subcategory - Only show if a category is selected and subcategories exist */}
          {filters.category && subCategories.length > 0 && (
            <div className="mb-4 border-t pt-4">
              <div
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={() => toggleSection('subCategory')}
              >
                <h3 className="font-medium">Subcategory</h3>
                {expandedSections.subCategory ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </div>

              {expandedSections.subCategory && (
                <div className="space-y-2">
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      id="subcategory-all"
                      name="subcategory"
                      checked={!filters.subCategory}
                      onChange={() => handleFilterChange('subCategory', '')}
                      className="mr-2"
                    />
                    <label htmlFor="subcategory-all" className="text-sm">
                      All Subcategories
                    </label>
                  </div>

                  {subCategories.map((subCategory) => (
                    <div key={subCategory._id} className="flex items-center">
                      <input
                        type="radio"
                        id={`subcategory-${subCategory._id}`}
                        name="subcategory"
                        checked={filters.subCategory === subCategory._id}
                        onChange={() =>
                          handleFilterChange('subCategory', subCategory._id)
                        }
                        className="mr-2"
                      />
                      <label
                        htmlFor={`subcategory-${subCategory._id}`}
                        className="text-sm"
                      >
                        {subCategory.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Brands */}
          <div className="mb-4 border-t pt-4">
            <div
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleSection('brand')}
            >
              <h3 className="font-medium">Brands</h3>
              {expandedSections.brand ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            {expandedSections.brand && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {brands.map((brand) => (
                  <div key={brand._id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`brand-${brand._id}`}
                      checked={filters.brand?.includes(brand._id)}
                      onChange={() => handleFilterChange('brand', brand._id)}
                      className="mr-2"
                    />
                    <label htmlFor={`brand-${brand._id}`} className="text-sm">
                      {brand.name}
                    </label>
                  </div>
                ))}

                {loading && (
                  <div className="text-sm text-gray-500">Loading brands...</div>
                )}
                {!loading && brands.length === 0 && (
                  <div className="text-sm text-gray-500">
                    No brands available
                  </div>
                )}
              </div>
            )}
          </div>

          {(filters.productType.includes('COFFEE') ||
            filters.productType.includes('COFFEE_BEANS') ||
            filters.productType.length === 0) && (
            <div className="mb-4 border-t pt-4">
              <div
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={() => toggleSection('roastLevel')}
              >
                <h3 className="font-medium">Roast Level</h3>
                {expandedSections.roastLevel ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </div>

              {expandedSections.roastLevel && (
                <div className="space-y-2">
                  {roastLevelOptions.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`roast-${option.value}`}
                        checked={filters.roastLevel?.includes(option.value)}
                        onChange={() =>
                          handleFilterChange('roastLevel', option.value)
                        }
                        className="mr-2"
                      />
                      <label
                        htmlFor={`roast-${option.value}`}
                        className="text-sm"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Intensity - Only shown for Coffee and Coffee Beans */}
          {(filters.productType.includes('COFFEE') ||
            filters.productType.includes('COFFEE_BEANS') ||
            filters.productType.length === 0) && (
            <div className="mb-4 border-t pt-4">
              <div
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={() => toggleSection('intensity')}
              >
                <h3 className="font-medium">Intensity</h3>
                {expandedSections.intensity ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </div>

              {expandedSections.intensity && (
                <div className="grid grid-cols-2 gap-2">
                  {intensityOptions.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`intensity-${option.value}`}
                        checked={filters.intensity?.includes(option.value)}
                        onChange={() =>
                          handleFilterChange('intensity', option.value)
                        }
                        className="mr-1"
                      />
                      <label
                        htmlFor={`intensity-${option.value}`}
                        className="text-xs"
                      >
                        {option.label.substring(0, 8)}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Blend - Only shown for Coffee and Coffee Beans */}
          {(filters.productType.includes('COFFEE') ||
            filters.productType.includes('COFFEE_BEANS') ||
            filters.productType.length === 0) && (
            <div className="mb-4 border-t pt-4">
              <div
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={() => toggleSection('blend')}
              >
                <h3 className="font-medium">Coffee Blend</h3>
                {expandedSections.blend ? <FaChevronUp /> : <FaChevronDown />}
              </div>

              {expandedSections.blend && (
                <div className="space-y-2">
                  {blendOptions.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`blend-${option.value}`}
                        checked={filters.blend?.includes(option.value)}
                        onChange={() =>
                          handleFilterChange('blend', option.value)
                        }
                        className="mr-2"
                      />
                      <label
                        htmlFor={`blend-${option.value}`}
                        className="text-sm line-clamp-1"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Price Range */}
          <div className="mb-4 border-t pt-4">
            <div
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleSection('price')}
            >
              <h3 className="font-medium">Price Range</h3>
              {expandedSections.price ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            {expandedSections.price && (
              <div className="space-y-3">
                <div className="flex items-center">
                  <label className="text-sm mr-2">Min:</label>
                  <input
                    type="number"
                    placeholder="₦0"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    className="border rounded py-1 px-2 w-full"
                  />
                </div>
                <div className="flex items-center">
                  <label className="text-sm mr-2">Max:</label>
                  <input
                    type="number"
                    placeholder="₦100000"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    className="border rounded py-1 px-2 w-full"
                  />
                </div>
                <button
                  onClick={() => {
                    const updatedFilters = {
                      ...filters,
                      minPrice: priceRange.min
                        ? Number(priceRange.min)
                        : undefined,
                      maxPrice: priceRange.max
                        ? Number(priceRange.max)
                        : undefined,
                    };
                    onApplyFilters(updatedFilters);
                  }}
                  className="bg-green-600 text-white w-full py-1 rounded hover:bg-green-700 text-sm"
                >
                  Apply Price
                </button>
              </div>
            )}
          </div>

          <button
            onClick={applyFilters}
            className="bg-green-700 text-white w-full py-2 rounded hover:bg-green-800 mt-4"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden flex">
          <div className="bg-white w-4/5 max-w-md h-full ml-auto overflow-y-auto z-50 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Filters</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-gray-500"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {getActiveFilterCount() > 0 && (
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-800 mb-4"
              >
                Clear All Filters
              </button>
            )}

            {/* Active Filter Chips - Mobile */}
            <ActiveFilterChips
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              categoryMap={categoryMap}
              subCategoryMap={subCategoryMap}
              brandMap={brandMap}
            />

            {/* Sort options */}
            <div className="mb-4 border-t pt-4">
              <h3 className="font-medium mb-2">Sort By</h3>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full border rounded py-2 px-3"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Type */}
            <div className="mb-4 border-t pt-4">
              <div
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={() => toggleSection('productType')}
              >
                <h3 className="font-medium">Product Type</h3>
                {expandedSections.productType ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </div>

              {expandedSections.productType && (
                <div className="space-y-2">
                  {productTypeOptions.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`mobile-type-${option.value}`}
                        checked={filters.productType?.includes(option.value)}
                        onChange={() =>
                          handleFilterChange('productType', option.value)
                        }
                        className="mr-2"
                      />
                      <label
                        htmlFor={`mobile-type-${option.value}`}
                        className="text-sm"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category */}
            <div className="mb-4 border-t pt-4">
              <div
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={() => toggleSection('category')}
              >
                <h3 className="font-medium">Category</h3>
                {expandedSections.category ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </div>

              {expandedSections.category && (
                <div className="space-y-2">
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      id="mobile-category-all"
                      name="category"
                      checked={!filters.category}
                      onChange={() => handleCategoryChange('')}
                      className="mr-2"
                      disabled={isUrlFilterActive && params.categorySlug}
                    />
                    <label
                      htmlFor="mobile-category-all"
                      className={`text-sm ${
                        isUrlFilterActive && params.categorySlug
                          ? 'text-gray-400'
                          : ''
                      }`}
                    >
                      All Categories
                    </label>
                  </div>

                  {categories.map((category) => (
                    <div key={category._id} className="flex items-center">
                      <input
                        type="radio"
                        id={`mobile-category-${category._id}`}
                        name="category"
                        checked={filters.category === category._id}
                        onChange={() => handleCategoryChange(category._id)}
                        className="mr-2"
                        disabled={isUrlFilterActive && params.categorySlug}
                      />
                      <label
                        htmlFor={`mobile-category-${category._id}`}
                        className={`text-sm ${
                          isUrlFilterActive && params.categorySlug
                            ? 'text-gray-400'
                            : ''
                        }`}
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Roast Level */}
            <div className="mb-4 border-t pt-4">
              <div
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={() => toggleSection('roastLevel')}
              >
                <h3 className="font-medium">Roast Level</h3>
                {expandedSections.roastLevel ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </div>

              {expandedSections.roastLevel && (
                <div className="space-y-2">
                  {roastLevelOptions.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`mobile-roast-${option.value}`}
                        checked={filters.roastLevel?.includes(option.value)}
                        onChange={() =>
                          handleFilterChange('roastLevel', option.value)
                        }
                        className="mr-2"
                      />
                      <label
                        htmlFor={`mobile-roast-${option.value}`}
                        className="text-sm"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Intensity */}
            <div className="mb-4 border-t pt-4">
              <div
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={() => toggleSection('intensity')}
              >
                <h3 className="font-medium">Intensity</h3>
                {expandedSections.intensity ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </div>

              {expandedSections.intensity && (
                <div className="grid grid-cols-2 gap-2">
                  {intensityOptions.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`mobile-intensity-${option.value}`}
                        checked={filters.intensity?.includes(option.value)}
                        onChange={() =>
                          handleFilterChange('intensity', option.value)
                        }
                        className="mr-1"
                      />
                      <label
                        htmlFor={`mobile-intensity-${option.value}`}
                        className="text-sm"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Blend */}
            <div className="mb-4 border-t pt-4">
              <div
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={() => toggleSection('blend')}
              >
                <h3 className="font-medium">Coffee Blend</h3>
                {expandedSections.blend ? <FaChevronUp /> : <FaChevronDown />}
              </div>

              {expandedSections.blend && (
                <div className="space-y-2">
                  {blendOptions.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`mobile-blend-${option.value}`}
                        checked={filters.blend?.includes(option.value)}
                        onChange={() =>
                          handleFilterChange('blend', option.value)
                        }
                        className="mr-2"
                      />
                      <label
                        htmlFor={`mobile-blend-${option.value}`}
                        className="text-sm"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range */}
            <div className="mb-4 border-t pt-4">
              <div
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={() => toggleSection('price')}
              >
                <h3 className="font-medium">Price Range</h3>
                {expandedSections.price ? <FaChevronUp /> : <FaChevronDown />}
              </div>

              {expandedSections.price && (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <label className="text-sm mr-2">Min:</label>
                    <input
                      type="number"
                      placeholder="₦0"
                      value={priceRange.min}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                      className="border rounded py-1 px-2 w-full"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="text-sm mr-2">Max:</label>
                    <input
                      type="number"
                      placeholder="₦100000"
                      value={priceRange.max}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                      className="border rounded py-1 px-2 w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
              <button
                onClick={applyFilters}
                className="bg-green-700 text-white w-full py-3 rounded hover:bg-green-800"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopFilter;
