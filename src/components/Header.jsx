import React, { useEffect, useState } from 'react';
import logo from '../assets/web-logo.png';
import SearchInput from './Search';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaRegCircleUser,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaRegHeart,
} from 'react-icons/fa6';
import useMobile from '../hooks/useMobile';
import { BsCart4 } from 'react-icons/bs';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import UserMenu from './UserMenu';
import { DisplayPriceInNaira } from '../utils/DisplayPriceInNaira';
import { useGlobalContext } from '../provider/GlobalProvider';
import DisplayCartItem from './DisplayCartItem';
import CategoryMegaMenu from './CategoryMegaMenu';

const Header = () => {
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
  const [activeCategoryId, setActiveCategoryId] = useState(null);

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

  const navigateToComparisonPage = () => {
    navigate('/compare');
  };

  const handleCategoryHover = (categoryId) => {
    setActiveCategoryId(categoryId);
  };

  const handleCategoryLeave = () => {
    setActiveCategoryId(null);
  };

  return (
    <div className="bg-white">
      {/* Top Announcement Bar */}
      <div className="bg-secondary-200 text-white py-2 text-center text-sm">
        <div className="container mx-auto flex justify-between items-center px-4">
          <p>Free shipping on orders over ₦100,000!</p>
          <div className="flex items-center space-x-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook className="hover:text-gray-300" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter className="hover:text-gray-300" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram className="hover:text-gray-300" />
            </a>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-50 border border-b">
        {/* Main Header */}
        <header className="flex flex-col justify-center border border-b">
          {!(isSearchPage && isMobile) && (
            <div className="container mx-auto flex items-center px-2 justify-between">
              {/* Logo */}
              <div className="h-full">
                <Link
                  to={'/'}
                  className="h-100 flex justify-center items-center"
                >
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

              {/* Search */}
              <div className="max-w-md flex-grow mx-4">
                <SearchInput />
              </div>

              {/* Icons and Actions */}
              <div className="flex items-center space-x-2">
                {/* Comparison/Wishlist Icon */}
                <button
                  onClick={navigateToComparisonPage}
                  className="text-neutral-600 hover:text-secondary-200"
                >
                  <FaRegHeart size={20} />
                </button>
                <button
                  className="text-neutral-600 lg:hidden"
                  onClick={handleMobileUser}
                >
                  <FaRegCircleUser size={26} />
                </button>

                {/* User and Cart Actions */}
                <div className="hidden lg:flex items-center gap-4">
                  {user?._id ? (
                    <div className="relative">
                      <div
                        onClick={() => setOpenUserMenu((prev) => !prev)}
                        className="flex select-none items-center gap-1 cursor-pointer"
                      >
                        <User
                          size={24}
                          className="cursor-pointer text-gray-700"
                        />
                        {openUserMenu ? (
                          <IoIosArrowUp size={25} />
                        ) : (
                          <IoIosArrowDown size={25} />
                        )}
                      </div>
                      {openUserMenu && (
                        <div className="absolute right-0 top-12">
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
                      <User
                        size={24}
                        className="cursor-pointer text-gray-700"
                      />
                    </button>
                  )}
                  <button
                    onClick={() => setOpenCartSection(true)}
                    className="flex items-center gap-2 bg-secondary-200 hover:bg-secondary-100 px-3 py-2 rounded text-white"
                  >
                    <div className="animate-bounce">
                      <BsCart4 size={20} />
                    </div>
                    <div className="font-semibold text-sm">
                      {cartItem[0] ? (
                        <div>
                          <p>{totalQty} Items</p>
                          <p>{DisplayPriceInNaira(totalPrice)}</p>
                        </div>
                      ) : (
                        <p>My Cart</p>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {openCartSection && (
            <DisplayCartItem close={() => setOpenCartSection(false)} />
          )}
        </header>

        {/* Categories Navigation with Mega Menu */}
        <div className="container mx-auto px-2 py-2 hidden lg:block relative">
          <div className="flex items-center justify-between overflow-x-auto py-2 font-medium">
            {productCategories.map((category) => (
              <div
                key={category._id}
                className="relative group"
                onMouseEnter={() => handleCategoryHover(category._id)}
                onMouseLeave={handleCategoryLeave}
              >
                <Link
                  to={`/category/${category.slug}`}
                  className="flex flex-col items-center justify-center min-w-[70px] text-center hover:text-secondary-200 transition-colors"
                >
                  <span className="text-xs truncate">{category.name}</span>
                </Link>

                {/* Mega Menu that appears on hover */}
                {activeCategoryId === category._id && (
                  <CategoryMegaMenu category={category} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
