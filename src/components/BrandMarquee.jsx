import React from 'react';
import { Link } from 'react-router-dom';

const BrandMarquee = ({ brands = [] }) => {
  if (!brands || brands.length === 0) {
    return (
      <div className="w-full bg-gray-50 py-1 rounded-lg">
        <div className="flex flex-wrap justify-center gap-4 px-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={`loading-brand-${i}`} className="bg-white rounded-lg p-4 h-24 w-40 animate-pulse flex-shrink-0">
              <div className="bg-gray-200 h-full w-full rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Triple the brands — translateX(-33.333%) returns to visual start seamlessly
  const displayBrands = [...brands, ...brands, ...brands];

  return (
    <div className="w-full bg-gray-50 py-1 rounded-lg overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #f9fafb, transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #f9fafb, transparent)' }} />

      <div className="brand-marquee-track">
        {displayBrands.map((brand, index) => (
          <Link
            key={`brand-${brand._id || index}-${index}`}
            to={`/brand/${brand.slug || brand._id}`}
            className="mx-2 flex-shrink-0 bg-white rounded-lg p-2 flex items-center justify-center shadow hover:shadow-md transition-all transform hover:scale-105"
            style={{ height: '72px', width: '96px' }}
            title={`Browse ${brand.name} products`}
          >
            <img loading="lazy" decoding="async"               src={brand.image || `https://dummyimage.com/200x100/eeeeee/333333&text=${brand.name}`}
              alt={brand.name}
              className="max-h-full max-w-full object-contain"
            />
          </Link>
        ))}
      </div>

      <style>{`
        .brand-marquee-track {
          display: flex;
          width: max-content;
          animation: brand-scroll 60s linear infinite;
        }
        .brand-marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes brand-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
};

export default BrandMarquee;
