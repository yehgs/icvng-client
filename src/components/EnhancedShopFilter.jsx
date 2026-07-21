import React, { useState, useEffect } from "react";
import { FaFilter, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import ActiveFilterChips from "./ActiveFilterChips";
import { useCountry } from "../context/CountryContext";

const ShopFilter = ({
  onApplyFilters,
  initialFilters = {},
  onRemoveFilter,
  onResetFilters,
}) => {
  const { t, country } = useCountry();
  const currencySymbol = country?.currency?.symbol || "₦";
  // Filter states
  const [filters, setFilters] = useState({
    productType: [],
    category: "",
    subCategory: "",
    brand: [],
    compatibleSystem: "",
    compatibleSystemName: "",
    roastLevel: [],
    intensity: [],
    blend: [],
    minPrice: "",
    maxPrice: "",
    sort: "newest",
    ...initialFilters,
  });

  // UI states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    productType: false,
    category: true,
    subCategory: false,
    brand: false,
    compatibleSystem: false,
    roastLevel: false,
    intensity: false,
    blend: false,
    price: false,
  });
  const [priceRange, setPriceRange] = useState({
    min: initialFilters.minPrice || "",
    max: initialFilters.maxPrice || "",
  });

  // Data states
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [compatibleBrands, setCompatibleBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryMap, setCategoryMap] = useState({});
  const [subCategoryMap, setSubCategoryMap] = useState({});
  const [brandMap, setBrandMap] = useState({});

  // Update local state when initialFilters change
  useEffect(() => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...initialFilters,
    }));

    setPriceRange({
      min: initialFilters.minPrice || "",
      max: initialFilters.maxPrice || "",
    });

    // If a category is selected in initialFilters, fetch subcategories
    if (
      initialFilters.category &&
      initialFilters.category !== filters.category
    ) {
      fetchSubCategories(initialFilters.category);
    }
  }, [initialFilters]);

  // Available filter options
  const productTypeOptions = [
    { value: "COFFEE", label: t("shop.typeCoffee") },
    { value: "COFFEE_BEANS", label: t("shop.typeCoffeeBeans") },
    { value: "MACHINE", label: t("shop.typeMachine") },
    { value: "ACCESSORIES", label: t("shop.typeAccessories") },
    { value: "TEA", label: t("shop.typeTea") },
    { value: "DRINKS", label: t("shop.typeDrinks") },
  ];

  // Available filter options
  const roastLevelOptions = [
    { value: "LIGHT", label: t("shop.roastLight") },
    { value: "MEDIUM", label: t("shop.roastMedium") },
    { value: "DARK", label: t("shop.roastDark") },
  ];

  const intensityOptions = [
    { value: "1/10", label: `1 - ${t("shop.intensityVeryMild")}` },
    { value: "2/10", label: "2" },
    { value: "3/10", label: "3" },
    { value: "4/10", label: "4" },
    { value: "5/10", label: `5 - ${t("shop.intensityMedium")}` },
    { value: "6/10", label: "6" },
    { value: "7/10", label: "7" },
    { value: "8/10", label: "8" },
    { value: "9/10", label: "9" },
    { value: "10/10", label: `10 - ${t("shop.intensityVeryStrong")}` },
  ];

  const blendOptions = [
    { value: "100% Arabica", label: t("shop.blendPureArabica") },
    { value: "100% Robusta", label: t("shop.blendPureRobusta") },
    {
      value: "Arabica/Robusta Blend (70/30)",
      label: t("shop.blend7030"),
    },
    {
      value: "Arabica/Robusta Blend (80/20)",
      label: t("shop.blend8020"),
    },
    {
      value: "Arabica/Robusta Blend (40/60)",
      label: t("shop.blend4060"),
    },
    { value: "Single Origin Arabica", label: t("shop.blendSingleOriginArabica") },
    { value: "Espresso Blend", label: t("shop.blendEspresso") },
    { value: "Breakfast Blend", label: t("shop.blendBreakfast") },
    { value: "House Blend", label: t("shop.blendHouse") },
  ];

  const sortOptions = [
    { value: "newest", label: t("shop.sortNewestFirst") },
    { value: "price-low", label: t("shop.sortPriceLowHigh") },
    { value: "price-high", label: t("shop.sortPriceHighLow") },
    { value: "popularity", label: t("shop.sortPopularity") },
    { value: "alphabet", label: t("shop.sortNameAZ") },
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

        // Fetch compatible system brands (brands with compatibleSystem: true)
        try {
          const compatResponse = await Axios({
            ...SummaryApi.getCompatibleSystemStructure,
          });
          if (compatResponse.data.success) {
            setCompatibleBrands(compatResponse.data.data || []);
          }
        } catch (_) {}

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
      subCategory: "",
    }));

    // Fetch subcategories for the selected category
    fetchSubCategories(categoryId);
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    if (filterType === "category") {
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
              (item) => item !== value,
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
      minPrice: priceRange.min ? Number(priceRange.min) : "",
      maxPrice: priceRange.max ? Number(priceRange.max) : "",
    };

    onApplyFilters(updatedFilters);
    setIsFilterOpen(false);
  };

  // Reset filters - use the prop if provided
  const handleResetFilters = () => {
    if (onResetFilters) {
      onResetFilters(true);
    } else {
      const defaultFilters = {
        productType: [],
        category: "",
        subCategory: "",
        brand: [],
        compatibleSystem: "",
        compatibleSystemName: "",
        roastLevel: [],
        intensity: [],
        blend: [],
        sort: "newest",
        minPrice: "",
        maxPrice: "",
      };

      setFilters(defaultFilters);
      setPriceRange({ min: "", max: "" });
      setSubCategories([]);
      onApplyFilters(defaultFilters);
    }
  };

  // Handle removing a single filter
  const handleRemoveFilter = (type, value) => {
    if (onRemoveFilter) {
      onRemoveFilter(type, value);
      return;
    }

    if (type === "all") {
      handleResetFilters();
      return;
    }

    if (type === "priceRange") {
      setPriceRange({ min: "", max: "" });
      setFilters((prev) => ({ ...prev, minPrice: "", maxPrice: "" }));
      onApplyFilters({ ...filters, minPrice: "", maxPrice: "" });
      return;
    }

    if (type === "compatibleSystem") {
      const updated = {
        ...filters,
        compatibleSystem: "",
        compatibleSystemName: "",
      };
      setFilters(updated);
      onApplyFilters(updated);
      return;
    }

    if (Array.isArray(filters[type])) {
      const updated = filters[type].filter((item) => item !== value);
      setFilters((prev) => ({ ...prev, [type]: updated }));
      onApplyFilters({ ...filters, [type]: updated });
      return;
    }

    setFilters((prev) => ({ ...prev, [type]: "" }));
    onApplyFilters({ ...filters, [type]: "" });
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.productType?.length) count += filters.productType.length;
    if (filters.category) count += 1;
    if (filters.subCategory) count += 1;
    if (filters.brand?.length) count += filters.brand.length;
    if (filters.compatibleSystem) count += 1;
    if (filters.roastLevel?.length) count += filters.roastLevel.length;
    if (filters.intensity?.length) count += filters.intensity.length;
    if (filters.blend?.length) count += filters.blend.length;
    if (priceRange.min || priceRange.max) count += 1;
    return count;
  };

  return (
    <div className="w-full mb-4">
      {/* Mobile filter trigger */}
      <div className="lg:hidden flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm mb-4">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center text-gray-700 font-medium"
        >
          <FaFilter className="mr-2" />
          {t("shop.filters")}
          {getActiveFilterCount() > 0 && (
            <span className="ml-2 bg-green-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
              {getActiveFilterCount()}
            </span>
          )}
        </button>

        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">{t("shop.sortByColon")}</span>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange("sort", e.target.value)}
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
          categoryMap={categoryMap}
          subCategoryMap={subCategoryMap}
          brandMap={brandMap}
        />
      </div>

      {/* Desktop sidebar filter */}
      <div className="hidden lg:block lg:w-64 lg:mr-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">{t("shop.filters")}</h2>
            {getActiveFilterCount() > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {t("shop.clearAll")}
              </button>
            )}
          </div>

          {/* Active Filter Chips - Desktop */}
          <ActiveFilterChips
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            categoryMap={categoryMap}
            subCategoryMap={subCategoryMap}
            brandMap={brandMap}
          />

          {/* Sort options */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">{t("shop.sortBy")}</h3>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              className="w-full border rounded py-2 px-3"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Brands */}
          <div className="mb-4 border-t pt-4">
            <div
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleSection("brand")}
            >
              <h3 className="font-medium">{t("shop.brands")}</h3>
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
                      onChange={() => handleFilterChange("brand", brand._id)}
                      className="mr-2"
                    />
                    <label htmlFor={`brand-${brand._id}`} className="text-sm">
                      {brand.name}
                    </label>
                  </div>
                ))}

                {loading && (
                  <div className="text-sm text-gray-500">{t("shop.loadingBrands")}</div>
                )}
                {!loading && brands.length === 0 && (
                  <div className="text-sm text-gray-500">
                    {t("shop.noBrandsAvailable")}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Compatible System */}
          {compatibleBrands.length > 0 && (
            <div className="mb-4 border-t pt-4">
              <div
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={() => toggleSection("compatibleSystem")}
              >
                <h3 className="font-medium">{t("shop.compatibleSystem")}</h3>
                {expandedSections.compatibleSystem ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </div>

              {expandedSections.compatibleSystem && (
                <div className="space-y-2">
                  <div className="flex items-center mb-1">
                    <input
                      type="radio"
                      id="compat-all"
                      name="compatibleSystem"
                      checked={!filters.compatibleSystem}
                      onChange={() =>
                        handleFilterChange("compatibleSystem", "")
                      }
                      className="mr-2"
                    />
                    <label htmlFor="compat-all" className="text-sm">
                      {t("shop.allSystems")}
                    </label>
                  </div>
                  {compatibleBrands.map((cs) => (
                    <div key={cs._id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`compat-${cs._id}`}
                        name="compatibleSystem"
                        checked={filters.compatibleSystem === cs._id}
                        onChange={() =>
                          handleFilterChange("compatibleSystem", cs._id)
                        }
                        className="mr-1 flex-shrink-0"
                      />
                      {cs.image && (
                        <img
                          src={cs.image}
                          alt={cs.name}
                          className="w-10 h-5 object-contain flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                      <label
                        htmlFor={`compat-${cs._id}`}
                        className="text-sm cursor-pointer"
                      >
                        {cs.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Category */}
          <div className="mb-4 border-t pt-4">
            <div
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleSection("category")}
            >
              <h3 className="font-medium">{t("shop.category")}</h3>
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
                    onChange={() => handleCategoryChange("")}
                    className="mr-2"
                  />
                  <label htmlFor="category-all" className="text-sm">
                    {t("shop.allCategories")}
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
                    {t("shop.loadingCategories")}
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
                onClick={() => toggleSection("subCategory")}
              >
                <h3 className="font-medium">{t("shop.subcategory")}</h3>
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
                      onChange={() => handleFilterChange("subCategory", "")}
                      className="mr-2"
                    />
                    <label htmlFor="subcategory-all" className="text-sm">
                      {t("shop.allSubcategories")}
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
                          handleFilterChange("subCategory", subCategory._id)
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

          {/* Product Type */}
          <div className="mb-4 border-t pt-4">
            <div
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleSection("productType")}
            >
              <h3 className="font-medium">{t("shop.productType")}</h3>
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
                        handleFilterChange("productType", option.value)
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

          {/* Show roast level, intensity, and blend for coffee products */}
          {(filters.productType.includes("COFFEE") ||
            filters.productType.includes("COFFEE_BEANS") ||
            filters.productType.length === 0) && (
            <>
              {/* Roast Level */}
              <div className="mb-4 border-t pt-4">
                <div
                  className="flex justify-between items-center cursor-pointer mb-2"
                  onClick={() => toggleSection("roastLevel")}
                >
                  <h3 className="font-medium">{t("shop.roastLevel")}</h3>
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
                            handleFilterChange("roastLevel", option.value)
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

              {/* Intensity */}
              <div className="mb-4 border-t pt-4">
                <div
                  className="flex justify-between items-center cursor-pointer mb-2"
                  onClick={() => toggleSection("intensity")}
                >
                  <h3 className="font-medium">{t("shop.intensity")}</h3>
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
                            handleFilterChange("intensity", option.value)
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

              {/* Blend */}
              <div className="mb-4 border-t pt-4">
                <div
                  className="flex justify-between items-center cursor-pointer mb-2"
                  onClick={() => toggleSection("blend")}
                >
                  <h3 className="font-medium">{t("shop.coffeeBlend")}</h3>
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
                            handleFilterChange("blend", option.value)
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
            </>
          )}

          {/* Price Range */}
          <div className="mb-4 border-t pt-4">
            <div
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleSection("price")}
            >
              <h3 className="font-medium">{t("shop.priceRange")}</h3>
              {expandedSections.price ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            {expandedSections.price && (
              <div className="space-y-3">
                <div className="flex items-center">
                  <label className="text-sm mr-2">{t("shop.min")}:</label>
                  <input
                    type="number"
                    placeholder={`${currencySymbol}0`}
                    min={0}
                    step={1}
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange("min", e.target.value)}
                    className="border rounded py-1 px-2 w-full"
                  />
                </div>
                <div className="flex items-center">
                  <label className="text-sm mr-2">{t("shop.max")}:</label>
                  <input
                    type="number"
                    placeholder={`${currencySymbol}100000`}
                    min={0}
                    step={1}
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange("max", e.target.value)}
                    className="border rounded py-1 px-2 w-full"
                  />
                </div>
                <button
                  onClick={() => {
                    const updatedFilters = {
                      ...filters,
                      minPrice: priceRange.min ? Number(priceRange.min) : "",
                      maxPrice: priceRange.max ? Number(priceRange.max) : "",
                    };
                    onApplyFilters(updatedFilters);
                  }}
                  className="bg-green-600 text-white w-full py-1 rounded hover:bg-green-700 text-sm"
                >
                  {t("shop.applyPrice")}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={applyFilters}
            className="bg-green-700 text-white w-full py-2 rounded hover:bg-green-800 mt-4"
          >
            {t("shop.applyFilters")}
          </button>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden flex">
          <div className="bg-white w-4/5 max-w-md h-full ml-auto overflow-y-auto z-50 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">{t("shop.filters")}</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-gray-500"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {getActiveFilterCount() > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-sm text-blue-600 hover:text-blue-800 mb-4"
              >
                {t("shop.clearAllFilters")}
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
              <h3 className="font-medium mb-2">{t("shop.sortBy")}</h3>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="w-full border rounded py-2 px-3"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Brands */}
            <div className="mb-4 border-t pt-4">
              <div
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={() => toggleSection("brand")}
              >
                <h3 className="font-medium">{t("shop.brands")}</h3>
                {expandedSections.brand ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedSections.brand && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {brands.map((brand) => (
                    <div key={brand._id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`mob2-brand-${brand._id}`}
                        checked={filters.brand?.includes(brand._id)}
                        onChange={() => handleFilterChange("brand", brand._id)}
                        className="mr-2"
                      />
                      <label
                        htmlFor={`mob2-brand-${brand._id}`}
                        className="text-sm"
                      >
                        {brand.name}
                      </label>
                    </div>
                  ))}
                  {loading && (
                    <div className="text-sm text-gray-500">{t("shop.loading")}</div>
                  )}
                  {!loading && brands.length === 0 && (
                    <div className="text-sm text-gray-500">
                      {t("shop.noBrandsAvailable")}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Compatible System */}
            {compatibleBrands.length > 0 && (
              <div className="mb-4 border-t pt-4">
                <div
                  className="flex justify-between items-center cursor-pointer mb-2"
                  onClick={() => toggleSection("compatibleSystem")}
                >
                  <h3 className="font-medium">{t("shop.compatibleSystem")}</h3>
                  {expandedSections.compatibleSystem ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </div>
                {expandedSections.compatibleSystem && (
                  <div className="space-y-2">
                    <div className="flex items-center mb-1">
                      <input
                        type="radio"
                        id="mob2-compat-all"
                        name="mob2-compatibleSystem"
                        checked={!filters.compatibleSystem}
                        onChange={() =>
                          handleFilterChange("compatibleSystem", "")
                        }
                        className="mr-2"
                      />
                      <label htmlFor="mob2-compat-all" className="text-sm">
                        {t("shop.allSystems")}
                      </label>
                    </div>
                    {compatibleBrands.map((cs) => (
                      <div key={cs._id} className="flex items-center gap-2">
                        <input
                          type="radio"
                          id={`mob2-compat-${cs._id}`}
                          name="mob2-compatibleSystem"
                          checked={filters.compatibleSystem === cs._id}
                          onChange={() =>
                            handleFilterChange("compatibleSystem", cs._id)
                          }
                          className="mr-1 flex-shrink-0"
                        />
                        {cs.image && (
                          <img
                            src={cs.image}
                            alt={cs.name}
                            className="w-10 h-5 object-contain flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <label
                          htmlFor={`mob2-compat-${cs._id}`}
                          className="text-sm cursor-pointer"
                        >
                          {cs.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Mobile filters - Product Type */}
            {/* Product Type */}
            <div className="mb-4 border-t pt-4">
              <div
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={() => toggleSection("productType")}
              >
                <h3 className="font-medium">{t("shop.productType")}</h3>
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
                          handleFilterChange("productType", option.value)
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
                onClick={() => toggleSection("category")}
              >
                <h3 className="font-medium">{t("shop.category")}</h3>
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
                      onChange={() => handleCategoryChange("")}
                      className="mr-2"
                    />
                    <label htmlFor="mobile-category-all" className="text-sm">
                      {t("shop.allCategories")}
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
                      />
                      <label
                        htmlFor={`mobile-category-${category._id}`}
                        className="text-sm"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}

                  {loading && (
                    <div className="text-sm text-gray-500">
                      {t("shop.loadingCategories")}
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
                  onClick={() => toggleSection("subCategory")}
                >
                  <h3 className="font-medium">{t("shop.subcategory")}</h3>
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
                        id="mobile-subcategory-all"
                        name="subcategory"
                        checked={!filters.subCategory}
                        onChange={() => handleFilterChange("subCategory", "")}
                        className="mr-2"
                      />
                      <label
                        htmlFor="mobile-subcategory-all"
                        className="text-sm"
                      >
                        {t("shop.allSubcategories")}
                      </label>
                    </div>

                    {subCategories.map((subCategory) => (
                      <div key={subCategory._id} className="flex items-center">
                        <input
                          type="radio"
                          id={`mobile-subcategory-${subCategory._id}`}
                          name="subcategory"
                          checked={filters.subCategory === subCategory._id}
                          onChange={() =>
                            handleFilterChange("subCategory", subCategory._id)
                          }
                          className="mr-2"
                        />
                        <label
                          htmlFor={`mobile-subcategory-${subCategory._id}`}
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

            {/* Show coffee-specific filters only for coffee products */}
            {(filters.productType.includes("COFFEE") ||
              filters.productType.includes("COFFEE_BEANS") ||
              filters.productType.length === 0) && (
              <>
                {/* Roast Level */}
                <div className="mb-4 border-t pt-4">
                  <div
                    className="flex justify-between items-center cursor-pointer mb-2"
                    onClick={() => toggleSection("roastLevel")}
                  >
                    <h3 className="font-medium">{t("shop.roastLevel")}</h3>
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
                              handleFilterChange("roastLevel", option.value)
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
                    onClick={() => toggleSection("intensity")}
                  >
                    <h3 className="font-medium">{t("shop.intensity")}</h3>
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
                              handleFilterChange("intensity", option.value)
                            }
                            className="mr-1"
                          />
                          <label
                            htmlFor={`mobile-intensity-${option.value}`}
                            className="text-sm"
                          >
                            {option.label.substring(0, 8)}
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
                    onClick={() => toggleSection("blend")}
                  >
                    <h3 className="font-medium">{t("shop.coffeeBlend")}</h3>
                    {expandedSections.blend ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
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
                              handleFilterChange("blend", option.value)
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
              </>
            )}

            {/* Mobile Price Range */}
            <div className="mb-4 border-t pt-4">
              <div
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={() => toggleSection("price")}
              >
                <h3 className="font-medium">{t("shop.priceRange")}</h3>
                {expandedSections.price ? <FaChevronUp /> : <FaChevronDown />}
              </div>

              {expandedSections.price && (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <label className="text-sm mr-2">{t("shop.min")}:</label>
                    <input
                      type="number"
                      placeholder={`${currencySymbol}0`}
                      value={priceRange.min}
                      onChange={(e) => handlePriceChange("min", e.target.value)}
                      className="border rounded py-1 px-2 w-full"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="text-sm mr-2">{t("shop.max")}:</label>
                    <input
                      type="number"
                      placeholder={`${currencySymbol}100000`}
                      value={priceRange.max}
                      onChange={(e) => handlePriceChange("max", e.target.value)}
                      className="border rounded py-1 px-2 w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Apply button - fixed at bottom for mobile */}
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
              <button
                onClick={applyFilters}
                className="bg-green-700 text-white w-full py-3 rounded hover:bg-green-800"
              >
                {t("shop.applyFilters")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopFilter;
