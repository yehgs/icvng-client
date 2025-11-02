// client/src/components/CustomerMarquee.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';

const CustomerMarquee = ({ customerCount = 20 }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [needsMarquee, setNeedsMarquee] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  // Fetch featured customers from API
  const fetchFeaturedCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await Axios({
        ...SummaryApi.getFeaturedCustomers,
        params: { limit: customerCount },
      });

      if (response.data.success) {
        const fetchedCustomers = response.data.data || [];
        
        // Transform API data to match the original format
        const transformedCustomers = fetchedCustomers.map((customer, index) => ({
          id: customer._id,
          image: customer.image,
          alt: customer.displayName || customer.name || `Customer ${index + 1}`,
          name: customer.displayName || customer.name,
          companyName: customer.companyName,
        }));

        setCustomers(transformedCustomers);
      } else {
        throw new Error('Failed to fetch featured customers');
      }
    } catch (error) {
      console.error('Error fetching featured customers:', error);
      setError(error.message);
      // Set empty array on error - component will show nothing gracefully
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedCustomers();
  }, [customerCount]);

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
  }, [customers]);

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
    ? [...customers, ...customers]
    : customers;

  // Don't render anything if loading or no customers
  if (loading) {
    return (
      <div className="w-full bg-gray-50 py-1 rounded-lg overflow-hidden">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-800"></div>
          <span className="ml-3 text-gray-600">Loading customers...</span>
        </div>
      </div>
    );
  }

  // Don't render if there are no customers
  if (!loading && customers.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-gray-50 py-1 rounded-lg overflow-hidden relative">
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
                title={customer.companyName || customer.alt}
              >
                <img
                  src={customer.image}
                  alt={customer.alt}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&size=200&background=f3f4f6&color=1f2937`;
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