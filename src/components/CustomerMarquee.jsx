// client/src/components/CustomerMarquee.jsx
import React, { useState, useEffect } from 'react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';

const CustomerMarquee = ({ customerCount = 20 }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeaturedCustomers = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getFeaturedCustomers,
        params: { limit: customerCount },
      });
      if (response.data.success) {
        const fetchedCustomers = response.data.data || [];
        const transformed = fetchedCustomers.map((customer, index) => ({
          id: customer._id,
          image: customer.image,
          alt: customer.displayName || customer.name || `Customer ${index + 1}`,
          name: customer.displayName || customer.name,
          companyName: customer.companyName,
        }));
        setCustomers(transformed);
      }
    } catch (error) {
      console.error('Error fetching featured customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedCustomers();
  }, [customerCount]);

  if (!loading && customers.length === 0) return null;
  if (loading) return null;

  // Triple for seamless loop
  const displayCustomers = [...customers, ...customers, ...customers];

  return (
    <div className="w-full bg-gray-50 py-1 rounded-lg overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #f9fafb, transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #f9fafb, transparent)' }} />

      <div className="customer-marquee-track">
        {displayCustomers.map((customer, index) => (
          <div
            key={`customer-${customer.id}-${index}`}
            className="mx-2 flex-shrink-0 bg-white rounded-lg p-2 flex items-center justify-center shadow hover:shadow-md transition-all transform hover:scale-105"
            style={{ height: '72px', width: '96px' }}
            title={customer.companyName || customer.alt}
          >
            <img loading="lazy" decoding="async"               src={customer.image}
              alt={customer.alt}
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&size=200&background=f3f4f6&color=1f2937`;
              }}
            />
          </div>
        ))}
      </div>

      <style>{`
        .customer-marquee-track {
          display: flex;
          width: max-content;
          animation: customer-scroll 50s linear infinite;
        }
        .customer-marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes customer-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
};

export default CustomerMarquee;
