import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CardProduct from './CardProduct';

/**
 * Product Carousel with Category Filtering
 * @param {Object} props
 * @param {Array} props.products - Array of product objects
 * @param {Array} props.categories - Array of category objects
 * @param {String} props.title - Title for the carousel section
 * @param {Number} props.itemsPerSlide - Number of products per slide (default: 4)
 */
const CategoryFilterProductCarousel = ({
  products = [],
  categories = [],
  title = 'Products by Category',
  itemsPerSlide = 4,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filter products based on selected category
  useEffect(() => {
    setLoading(true);

    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter(
          (product) =>
            product &&
            product.category &&
            product.category._id === selectedCategory
        )
      );
    }

    // Reset to first slide when category changes
    setCurrentSlide(0);
    setLoading(false);
  }, [selectedCategory, products]);

  // Calculate the number of slides needed
  const slidesCount = Math.max(
    Math.ceil(filteredProducts.length / itemsPerSlide) - 1,
    0
  );

  // Navigation functions
  const nextSlide = () => {
    if (!filteredProducts || filteredProducts.length === 0) return;
    setCurrentSlide((prev) => (prev >= slidesCount ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (!filteredProducts || filteredProducts.length === 0) return;
    setCurrentSlide((prev) => (prev <= 0 ? slidesCount : prev - 1));
  };

  return (
    <div className="container mx-auto px-4 my-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">
          {title}
        </h2>

        {/* Category Filter Buttons */}
        <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0 whitespace-nowrap">
          <button
            className={`px-3 py-1.5 text-sm rounded-full ${
              selectedCategory === 'all'
                ? 'bg-secondary-200 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            } transition-colors`}
            onClick={() => setSelectedCategory('all')}
          >
            All Products
          </button>
          {categories &&
            categories.length > 0 &&
            categories.map((cat) => (
              <button
                key={cat._id}
                className={`px-3 py-1.5 text-sm rounded-full ${
                  selectedCategory === cat._id
                    ? 'bg-green-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                } transition-colors`}
                onClick={() => setSelectedCategory(cat._id)}
              >
                {cat.name}
              </button>
            ))}
        </div>
      </div>

      {/* Products Carousel */}
      <div className="relative">
        <div className="overflow-hidden">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={`loading-${item}`}
                  className="border rounded-lg p-4 h-80 animate-pulse"
                >
                  <div className="w-full h-40 bg-gray-200 rounded-md mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {Array.from({
                length: Math.max(
                  Math.ceil(filteredProducts.length / itemsPerSlide),
                  1
                ),
              }).map((_, slideIndex) => (
                <div
                  key={`category-slide-${slideIndex}`}
                  className="w-full flex-shrink-0"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts
                      .slice(
                        slideIndex * itemsPerSlide,
                        slideIndex * itemsPerSlide + itemsPerSlide
                      )
                      .map((product) => (
                        <CardProduct key={product._id} data={product} />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                No products found in this category.
              </p>
            </div>
          )}
        </div>

        {/* Navigation buttons - only show if we have multiple slides */}
        {filteredProducts.length > itemsPerSlide && (
          <>
            <button
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 md:-translate-x-4 bg-white shadow rounded-full p-2 hover:bg-gray-100 transition-colors z-10"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            <button
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 md:translate-x-4 bg-white shadow rounded-full p-2 hover:bg-gray-100 transition-colors z-10"
              onClick={nextSlide}
              aria-label="Next slide"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>
          </>
        )}
      </div>

      {/* Slide indicators */}
      {filteredProducts.length > itemsPerSlide && (
        <div className="flex justify-center mt-4 space-x-1">
          {Array.from({ length: slidesCount + 1 }).map((_, index) => (
            <button
              key={`indicator-${index}`}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full ${
                currentSlide === index ? 'bg-green-700' : 'bg-gray-300'
              } transition-colors`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryFilterProductCarousel;
