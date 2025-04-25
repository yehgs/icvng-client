import React from 'react';
import { FaFilter, FaThLarge, FaList, FaChevronDown } from 'react-icons/fa';

const ShopToolbar = ({
  setShowFilters,
  products,
  totalProducts,
  filters,
  handleFilterChange,
  sortOptions,
  viewMode,
  setViewMode,
  productsPerPage,
  setProductsPerPage,
  fetchProducts,
}) => {
  return (
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
            Showing <span className="font-medium">{products.length}</span> of{' '}
            <span className="font-medium">{totalProducts}</span> products
          </span>
        </div>

        <div className="flex flex-wrap items-center space-x-4">
          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
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
  );
};

export default ShopToolbar;
