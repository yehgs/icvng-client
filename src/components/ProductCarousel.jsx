import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CardProduct from './CardProduct';

/**
 * Reusable Product Carousel component
 * @param {Object} props
 * @param {Array} props.products - Array of product objects
 * @param {String} props.title - Title for the carousel section
 * @param {String} props.subtitle - Optional subtitle for the carousel
 * @param {Number} props.itemsPerSlide - Number of products per slide (default: 4)
 * @param {Boolean} props.autoplay - Enable autoplay (default: false)
 * @param {Number} props.autoplaySpeed - Autoplay speed in ms (default: 5000)
 */
const ProductCarousel = ({
  products = [],
  title = 'Products',
  subtitle,
  itemsPerSlide = 4,
  autoplay = false,
  autoplaySpeed = 5000,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate the number of slides needed
  const slidesCount = Math.max(
    Math.ceil(products.length / itemsPerSlide) - 1,
    0
  );

  // Adjust itemsPerSlide based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        itemsPerSlide = 1;
      } else if (window.innerWidth < 768) {
        itemsPerSlide = 2;
      } else if (window.innerWidth < 1024) {
        itemsPerSlide = 3;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call on initial render

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay || isHovered || products.length <= itemsPerSlide) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev >= slidesCount ? 0 : prev + 1));
    }, autoplaySpeed);

    return () => clearInterval(interval);
  }, [
    autoplay,
    isHovered,
    slidesCount,
    autoplaySpeed,
    products.length,
    itemsPerSlide,
  ]);

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev >= slidesCount ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev <= 0 ? slidesCount : prev - 1));
  };

  // If no products, show a loading state or hide
  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4 my-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        {subtitle && <p className="text-gray-600 mb-4">{subtitle}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={`skeleton-${item}`}
              className="border rounded-lg p-4 h-80 animate-pulse"
            >
              <div className="w-full h-40 bg-gray-200 rounded-md mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto px-4 my-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>

        {/* Slide navigation dots */}
        {slidesCount > 0 && (
          <div className="flex space-x-1">
            {Array.from({ length: slidesCount + 1 }).map((_, index) => (
              <button
                key={`dot-${index}`}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full ${
                  currentSlide === index ? 'bg-green-700' : 'bg-gray-300'
                } transition-colors`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {Array.from({
              length: Math.max(Math.ceil(products.length / itemsPerSlide), 1),
            }).map((_, slideIndex) => (
              <div key={`slide-${slideIndex}`} className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products
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
        </div>

        {/* Navigation arrows - only show if we have multiple slides */}
        {slidesCount > 0 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 md:-translate-x-4 bg-white shadow rounded-full p-2 hover:bg-gray-100 transition-colors z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 md:translate-x-4 bg-white shadow rounded-full p-2 hover:bg-gray-100 transition-colors z-10"
              aria-label="Next slide"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCarousel;
