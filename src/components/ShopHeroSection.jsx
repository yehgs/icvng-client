import React from 'react';
import { Link } from 'react-router-dom';

const ShopHeroSection = ({
  title,
  breadcrumbs,
  backgroundImage = '/images/coffee-shop-bg.jpg',
}) => {
  return (
    <div className="relative bg-gray-900 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      ></div>
      <div className="container mx-auto py-12 px-4 relative z-10">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>

        {/* Breadcrumbs */}
        <nav className="text-sm">
          <ol className="list-none p-0 inline-flex">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-300">{crumb.name}</span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-white hover:text-gray-300"
                  >
                    {crumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default ShopHeroSection;
