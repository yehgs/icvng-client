import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import all customer images explicitly
import customer1 from '../assets/customers/1.png';
import customer2 from '../assets/customers/2.png';
import customer3 from '../assets/customers/3.png';
import customer4 from '../assets/customers/4.png';
import customer5 from '../assets/customers/5.png';
import customer6 from '../assets/customers/6.png';
import customer7 from '../assets/customers/7.png';
import customer8 from '../assets/customers/8.png';
import customer9 from '../assets/customers/9.png';
import customer10 from '../assets/customers/10.png';
import customer11 from '../assets/customers/11.png';
import customer12 from '../assets/customers/12.png';
import customer13 from '../assets/customers/13.png';
import customer14 from '../assets/customers/14.png';
import customer15 from '../assets/customers/15.png';
import customer16 from '../assets/customers/16.png';
import customer17 from '../assets/customers/17.png';
import customer18 from '../assets/customers/18.png';
import customer19 from '../assets/customers/19.png';
import customer20 from '../assets/customers/20.png';
import customer21 from '../assets/customers/21.png';
import customer22 from '../assets/customers/22.png';

// Create customer images array
const customerImages = [
  { id: 1, image: customer1, alt: 'Customer 1' },
  { id: 2, image: customer2, alt: 'Customer 2' },
  { id: 3, image: customer3, alt: 'Customer 3' },
  { id: 4, image: customer4, alt: 'Customer 4' },
  { id: 5, image: customer5, alt: 'Customer 5' },
  { id: 6, image: customer6, alt: 'Customer 6' },
  { id: 7, image: customer7, alt: 'Customer 7' },
  { id: 8, image: customer8, alt: 'Customer 8' },
  { id: 9, image: customer9, alt: 'Customer 9' },
  { id: 10, image: customer10, alt: 'Customer 10' },
  { id: 11, image: customer11, alt: 'Customer 11' },
  { id: 12, image: customer12, alt: 'Customer 12' },
  { id: 13, image: customer13, alt: 'Customer 13' },
  { id: 14, image: customer14, alt: 'Customer 14' },
  { id: 15, image: customer15, alt: 'Customer 15' },
  { id: 16, image: customer16, alt: 'Customer 16' },
  { id: 17, image: customer17, alt: 'Customer 17' },
  { id: 18, image: customer18, alt: 'Customer 18' },
  { id: 19, image: customer19, alt: 'Customer 19' },
  { id: 20, image: customer20, alt: 'Customer 20' },
  { id: 21, image: customer21, alt: 'Customer 21' },
  { id: 22, image: customer22, alt: 'Customer 22' },
];

const CustomerMarquee = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [needsMarquee, setNeedsMarquee] = useState(false);
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  // Check if we need a marquee effect by comparing content width to container width
  useEffect(() => {
    const checkForMarquee = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const contentWidth = contentRef.current.scrollWidth;
        setNeedsMarquee(contentWidth > containerWidth);
      }
    };

    // Small delay to ensure images are rendered
    const timer = setTimeout(checkForMarquee, 100);

    // Re-check on window resize
    window.addEventListener('resize', checkForMarquee);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkForMarquee);
    };
  }, []);

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

  // Double the customers for seamless looping
  const displayCustomers = needsMarquee
    ? [...customerImages, ...customerImages]
    : customerImages;

  return (
    <div className="w-full bg-gray-50 py-1 rounded-lg overflow-hidden relative">
      {/* <div className="container mx-auto px-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Trusted by Our Customers
        </h2>
      </div> */}

      <div className="relative px-8">
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
            {displayCustomers.map((customer, index) => (
              <div
                key={`customer-${customer.id}-${index}`}
                className="mx-2 flex-shrink-0 bg-white rounded-lg p-2 flex items-center justify-center h-18 w-24 shadow hover:shadow-md transition-all transform hover:scale-105"
                title={customer.alt}
              >
                <img
                  src={customer.image}
                  alt={customer.alt}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.target.src = `https://dummyimage.com/200x100/eeeeee/333333&text=Customer+${customer.id}`;
                  }}
                />
              </div>
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

export default CustomerMarquee;
