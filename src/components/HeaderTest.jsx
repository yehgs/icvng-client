// client/src/components/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import logo from '../assets/web-logo.svg';
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
import { VscGitCompare } from 'react-icons/vsc';
import SearchInput from './Search';
import useMobile from '../hooks/useMobile';
import { useWishlistCompare } from '../hooks/useWishlistCompare';
import UserMenu from './UserMenu';
import { useGlobalContext, useCurrency } from '../provider/GlobalProvider';
import DisplayCartItem from './DisplayCartItem';
import HeaderNavigation from '../components/HeaderNavigation';
import CurrencySelector from '../components/CurrencySelector';

export default function Header() {
  const [isMobile] = useMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const cartItem = useSelector((state) => state.cartItem.cart);
  const { totalPrice, totalQty, isLoggedIn, guestCart } = useGlobalContext();
  const { formatPrice } = useCurrency();
  const [openCartSection, setOpenCartSection] = useState(false);

  // Real-time counters
  const [localWishlistCount, setLocalWishlistCount] = useState(0);
  const [localCompareCount, setLocalCompareCount] = useState(0);
  const [localCartCount, setLocalCartCount] = useState(0);

  // Use the wishlist and compare hook for logged-in users
  const { wishlistCount, compareCount } = useWishlistCompare();

  const menuRef = useRef(null);

  // Function to update local counts
  const updateLocalCounts = () => {
    if (!isLoggedIn) {
      // For guest users, get from localStorage
      const localWishlist = JSON.parse(
        localStorage.getItem('wishlist') || '[]'
      );
      const localCompareList = JSON.parse(
        localStorage.getItem('compareList') || '[]'
      );
      const localGuestCart = JSON.parse(
        localStorage.getItem('guestCart') || '[]'
      );

      setLocalWishlistCount(localWishlist.length);
      setLocalCompareCount(localCompareList.length);
      setLocalCartCount(
        localGuestCart.reduce((total, item) => total + (item.quantity || 0), 0)
      );
    } else {
      // For logged-in users, use the hook values and cart from Redux
      setLocalWishlistCount(wishlistCount);
      setLocalCompareCount(compareCount);
      setLocalCartCount(totalQty);
    }
  };

  // Update counts on mount and when login status changes
  useEffect(() => {
    updateLocalCounts();
  }, [isLoggedIn, wishlistCount, compareCount, totalQty, guestCart]);

  // Listen for real-time updates
  useEffect(() => {
    const handleUpdate = () => {
      updateLocalCounts();
    };

    // Listen for custom events and storage changes
    window.addEventListener('wishlist-updated', handleUpdate);
    window.addEventListener('compare-updated', handleUpdate);
    window.addEventListener('cart-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('wishlist-updated', handleUpdate);
      window.removeEventListener('compare-updated', handleUpdate);
      window.removeEventListener('cart-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [isLoggedIn, wishlistCount, compareCount, totalQty]);

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
          <div className="flex items-center justify-center md:w-fit w-[100%]">
            <div className="text-2xl font-bold text-brown-600">
              <Link
                to={'/'}
                className="flex justify-center md:justify-start items-center"
              >
                <img
                  src={logo}
                  height={50}
                  width={200}
                  alt="logo"
                  className="hidden lg:block"
                />
                <img
                  src={logo}
                  alt="logo"
                  className="lg:hidden w-[55%] mb-2"
                  width={50}
                />
              </Link>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-6 hidden md:block">
            <SearchInput />
          </div>

          {/* Icons and Actions */}
          <div className="flex justify-center items-center space-x-4 w-[100%] md:w-fit">
            {/* Currency Selector */}
            <div className="">
              <CurrencySelector />
            </div>

            {/* User Menu */}
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

            {/* Wishlist Button */}
            <button
              className="relative hover:scale-105 transition-transform"
              onClick={navigateToWishlistPage}
              title="My Wishlist"
            >
              <Heart size={24} className="cursor-pointer text-gray-700" />
              {localWishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center animate-pulse">
                  {localWishlistCount > 99 ? '99+' : localWishlistCount}
                </span>
              )}
            </button>

            {/* Compare Button */}
            <button
              className="relative hover:scale-105 transition-transform"
              onClick={navigateToComparisonPage}
              title="Compare Products"
            >
              <VscGitCompare
                size={24}
                className="cursor-pointer text-gray-700"
              />
              {localCompareCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center animate-pulse">
                  {localCompareCount > 99 ? '99+' : localCompareCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              className="relative hover:scale-105 transition-transform"
              onClick={() => setOpenCartSection(true)}
              title="Shopping Cart"
            >
              <ShoppingCart
                size={24}
                className="cursor-pointer text-gray-700"
              />
              {localCartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center animate-pulse">
                  {localCartCount > 99 ? '99+' : localCartCount}
                </span>
              )}
            </button>

            {/* Cart Summary Button */}
            {/* <button
              onClick={() => setOpenCartSection(true)}
              className="hidden md:flex items-center gap-2 bg-secondary-200 hover:bg-secondary-100 px-3 py-2 rounded text-white transition-colors"
            >
              <div className="font-semibold text-sm">
                {localCartCount > 0 ? (
                  <div>
                    <p>{localCartCount} Items</p>
                    <p>{formatPrice(totalPrice)}</p>
                  </div>
                ) : (
                  <span>My Cart</span>
                )}
              </div>
            </button> */}
            <button
              className="hidden md:flex items-center gap-2 bg-secondary-200 hover:bg-secondary-100 px-3 py-2 rounded text-white transition-colors"
              onClick={() => navigate('/shop')}
            >
              <span className="font-semibold text-sm">Shop Now</span>
            </button>

            {/* Mobile Cart Link */}
            <Link
              to="/shop"
              className="md:hidden items-center  bg-secondary-200 hover:bg-secondary-100 px-3 py-2 rounded text-white transition-colors gap-2"
            >
              <span>Shop Now</span>
            </Link>
          </div>

          {/* Cart Sidebar */}
          {openCartSection && (
            <DisplayCartItem close={() => setOpenCartSection(false)} />
          )}
        </div>

        {/* Responsive elements for mobile */}
        <div className="mt-4 md:hidden space-y-2">
          {/* Mobile Search */}
          <SearchInput />
        </div>
      </header>

      <HeaderNavigation />
    </div>
  );
}
