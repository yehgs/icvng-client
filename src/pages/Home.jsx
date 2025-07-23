//client/src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import HomeSlider from '../components/HomeSlider';
import CustomerMarquee from '../components/CustomerMarquee';
import BrandMarquee from '../components/BrandMarquee';
import NewArrivalsSection from '../components/NewArrivalsSection';
import FeaturedProductsSection from '../components/FeaturedProductsSection';
import CategoryFilterSection from '../components/CategoryFilterSection';
import BlogSection from '../components/BlogSection';
import PopularProductsSection from '../components/PopularProductsSection';
import CoffeeOriginSection from '../components/CoffeeOriginSection';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';

const Home = () => {
  const brands = useSelector((state) => state.product.allBrands) || [];
  const [sideBanner1, setSideBanner1] = useState(null);
  const [sideBanner2, setSideBanner2] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch side banners from API
  const fetchSideBanners = async () => {
    try {
      setLoading(true);

      // Fetch side banner 1
      const response1 = await Axios({
        ...SummaryApi.getActiveBanners,
        params: { position: 'homepage_side1' },
      });

      if (response1.data.success && response1.data.data.length > 0) {
        setSideBanner1(response1.data.data[0]);
      }

      // Fetch side banner 2
      const response2 = await Axios({
        ...SummaryApi.getActiveBanners,
        params: { position: 'homepage_side2' },
      });

      if (response2.data.success && response2.data.data.length > 0) {
        setSideBanner2(response2.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching side banners:', error);
      // Set fallback banners if API fails
      setSideBanner1({
        id: 1,
        image:
          'https://dummyimage.com/600x300/5e3a19/ffffff&text=Coffee+Subscriptions',
        title: 'Coffee Subscriptions',
        link: '/subscriptions',
      });
      setSideBanner2({
        id: 2,
        image: 'https://dummyimage.com/600x300/3e2a12/ffffff&text=Gift+Sets',
        title: 'Gift Sets',
        link: '/gift-sets',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSideBanners();
  }, []);

  const renderSideBanner = (banner, index) => {
    if (!banner) return null;

    const BannerWrapper = banner.link ? Link : 'div';
    const bannerProps = banner.link ? { to: banner.link } : {};

    return (
      <BannerWrapper
        key={banner._id || banner.id || `banner-${index}`}
        {...bannerProps}
        className={`w-1/2 md:w-full h-32 md:h-48 relative overflow-hidden rounded shadow-md hover:shadow-lg transition-shadow ${
          banner.link ? 'cursor-pointer' : ''
        }`}
      >
        <img
          src={banner.image}
          alt={banner.title || 'Banner'}
          className="w-full h-full object-cover"
        />
        {(banner.title || banner.subtitle) && (
          <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-2">
            {banner.title && (
              <h3 className="text-sm md:text-lg font-semibold">
                {banner.title}
              </h3>
            )}
            {banner.subtitle && (
              <p className="text-xs md:text-sm opacity-90">{banner.subtitle}</p>
            )}
          </div>
        )}
      </BannerWrapper>
    );
  };

  return (
    <section className="bg-white">
      {/* Customer Marquee */}
      <div className="container mx-auto">
        <CustomerMarquee customerCount={20} />
      </div>
      {/* Main Banner Section with Side Banners */}
      <div className="container mx-auto py-1">
        <div className="flex flex-col md:flex-row gap-4">
          {/* HomeSlider Component - 3/4 width on desktop */}
          <div className="w-full md:w-3/4">
            <HomeSlider />
          </div>

          {/* Side Banners - 1/4 width on desktop, stacked vertically */}
          <div className="w-full md:w-1/4 flex flex-row md:flex-col gap-4 mt-4 md:mt-0 md:h-96">
            {loading ? (
              <>
                <div className="w-1/2 md:w-full h-32 md:h-48 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-1/2 md:w-full h-32 md:h-48 bg-gray-200 animate-pulse rounded"></div>
              </>
            ) : (
              <>
                {renderSideBanner(sideBanner1, 1)}
                {renderSideBanner(sideBanner2, 2)}
              </>
            )}
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

      {/* Blog Section */}
      <BlogSection />

      {/* Coffee Origin Section */}
      {/* <CoffeeOriginSection /> */}

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
