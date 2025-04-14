import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { valideURLConvert } from '../utils/valideURLConvert';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import HomeSlider from '../components/HomeSlider';

const Home = () => {
  const loadingCategory = useSelector((state) => state.product.loadingCategory);
  const categoryData = useSelector((state) => state.product.allCategory) || [];
  const subCategoryData =
    useSelector((state) => state.product.allSubCategory) || [];
  const brand = useSelector((state) => state.product.allBrand) || [];
  const products = useSelector((state) => state.product.products) || [];
  const navigate = useNavigate();

  // States for carousels
  const [currentBrandSlide, setCurrentBrandSlide] = useState(0);
  const [currentProductSlide, setCurrentProductSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);

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

  // Handle category redirection
  const handleRedirectProductListpage = (id, cat) => {
    if (!id || !cat || !subCategoryData || subCategoryData.length === 0) return;

    const subcategory = subCategoryData.find((sub) => {
      if (!sub || !sub.category) return false;

      const filterData = sub.category.some((c) => {
        return c && c._id === id;
      });

      return filterData ? true : null;
    });

    if (subcategory) {
      const url = `/${valideURLConvert(cat)}-${id}/${valideURLConvert(
        subcategory.name
      )}-${subcategory._id}`;

      navigate(url);
    }
  };

  // Carousel controls
  const nextBrandSlide = () => {
    if (!brand || brand.length === 0) return;
    const maxSlides = Math.max(Math.ceil(brand.length / 6) - 1, 0);
    setCurrentBrandSlide((prev) => (prev >= maxSlides ? 0 : prev + 1));
  };

  const prevBrandSlide = () => {
    if (!brand || brand.length === 0) return;
    const maxSlides = Math.max(Math.ceil(brand.length / 6) - 1, 0);
    setCurrentBrandSlide((prev) => (prev === 0 ? maxSlides : prev - 1));
  };

  const nextProductSlide = () => {
    if (!filteredProducts || filteredProducts.length === 0) return;
    const maxSlides = Math.max(Math.ceil(filteredProducts.length / 4) - 1, 0);
    setCurrentProductSlide((prev) => (prev >= maxSlides ? 0 : prev + 1));
  };

  const prevProductSlide = () => {
    if (!filteredProducts || filteredProducts.length === 0) return;
    const maxSlides = Math.max(Math.ceil(filteredProducts.length / 4) - 1, 0);
    setCurrentProductSlide((prev) => (prev === 0 ? maxSlides : prev - 1));
  };

  // Auto slide for brands
  useEffect(() => {
    if (!brand || brand.length === 0) return;

    const interval = setInterval(() => {
      nextBrandSlide();
    }, 3000);
    return () => clearInterval(interval);
  }, [currentBrandSlide, brand]);

  // Filter products based on selected category
  useEffect(() => {
    if (products && products.length > 0) {
      if (selectedCategory === 'all') {
        setFilteredProducts(products);
      } else {
        setFilteredProducts(
          products.filter(
            (product) =>
              product &&
              product.category &&
              product.category._id === selectedCategory
          )
        );
      }
      setCurrentProductSlide(0);
    } else {
      setFilteredProducts([]);
    }
  }, [selectedCategory, products]);

  return (
    <section className="bg-white">
      {/* Main Banner Section with Side Banners */}
      <div className="container mx-auto px-4 py-4">
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

      {/* Categories Section */}
      <div className="container mx-auto px-4 my-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Shop by Category
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {loadingCategory ? (
            new Array(10).fill(null).map((_, index) => (
              <div
                key={index + 'loadingcategory'}
                className="bg-white rounded p-4 h-36 grid gap-2 shadow animate-pulse"
              >
                <div className="bg-blue-100 h-24 rounded"></div>
                <div className="bg-blue-100 h-8 rounded"></div>
              </div>
            ))
          ) : categoryData && categoryData.length > 0 ? (
            categoryData.map((cat) => (
              <div
                key={cat._id + 'displayCategory'}
                className="bg-white rounded-lg p-2 shadow hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleRedirectProductListpage(cat._id, cat.name)}
              >
                <div className="w-full h-24 flex items-center justify-center">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="max-h-full object-contain"
                  />
                </div>
                <p className="text-center text-sm mt-2 font-medium truncate">
                  {cat.name}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-4 text-gray-500">
              No categories available
            </div>
          )}
        </div>
      </div>

      {/* Brand Carousel Section */}
      <div className="container mx-auto px-4 my-8 bg-gray-50 py-6 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Brands</h2>
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentBrandSlide * 100}%)` }}
            >
              {brand && brand.length > 0 ? (
                Array.from({
                  length: Math.max(Math.ceil(brand.length / 6), 1),
                }).map((_, slideIndex) => (
                  <div
                    key={`brand-slide-${slideIndex}`}
                    className="w-full flex-shrink-0"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                      {brand
                        .slice(slideIndex * 6, slideIndex * 6 + 6)
                        .map((b) => (
                          <Link
                            key={b._id}
                            to={`/brand/${valideURLConvert(b.name)}-${b._id}`}
                            className="bg-white rounded-lg p-4 flex items-center justify-center h-24 shadow hover:shadow-md transition-all transform hover:scale-105"
                          >
                            <img
                              src={
                                b.logo ||
                                `https://dummyimage.com/200x100/eeeeee/333333&text=${b.name}`
                              }
                              alt={b.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </Link>
                        ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {new Array(6).fill(null).map((_, index) => (
                    <div
                      key={`loading-brand-${index}`}
                      className="bg-white rounded-lg p-4 h-24 animate-pulse"
                    >
                      <div className="bg-gray-200 h-full w-full rounded"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Brand Carousel Navigation */}
          {brand && brand.length > 6 && (
            <>
              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 bg-white shadow rounded-full p-2 hover:bg-gray-100"
                onClick={prevBrandSlide}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 bg-white shadow rounded-full p-2 hover:bg-gray-100"
                onClick={nextBrandSlide}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Featured Products Section with Category Filters */}
      <div className="container mx-auto px-4 my-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Featured Products
          </h2>

          <div className="flex overflow-x-auto gap-2 mt-2 md:mt-0 pb-2 md:pb-0">
            <button
              className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-amber-800 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              onClick={() => setSelectedCategory('all')}
            >
              All Products
            </button>
            {categoryData &&
              categoryData.length > 0 &&
              categoryData.map((cat) => (
                <button
                  key={cat._id + 'filter'}
                  className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                    selectedCategory === cat._id
                      ? 'bg-amber-800 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  onClick={() => setSelectedCategory(cat._id)}
                >
                  {cat.name}
                </button>
              ))}
          </div>
        </div>

        {/* Products Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentProductSlide * 100}%)`,
              }}
            >
              {filteredProducts && filteredProducts.length > 0 ? (
                Array.from({
                  length: Math.max(Math.ceil(filteredProducts.length / 4), 1),
                }).map((_, slideIndex) => (
                  <div
                    key={`product-slide-${slideIndex}`}
                    className="w-full flex-shrink-0"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {filteredProducts
                        .slice(slideIndex * 4, slideIndex * 4 + 4)
                        .map((product) => (
                          <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {new Array(4).fill(null).map((_, index) => (
                    <div
                      key={`loading-product-${index}`}
                      className="bg-white rounded-lg p-4 shadow animate-pulse"
                    >
                      <div className="bg-gray-200 h-48 w-full rounded mb-4"></div>
                      <div className="bg-gray-200 h-6 w-2/3 rounded mb-2"></div>
                      <div className="bg-gray-200 h-6 w-1/3 rounded mb-4"></div>
                      <div className="bg-gray-200 h-10 w-full rounded"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Carousel Navigation */}
          {filteredProducts && filteredProducts.length > 4 && (
            <>
              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 bg-white shadow rounded-full p-2 hover:bg-gray-100"
                onClick={prevProductSlide}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 bg-white shadow rounded-full p-2 hover:bg-gray-100"
                onClick={nextProductSlide}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Additional Info Banners */}
      <div className="container mx-auto px-4 my-8">
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
              <p className="text-sm text-amber-800">On orders over $50</p>
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

// Product Card Component
const ProductCard = ({ product }) => {
  // Safety check for product
  if (!product) return null;

  const {
    name = '',
    slug = '',
    _id = '',
    price = 0,
    discount = 0,
    rating = 0,
  } = product;
  const category = product.category || {};
  const images = product.images || [];

  return (
    <Link
      to={`/product/${slug || _id}`}
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full"
    >
      <div className="h-48 overflow-hidden relative">
        <img
          src={
            images[0]
              ? images[0]
              : 'https://dummyimage.com/400x300/e0e0e0/333333&text=No+Image'
          }
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {discount}% OFF
          </div>
        )}
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 h-12">
          {name}
        </h3>
        <div className="text-sm text-gray-500 mb-2">
          {category.name || 'Coffee Product'}
        </div>
        <div className="mt-auto flex justify-between items-center">
          <div className="flex items-center">
            {discount > 0 ? (
              <>
                <span className="font-bold text-amber-800">
                  ${(price - (price * discount) / 100).toFixed(2)}
                </span>
                <span className="text-gray-500 text-sm line-through ml-2">
                  ${price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="font-bold text-amber-800">
                ${price.toFixed(2)}
              </span>
            )}
          </div>
          <div className="text-amber-500 flex">
            {/* Star rating */}
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>{i < Math.floor(rating) ? '★' : '☆'}</span>
            ))}
          </div>
        </div>
        <button className="mt-3 bg-amber-800 hover:bg-amber-900 text-white py-2 px-4 rounded w-full transition-colors">
          Add to Cart
        </button>
      </div>
    </Link>
  );
};

export default Home;
