import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import HomeSlider from '../components/HomeSlider';
import BrandMarquee from '../components/BrandMarquee';
import NewArrivalsSection from '../components/NewArrivalsSection';
import FeaturedProductsSection from '../components/FeaturedProductsSection';
import CategoryFilterSection from '../components/CategoryFilterSection';
import PopularProductsSection from '../components/PopularProductsSection';
import CoffeeOriginSection from '../components/CoffeeOriginSection';

const Home = () => {
  const brands = useSelector((state) => state.product.allBrands) || [];

  // Mock data for side banners (replace with your actual data)
  const sideBanners = [
    {
      id: 1,
      image:
        'https://dummyimage.com/600x300/5e3a19/ffffff&text=Coffee+Subscriptions',
      title: 'Coffee Subscriptions',
      link: '/subscriptions',
    },
    {
      id: 2,
      image: 'https://dummyimage.com/600x300/3e2a12/ffffff&text=Gift+Sets',
      title: 'Gift Sets',
      link: '/gift-sets',
    },
  ];

  return (
    <section className="bg-white">
      {/* Main Banner Section with Side Banners */}
      <div className="container mx-auto py-2">
        <div className="flex flex-col md:flex-row gap-4">
          {/* HomeSlider Component - 3/4 width on desktop */}
          <div className="w-full md:w-3/4">
            <HomeSlider />
          </div>

          {/* Side Banners - 1/4 width on desktop, stacked vertically */}
          <div className="w-full md:w-1/4 flex flex-row md:flex-col gap-4 mt-4 md:mt-0 md:h-96">
            {sideBanners.map((banner) => (
              <Link
                key={banner.id}
                to={banner.link}
                className="w-1/2 md:w-full h-32 md:h-48 relative overflow-hidden rounded shadow-md hover:shadow-lg transition-shadow"
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-2">
                  <h3 className="text-sm md:text-lg font-semibold">
                    {banner.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Brand Marquee */}
      <div className="container mx-auto my-2">
        <BrandMarquee brands={brands} />
      </div>

      {/* New Arrivals Section */}
      <NewArrivalsSection />

      {/* Category Filter Section */}
      <CategoryFilterSection />

      {/* Featured Products Section */}
      <FeaturedProductsSection />

      {/* Coffee Origin Section */}
      <CoffeeOriginSection />

      {/* Popular Products Section */}
      <PopularProductsSection />

      {/* Additional Info Banners */}
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-amber-50 p-6 rounded-lg shadow flex items-center">
            <div className="mr-4 text-amber-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M7 15h0M2 9.5h20" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-amber-900">Free Shipping</h3>
              <p className="text-sm text-amber-800">On orders over ₦50</p>
            </div>
          </div>
          <div className="bg-amber-50 p-6 rounded-lg shadow flex items-center">
            <div className="mr-4 text-amber-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M2 12h20" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-amber-900">Coffee Subscription</h3>
              <p className="text-sm text-amber-800">
                Fresh beans delivered monthly
              </p>
            </div>
          </div>
          <div className="bg-amber-50 p-6 rounded-lg shadow flex items-center">
            <div className="mr-4 text-amber-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-amber-900">Expert Support</h3>
              <p className="text-sm text-amber-800">Coffee experts available</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
