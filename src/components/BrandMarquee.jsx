import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BrandMarquee = ({ brands = [] }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [needsMarquee, setNeedsMarquee] = useState(false);
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  // Check if we need a marquee effect by comparing content width to container width
  useEffect(() => {
    if (!brands || brands.length === 0) return;

    const checkForMarquee = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const contentWidth = contentRef.current.scrollWidth;
        setNeedsMarquee(contentWidth > containerWidth);
      }
    };

    checkForMarquee();
    // Re-check on window resize
    window.addEventListener('resize', checkForMarquee);
    return () => window.removeEventListener('resize', checkForMarquee);
  }, [brands]);

  // Skip rendering content if no brands, but keep the component structure
  if (!brands || brands.length === 0) {
    return (
      <div className="w-full bg-gray-50 py-2 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 container mx-auto px-4">
          Our Brands
        </h2>
        <div className="flex flex-wrap justify-center gap-4 px-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={`loading-brand-${i}`}
              className="bg-white rounded-lg p-4 h-24 w-40 animate-pulse flex-shrink-0"
            >
              <div className="bg-gray-200 h-full w-full rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Manual scroll handlers
  const scrollLeft = () => {
    if (containerRef.current) {
      setIsPaused(true);
      containerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
      setTimeout(() => setIsPaused(false), 1000);
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      setIsPaused(true);
      containerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      setTimeout(() => setIsPaused(false), 1000);
    }
  };

  // Double the brands for seamless looping
  const displayBrands = needsMarquee ? [...brands, ...brands] : brands;

  return (
    <div className="w-full bg-gray-50 py-6 rounded-lg overflow-hidden relative">
      <div className="relative px-8">
        {' '}
        {/* Added padding for nav buttons */}
        {/* Marquee container */}
        <div ref={containerRef} className="overflow-hidden">
          <div
            ref={contentRef}
            className={`flex ${
              needsMarquee && !isPaused ? 'marquee-animation' : 'flex-nowrap'
            } scrollbar-hide`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
            {displayBrands.map((brand, index) => (
              <Link
                key={`${brand._id || index}-${index}`}
                to={`/brand/${brand.slug || brand._id}`}
                className="mx-2 mb-2 flex-shrink-0 bg-white rounded-lg p-2 flex items-center justify-center h-18 w-24 shadow hover:shadow-md transition-all transform hover:scale-105"
                title={`Browse ${brand.name} products`}
              >
                <img
                  src={
                    brand.image ||
                    `https://dummyimage.com/200x100/eeeeee/333333&text=${brand.name}`
                  }
                  alt={brand.name}
                  className="max-h-full max-w-full object-cover"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      {needsMarquee && (
        <>
          <button
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 z-10"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} className="text-gray-700" />
          </button>
          <button
            onClick={scrollRight}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 z-10"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} className="text-gray-700" />
          </button>
        </>
      )}

      {/* CSS for the marquee animation */}
      <style jsx>{`
        .marquee-animation {
          display: flex;
          animation: marquee 30s linear infinite;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default BrandMarquee;
