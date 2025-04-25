import React, { useState, useEffect } from 'react';
import { FaFilter, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { DisplayPriceInNaira } from '../utils/DisplayPriceInNaira';
import ActiveFilterChips from './ActiveFilterChips';

const ShopFilter = ({ onApplyFilters, initialFilters = {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchText = searchParams.get('q') || '';

  // Filter states
  const [filters, setFilters] = useState({
    productType: [],
    category: '',
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
    productType: true,
    category: true,
    roastLevel: true,
    intensity: true,
    blend: true,
    price: true,
  });
  const [priceRange, setPriceRange] = useState({
    min: '',
    max: '',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
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
      productType: ['COFFEE'],
      roastLevel: [],
      intensity: [],
      blend: [],
      sort: 'newest',
    };

    setFilters(defaultFilters);
    setPriceRange({ min: '', max: '' });
    onApplyFilters(defaultFilters);
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
    if (filters.roastLevel?.length) count += filters.roastLevel.length;
    if (filters.intensity?.length) count += filters.intensity.length;
    if (filters.blend?.length) count += filters.blend.length;
    if (priceRange.min || priceRange.max) count += 1;
    return count;
  };

  // Set initial price range from filters
  useEffect(() => {
    if (filters.minPrice || filters.maxPrice) {
      setPriceRange({
        min: filters.minPrice || '',
        max: filters.maxPrice || '',
      });
    }
  }, []);

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

          {/* Intensity */}
          <div className="mb-4 border-t pt-4">
            <div
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleSection('intensity')}
            >
              <h3 className="font-medium">Intensity</h3>
              {expandedSections.intensity ? <FaChevronUp /> : <FaChevronDown />}
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
                      id={`blend-${option.value}`}
                      checked={filters.blend?.includes(option.value)}
                      onChange={() => handleFilterChange('blend', option.value)}
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
