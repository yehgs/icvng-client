import React, { useState, useRef, useEffect } from 'react';
import logo from '../assets/web-logo.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
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
import { useGlobalContext, useWishlist } from '../provider/GlobalProvider';
import DisplayCartItem from './DisplayCartItem';
import HeaderNavigation from '../components/HeaderNavigation';

export default function Header() {
  const [isMobile] = useMobile();
  const location = useLocation();
  const isSearchPage = location.pathname === '/search';
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const cartItem = useSelector((state) => state.cartItem.cart);
  const { totalPrice, totalQty } = useGlobalContext();
  const { wishlistCount } = useWishlist(); // Get wishlist count from context
  const [openCartSection, setOpenCartSection] = useState(false);
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

  // Navigate to wishlist page
  const navigateToWishlistPage = () => {
    navigate('/wishlist');
  };

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
    navigate(`shop/category/${categorySlug}`);
    setVerticalMenuActive(false);
  };

  const navigateToSubcategory = (
    subcategoryId,
    categorySlug,
    subcategorySlug
  ) => {
    navigate(`shop/category/${categorySlug}/subcategory/${subcategorySlug}`);
    setVerticalMenuActive(false);
  };

  const navigateToCategoryBrand = (brandId, categorySlug, brandSlug) => {
    navigate(`shop/category/${categorySlug}/brand/${brandSlug}`);
    setVerticalMenuActive(false);
  };
  const navigateToSubcategoryBrand = (
    brandId,
    categorySlug,
    subcategorySlug,
    brandSlug
  ) => {
    navigate(
      `shop/category/${categorySlug}/subcategory/${subcategorySlug}/brand/${brandSlug}`
    );
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
            <button className="relative" onClick={navigateToWishlistPage}>
              <Heart size={24} className="cursor-pointer text-gray-700" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {wishlistCount}
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
                  <Link>My Cart</Link>
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

      <HeaderNavigation />
    </div>
  );
}
