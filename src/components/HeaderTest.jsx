import React, { useState, useRef, useEffect } from 'react';
import logo from '../assets/web-logo.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Search,
  User,
  ShoppingCart,
  Heart,
  Facebook,
  Twitter,
  Instagram,
  Menu,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';
import SearchInput from './Search';
import useMobile from '../hooks/useMobile';
import UserMenu from './UserMenu';
import { DisplayPriceInNaira } from '../utils/DisplayPriceInNaira';
import { useGlobalContext } from '../provider/GlobalProvider';
import DisplayCartItem from './DisplayCartItem';

export default function HeaderTest() {
  const [isMobile] = useMobile();
  const location = useLocation();
  const isSearchPage = location.pathname === '/search';
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const cartItem = useSelector((state) => state.cartItem.cart);
  const [openBottomMenu, setOpenBottomMenu] = useState(false);
  const { totalPrice, totalQty } = useGlobalContext();
  const [openCartSection, setOpenCartSection] = useState(false);
  const productCategories = useSelector((state) => state.product.allCategory);
  const categoryStructure = useSelector(
    (state) => state.product.categoryStructure
  );
  const loadingCategoryStructure = useSelector(
    (state) => state.product.loadingCategoryStructure
  );
  const [activeCategory, setActiveCategory] = useState(null);
  const [verticalMenuActive, setVerticalMenuActive] = useState(false);
  const [verticalCategory, setVerticalCategory] = useState(null);
  const [verticalSubcategory, setVerticalSubcategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [isMobil, setIsMobil] = useState(false);

  const menuRef = useRef(null);

  // Check if we're on mobil
  useEffect(() => {
    const checkIfMobil = () => {
      setIsMobil(window.innerWidth <= 768);
    };

    checkIfMobil();
    window.addEventListener('resize', checkIfMobil);

    return () => {
      window.removeEventListener('resize', checkIfMobil);
    };
  }, []);

  // Close menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setVerticalMenuActive(false);
      }
    };

    if (verticalMenuActive) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [verticalMenuActive]);

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories({
      ...expandedCategories,
      [categoryId]: !expandedCategories[categoryId],
    });

    // Reset subcategory expansions when closing a category
    if (expandedCategories[categoryId]) {
      const newExpandedSubcategories = { ...expandedSubcategories };

      // Find the category and clear its subcategories
      const category = categoryStructure.find((cat) => cat._id === categoryId);
      if (category && category.subcategories) {
        category.subcategories.forEach((sub) => {
          delete newExpandedSubcategories[sub._id];
        });
      }

      setExpandedSubcategories(newExpandedSubcategories);
    }
  };

  const toggleSubcategoryExpansion = (subcategoryId) => {
    setExpandedSubcategories({
      ...expandedSubcategories,
      [subcategoryId]: !expandedSubcategories[subcategoryId],
    });
  };
  console.log(categoryStructure);

  const navigateToComparisonPage = () => {
    navigate('/compare');
  };

  const redirectToLoginPage = () => {
    navigate('/login');
  };

  const handleCloseUserMenu = () => {
    setOpenUserMenu(false);
  };

  const handleMobileUser = () => {
    if (!user._id) {
      navigate('/login');
      return;
    }

    navigate('/user');
  };

  const navigateToCategory = (categoryId, categorySlug) => {
    navigate(`/category/${categorySlug}`);
    setVerticalMenuActive(false);
  };

  const navigateToSubcategory = (
    subcategoryId,
    categorySlug,
    subcategorySlug
  ) => {
    navigate(`/category/${categorySlug}/subcategory/${subcategorySlug}`);
    setVerticalMenuActive(false);
  };

  const navigateToBrand = (brandId, brandSlug) => {
    navigate(`/brand/${brandSlug}`);
    setVerticalMenuActive(false);
  };

  return (
    <div className="flex flex-col">
      {/* Top Bar */}
      <div className="bg-secondary-200 text-white px-4 py-2">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-sm">Free shipping on orders over ₦100,000!</div>
          <div className="flex space-x-4">
            <Facebook size={18} className="cursor-pointer" />
            <Twitter size={18} className="cursor-pointer" />
            <Instagram size={18} className="cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Middle Bar */}
      <header className="bg-white py-4 px-4 shadow-md">
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-brown-600">
              <Link to={'/'} className="h-100 flex justify-center items-center">
                <img
                  src={logo}
                  width={126}
                  height={51}
                  alt="logo"
                  className="hidden lg:block"
                />
                <img
                  src={logo}
                  width={120}
                  height={60}
                  alt="logo"
                  className="lg:hidden"
                />
              </Link>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-6 hidden md:block">
            <SearchInput />
          </div>

          {/* Icons and Actions */}
          <div className="flex items-center space-x-6">
            {user?._id ? (
              <div className="relative">
                <div
                  onClick={() => setOpenUserMenu((prev) => !prev)}
                  className="flex select-none items-center gap-1 cursor-pointer"
                >
                  <User size={24} className="cursor-pointer text-gray-700" />
                </div>
                {openUserMenu && (
                  <div className="absolute right-0 top-12 z-50">
                    <div className="bg-white rounded p-4 min-w-52 lg:shadow-lg">
                      <UserMenu close={handleCloseUserMenu} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={redirectToLoginPage}
                className="text-xl capitalize px-2"
              >
                <User size={24} className="cursor-pointer text-gray-700" />
              </button>
            )}
            <button className="relative" onClick={navigateToComparisonPage}>
              <Heart size={24} className="cursor-pointer text-gray-700" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>
            <button className="relative">
              <ShoppingCart
                size={24}
                className="cursor-pointer text-gray-700"
              />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {cartItem.length > 0 ? totalQty : 0}
              </span>
            </button>
            <button
              onClick={() => setOpenCartSection(true)}
              className="flex items-center gap-2 bg-secondary-200 hover:bg-secondary-100 px-3 py-2 rounded text-white"
            >
              <div className="font-semibold text-sm">
                {cartItem.length > 0 ? (
                  <div>
                    <p>{totalQty} Items</p>
                    <p>{DisplayPriceInNaira(totalPrice)}</p>
                  </div>
                ) : (
                  <Link to={'/shop'}>My Cart</Link>
                )}
              </div>
            </button>
          </div>

          {openCartSection && (
            <DisplayCartItem close={() => setOpenCartSection(false)} />
          )}
        </div>

        {/* Responsive search for mobil */}
        <div className="mt-4 md:hidden">
          <SearchInput />
        </div>
      </header>

      {/* Bottom Bar with Categories */}
      <div className="bg-gray-100 border-b border-gray-200 relative z-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center py-3">
            {/* Hamburger Menu for Vertical Menu */}
            <div
              className="mr-6 cursor-pointer"
              onClick={() => setVerticalMenuActive(true)}
            >
              <Menu size={24} className="text-gray-700" />
            </div>

            {/* Horizontal Categories */}
            <div className="flex overflow-x-auto hide-scrollbar space-x-6">
              {loadingCategoryStructure ? (
                <div className="whitespace-nowrap">Loading categories...</div>
              ) : (
                categoryStructure.map((category) => (
                  <div
                    key={category._id}
                    className="whitespace-nowrap cursor-pointer font-medium"
                    onMouseEnter={() => setActiveCategory(category)}
                    onMouseLeave={() => setActiveCategory(null)}
                  >
                    <Link
                      to={`/category/${category.slug}`}
                      className="flex flex-col items-center justify-center min-w-[70px] text-center hover:text-secondary-200 transition-colors"
                    >
                      <span className="text-sm truncate">{category.name}</span>
                    </Link>

                    {/* Mega Menu on Hover */}
                    {activeCategory && activeCategory._id === category._id && (
                      <div className="absolute left-0 right-0 bg-white shadow-lg z-20 mt-3 p-6">
                        {category.subcategories &&
                        category.subcategories.length > 0 ? (
                          // Type A: With Subcategories
                          <div className="flex flex-wrap">
                            {category.subcategories.map((subcategory) => (
                              <div
                                key={subcategory._id}
                                className="w-full md:w-1/2 lg:w-1/3 p-4"
                              >
                                <div className="flex items-start">
                                  <img
                                    src={
                                      subcategory.image ||
                                      `/api/placeholder/120/120`
                                    }
                                    alt={subcategory.name}
                                    className="w-16 h-16 object-cover rounded mr-4"
                                  />
                                  <div>
                                    <Link
                                      to={`/category/${category.slug}/subcategory/${subcategory.slug}`}
                                      className="font-bold hover:text-secondary-200"
                                    >
                                      {subcategory.name}
                                    </Link>
                                    <ul className="mt-2">
                                      {subcategory.brands &&
                                      subcategory.brands.length > 0 ? (
                                        subcategory.brands
                                          .slice(0, 5)
                                          .map((brand) => (
                                            <li
                                              key={brand._id}
                                              className="text-gray-600 hover:text-gray-900 py-1 cursor-pointer text-sm"
                                            >
                                              <Link to={`/brand/${brand.slug}`}>
                                                {brand.name}
                                              </Link>
                                            </li>
                                          ))
                                      ) : (
                                        <li className="text-gray-500 py-1">
                                          No brands available
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : category.brands && category.brands.length > 0 ? (
                          // Type B: No Subcategories, but has brands
                          <div className="flex flex-wrap">
                            {category.brands.map((brand) => (
                              <div
                                key={brand._id}
                                className="w-full md:w-1/4 lg:w-1/5 p-4"
                              >
                                <Link
                                  to={`/brand/${brand.slug}`}
                                  className="flex items-center text-center"
                                >
                                  <img
                                    src={
                                      brand.image || `/api/placeholder/120/120`
                                    }
                                    alt={brand.name}
                                    className="w-20 h-10 object-cover rounded-full mb-2"
                                  />
                                  <span className="font-medium text-xs">
                                    {brand.name}
                                  </span>
                                </Link>
                              </div>
                            ))}
                          </div>
                        ) : (
                          // No subcategories or brands
                          <div className="p-4 text-center text-gray-500">
                            No subcategories or brands available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Menu - Desktop & Mobil */}
      {verticalMenuActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex">
          {!isMobil ? (
            // Desktop Version - Multi-column layout
            <div ref={menuRef} className="flex h-full">
              {/* First Layer - Categories */}
              <div className="w-64 bg-white h-full overflow-y-auto">
                <div className="p-4 font-bold border-b flex justify-between items-center">
                  <span>All Categories</span>
                  <X
                    size={20}
                    className="cursor-pointer text-gray-600 hover:text-gray-900"
                    onClick={() => setVerticalMenuActive(false)}
                  />
                </div>
                {loadingCategoryStructure ? (
                  <div className="p-4">Loading categories...</div>
                ) : (
                  categoryStructure.map((category) => (
                    <div
                      key={category._id}
                      className="p-4 hover:bg-gray-100 border-b cursor-pointer flex justify-between items-center"
                      onMouseEnter={() => setVerticalCategory(category)}
                      onClick={() =>
                        navigateToCategory(category._id, category.slug)
                      }
                    >
                      <div className="flex items-center">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-8 h-8 mr-2"
                        />
                        <span>{category.name}</span>
                      </div>
                      {category.subcategories &&
                        category.subcategories.length > 0 && (
                          <ChevronRight size={20} />
                        )}
                    </div>
                  ))
                )}
              </div>

              {/* Second Layer - Subcategories or Brands */}
              {verticalCategory && (
                <div className="w-64 bg-gray-50 h-full overflow-y-auto">
                  <div className="p-4 font-bold border-b">
                    {verticalCategory.name}
                  </div>
                  {verticalCategory.subcategories &&
                  verticalCategory.subcategories.length > 0 ? (
                    // Display subcategories
                    verticalCategory.subcategories.map((subcategory) => (
                      <div
                        key={subcategory._id}
                        className="p-4 hover:bg-gray-100 border-b cursor-pointer flex justify-between items-center"
                        onMouseEnter={() => setVerticalSubcategory(subcategory)}
                        onClick={() =>
                          navigateToSubcategory(
                            subcategory._id,
                            verticalCategory.slug,
                            subcategory.slug
                          )
                        }
                      >
                        <div className="flex items-center">
                          <img
                            src={subcategory.image}
                            alt={subcategory.name}
                            className="w-8 h-8 mr-2"
                          />
                          <span>{subcategory.name}</span>
                        </div>
                        {subcategory.brands &&
                          subcategory.brands.length > 0 && (
                            <ChevronRight size={20} />
                          )}
                      </div>
                    ))
                  ) : verticalCategory.brands &&
                    verticalCategory.brands.length > 0 ? (
                    // Display brands directly if no subcategories
                    verticalCategory.brands.map((brand) => (
                      <div
                        key={brand._id}
                        className="p-4 hover:bg-gray-100 border-b cursor-pointer"
                        onClick={() => navigateToBrand(brand._id, brand.slug)}
                      >
                        <div className="flex items-center">
                          <img
                            src={brand.image}
                            alt={brand.name}
                            className="w-16 h-8 mr-2"
                          />
                          <span>{brand.name}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-gray-500">
                      No subcategories or brands available
                    </div>
                  )}
                </div>
              )}

              {/* Third Layer - Brands */}
              {verticalSubcategory && (
                <div className="w-64 bg-white h-full overflow-y-auto">
                  <div className="p-4 font-bold border-b">
                    {verticalSubcategory.name} Brands
                  </div>
                  {verticalSubcategory.brands &&
                  verticalSubcategory.brands.length > 0 ? (
                    verticalSubcategory.brands.map((brand) => (
                      <div
                        key={brand._id}
                        className="p-4 hover:bg-gray-100 border-b cursor-pointer"
                        onClick={() => navigateToBrand(brand._id, brand.slug)}
                      >
                        {brand.name}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-gray-500">No brands available</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Mobil Version - Single column with expandable sections
            <div
              ref={menuRef}
              className="w-4/5 bg-white h-full overflow-y-auto ml-auto"
            >
              <div className="p-4 font-bold border-b flex justify-between items-center">
                <span>Menu</span>
                <X
                  size={20}
                  className="cursor-pointer text-gray-600 hover:text-gray-900"
                  onClick={() => setVerticalMenuActive(false)}
                />
              </div>

              {loadingCategoryStructure ? (
                <div className="p-4">Loading categories...</div>
              ) : (
                // Categories with expandable sections
                categoryStructure.map((category) => (
                  <div key={category._id}>
                    <div
                      className="p-4 border-b cursor-pointer flex justify-between items-center"
                      onClick={() => toggleCategoryExpansion(category._id)}
                    >
                      <span className="font-medium">{category.name}</span>
                      {(category.subcategories &&
                        category.subcategories.length > 0) ||
                      (category.brands && category.brands.length > 0) ? (
                        expandedCategories[category._id] ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )
                      ) : null}
                    </div>

                    {/* Expanded category content */}
                    {expandedCategories[category._id] && (
                      <div className="bg-gray-50">
                        {category.subcategories &&
                        category.subcategories.length > 0 ? (
                          // Show subcategories
                          category.subcategories.map((subcategory) => (
                            <div key={subcategory._id}>
                              <div
                                className="p-4 pl-8 border-b cursor-pointer flex justify-between items-center"
                                onClick={() =>
                                  toggleSubcategoryExpansion(subcategory._id)
                                }
                              >
                                <span>{subcategory.name}</span>
                                {subcategory.brands &&
                                  subcategory.brands.length > 0 &&
                                  (expandedSubcategories[subcategory._id] ? (
                                    <ChevronDown size={18} />
                                  ) : (
                                    <ChevronRight size={18} />
                                  ))}
                              </div>

                              {/* Brands for this subcategory */}
                              {expandedSubcategories[subcategory._id] &&
                                subcategory.brands && (
                                  <div className="bg-white">
                                    {subcategory.brands.length > 0 ? (
                                      subcategory.brands.map((brand) => (
                                        <div
                                          key={brand._id}
                                          className="p-3 pl-12 border-b cursor-pointer text-sm"
                                          onClick={() =>
                                            navigateToBrand(
                                              brand._id,
                                              brand.slug
                                            )
                                          }
                                        >
                                          {brand.name}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="p-3 pl-12 border-b text-sm text-gray-500">
                                        No brands available
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>
                          ))
                        ) : category.brands && category.brands.length > 0 ? (
                          // Show brands directly
                          category.brands.map((brand) => (
                            <div
                              key={brand._id}
                              className="p-4 pl-8 border-b cursor-pointer"
                              onClick={() =>
                                navigateToBrand(brand._id, brand.slug)
                              }
                            >
                              {brand.name}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 pl-8 border-b text-gray-500">
                            No subcategories or brands available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Custom styles */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
