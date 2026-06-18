// client/src/components/HeaderTest.jsx
import React, { useState, useRef, useEffect } from "react";
import logo from "../assets/web-logo.svg";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  User,
  ShoppingCart,
  Heart,
  Facebook,
  Twitter,
  Instagram,
  Menu,
} from "lucide-react";
import { VscGitCompare } from "react-icons/vsc";
import SearchInput from "./Search";
import { useWishlistCompare } from "../hooks/useWishlistCompare";
import UserMenu from "./UserMenu";
import { useGlobalContext, useCurrency } from "../provider/GlobalProvider";
import DisplayCartItem from "./DisplayCartItem";
import HeaderNavigation from "../components/HeaderNavigation";
import CurrencySelector from "../components/CurrencySelector";

export default function Header() {
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const { totalQty, isLoggedIn, guestCart } = useGlobalContext();
  const { formatPrice } = useCurrency();
  const [openCartSection, setOpenCartSection] = useState(false);

  const [localWishlistCount, setLocalWishlistCount] = useState(0);
  const [localCompareCount, setLocalCompareCount] = useState(0);
  const [localCartCount, setLocalCartCount] = useState(0);
  const { wishlistCount, compareCount } = useWishlistCompare();

  const updateLocalCounts = () => {
    if (!isLoggedIn) {
      const w = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const c = JSON.parse(localStorage.getItem("compareList") || "[]");
      const g = JSON.parse(localStorage.getItem("icvng_guest_cart") || "[]");
      setLocalWishlistCount(w.length);
      setLocalCompareCount(c.length);
      setLocalCartCount(g.reduce((t, i) => t + (i.quantity || 0), 0));
    } else {
      setLocalWishlistCount(wishlistCount);
      setLocalCompareCount(compareCount);
      setLocalCartCount(totalQty);
    }
  };

  useEffect(() => {
    updateLocalCounts();
  }, [isLoggedIn, wishlistCount, compareCount, totalQty, guestCart]);

  useEffect(() => {
    const h = () => updateLocalCounts();
    window.addEventListener("wishlist-updated", h);
    window.addEventListener("compare-updated", h);
    window.addEventListener("cart-updated", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("wishlist-updated", h);
      window.removeEventListener("compare-updated", h);
      window.removeEventListener("cart-updated", h);
      window.removeEventListener("storage", h);
    };
  }, [isLoggedIn, wishlistCount, compareCount, totalQty]);

  const handleCloseUserMenu = () => setOpenUserMenu(false);

  return (
    <>
      {/* ── Top bar — NOT sticky, scrolls away ── */}
      <div className="bg-secondary-200 text-white px-4 py-2">
        <div className="container mx-auto flex justify-between items-center">
          {/* Left: Promo message (responsive text) */}
          <div className="text-sm hidden md:block">
            Free shipping on orders over ₦100,000 within Lagos!
          </div>
          <div className="text-xs md:hidden">
            Free shipping over ₦100k in Lagos!
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link
              to="/partner-with-us"
              className="text-xs md:text-sm bg-white bg-opacity-20 hover:bg-opacity-30 px-2 md:px-3 py-1 rounded font-medium whitespace-nowrap"
            >
              Partner with us
            </Link>
            <div className="hidden md:flex space-x-4">
              <a
                href="https://www.facebook.com/Italiancoffeeonline/?ref=pages_you_manage"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook size={18} className="hover:opacity-80" />
              </a>
              <a
                href="https://twitter.com/italiancoffee_v"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter size={18} className="hover:opacity-80" />
              </a>
              <a
                href="https://www.instagram.com/italiancofeeventure/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={18} className="hover:opacity-80" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY: Middle bar + Category nav ── */}
      <div
        className="bg-white shadow-md"
        style={{ position: "sticky", top: 0, zIndex: 1000 }}
      >
        {/* ── MOBILE header row ── */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 relative">
          {/* Left: Currency */}
          <CurrencySelector />

          {/* Center: Logo — absolutely centered */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link to="/">
              <img src={logo} alt="I-Coffee" className="h-9 w-auto" />
            </Link>
          </div>

          {/* Right: User + Cart + Hamburger */}
          <div className="flex items-center gap-3">
            {/* User */}
            {user?._id ? (
              <div className="relative">
                <button onClick={() => setOpenUserMenu((p) => !p)}>
                  <User size={22} className="text-gray-700" />
                </button>
                {openUserMenu && (
                  <div className="absolute right-0 top-10 z-50 bg-white rounded shadow-lg p-4 min-w-52">
                    <UserMenu close={handleCloseUserMenu} />
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => navigate("/login")}>
                <User size={22} className="text-gray-700" />
              </button>
            )}

            {/* Cart */}
            <button
              className="relative"
              onClick={() => setOpenCartSection(true)}
            >
              <ShoppingCart size={22} className="text-gray-700" />
              {localCartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                  {localCartCount > 99 ? "99+" : localCartCount}
                </span>
              )}
            </button>

            {/* Hamburger — opens mobile menu in HeaderNavigation */}
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-mobile-menu"))
              }
              aria-label="Menu"
            >
              <Menu size={26} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-3">
          <SearchInput />
        </div>

        {/* ── DESKTOP header row ── */}
        <div className="hidden md:block px-4 py-4">
          <div className="container mx-auto flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src={logo} height={50} width={200} alt="I-Coffee Logo" />
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-xl mx-6">
              <SearchInput />
            </div>

            {/* Desktop icons */}
            <div className="flex items-center space-x-4">
              <Link
                to="/blogs"
                className="bg-secondary-200 hover:bg-secondary-100 text-white rounded py-2 px-3 text-sm font-semibold whitespace-nowrap"
              >
                Coffee Blog
              </Link>
              <CurrencySelector />

              {/* User */}
              {user?._id ? (
                <div className="relative">
                  <button onClick={() => setOpenUserMenu((p) => !p)}>
                    <User size={24} className="text-gray-700" />
                  </button>
                  {openUserMenu && (
                    <div className="absolute right-0 top-12 z-50 bg-white rounded shadow-lg p-4 min-w-52">
                      <UserMenu close={handleCloseUserMenu} />
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => navigate("/login")}>
                  <User size={24} className="text-gray-700" />
                </button>
              )}

              {/* Wishlist */}
              <button
                className="relative"
                onClick={() => navigate("/wishlist")}
              >
                <Heart size={24} className="text-gray-700" />
                {localWishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center animate-pulse">
                    {localWishlistCount > 99 ? "99+" : localWishlistCount}
                  </span>
                )}
              </button>

              {/* Compare */}
              <button className="relative" onClick={() => navigate("/compare")}>
                <VscGitCompare size={24} className="text-gray-700" />
                {localCompareCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center animate-pulse">
                    {localCompareCount > 99 ? "99+" : localCompareCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                className="relative"
                onClick={() => setOpenCartSection(true)}
              >
                <ShoppingCart size={24} className="text-gray-700" />
                {localCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center animate-pulse">
                    {localCartCount > 99 ? "99+" : localCartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate("/shop")}
                className="bg-secondary-200 hover:bg-secondary-100 text-white rounded px-3 py-2 text-sm font-semibold"
              >
                Shop Now
              </button>
            </div>
          </div>
        </div>

        {/* ── Category nav (desktop only — mobile uses hamburger panel) ── */}
        <div className="hidden md:block">
          <HeaderNavigation />
        </div>

        {/* Mobile HeaderNavigation (for the slide-in panel triggered by hamburger) */}
        <div className="md:hidden">
          <HeaderNavigation mobileMenuOnly />
        </div>

        {/* Cart drawer */}
        {openCartSection && (
          <DisplayCartItem close={() => setOpenCartSection(false)} />
        )}
      </div>
    </>
  );
}
