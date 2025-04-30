import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Section component for displaying coffee by origin regions
 */
const CoffeeOriginSection = () => {
  // You would typically fetch these from your API
  // This is mock data for demonstration
  const originRegions = [
    {
      id: 1,
      name: 'Colombia',
      description:
        'Known for sweet, well-balanced flavors with caramel and nutty notes.',
      image: 'https://dummyimage.com/600x400/3e2a12/ffffff&text=Colombia',
      link: '/search?coffeeOrigin=Colombia',
    },
    {
      id: 2,
      name: 'Ethiopia',
      description:
        'Renowned for fruity, floral profiles with wine-like acidity.',
      image: 'https://dummyimage.com/600x400/3e2a12/ffffff&text=Ethiopia',
      link: '/search?coffeeOrigin=Ethiopia',
    },
    {
      id: 3,
      name: 'Brazil',
      description:
        'Features chocolatey, nutty flavors with a smooth, mild body.',
      image: 'https://dummyimage.com/600x400/3e2a12/ffffff&text=Brazil',
      link: '/search?coffeeOrigin=Brazil',
    },
    {
      id: 4,
      name: 'Guatemala',
      description:
        'Offers complex flavors with chocolate, caramel and citrus notes.',
      image: 'https://dummyimage.com/600x400/3e2a12/ffffff&text=Guatemala',
      link: '/search?coffeeOrigin=Guatemala',
    },
  ];

  return (
    <section className="py-10 bg-amber-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Explore Coffee Origins
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the unique flavors and characteristics that different
            growing regions bring to your cup.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {originRegions.map((region) => (
            <Link
              key={region.id}
              to={region.link}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow group"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={region.image}
                  alt={`Coffee from ${region.name}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-xl text-gray-800 mb-2">
                  {region.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {region.description}
                </p>
                <div className="flex items-center text-green-700 font-medium group-hover:text-green-800 transition-colors">
                  Explore {region.name} Coffee
                  <ArrowRight
                    size={16}
                    className="ml-1 group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/origins"
            className="inline-flex items-center px-6 py-3 bg-amber-800 text-white font-medium rounded-lg hover:bg-amber-900 transition-colors"
          >
            View All Origins
            <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CoffeeOriginSection;
