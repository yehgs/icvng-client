import React, { useEffect, useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { IoSearch } from "react-icons/io5";
import { FaArrowLeft } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import { useDispatch } from "react-redux";
import useMobile from "../hooks/useMobile";
import Axios from "../utils/Axios";
import { DisplayPriceInNaira } from "../utils/DisplayPriceInNaira";
import { setSearchTerm } from "../store/filterSlice";
import { isFiveWeekDeliveryCategory } from "../config/deliveryCategories";
import { useCountry } from "../context/CountryContext";

const valideURLConvert = (name) => {
  const url = name
    ?.toString()
    .replaceAll(" ", "-")
    .replaceAll(",", "-")
    .replaceAll("&", "-");
  return url;
};

const SEARCH_TERMS = [
  "Nespresso",
  "Caffitaly",
  "Dolce Gusto",
  "Carimalli",
  "Lavazza",
  "Coffee Machine",
  "Barattini",
  "Ground Coffee",
  "Instant Coffee",
];

const SearchInput = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t, language } = useCountry();
  const [isSearchPage, setIsSearchPage] = useState(false);
  const [isMobile] = useMobile();
  const params = new URLSearchParams(location.search);
  const searchText = params.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(searchText);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    const isShop = location.pathname === "/shop";
    setIsSearchPage(isShop);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keep input in sync with URL param when navigating back/forward
  useEffect(() => {
    setSearchQuery(searchText);
  }, [searchText]);

  const redirectToSearchPage = () => {
    navigate("/shop");
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(true);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      if (value.length > 2) {
        fetchSearchResults(value);
      } else {
        setSearchResults([]);
      }
    }, 300);
  };

  const fetchSearchResults = async (query) => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await Axios({
        method: "GET",
        url: `/api/product/search?q=${query}&limit=5`,
      });
      if (response.data.success) {
        setSearchResults(response.data.data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${valideURLConvert(product.name)}-${product._id}`);
    setShowResults(false);
  };

  // KEY FIX: dispatch to Redux FIRST, then navigate.
  // This guarantees Redux has the search term before EnhancedShopPage
  // mounts and its useEffect fires.
  const handleSubmitSearch = (e) => {
    if (e) e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    // 1. Write to Redux synchronously before navigation
    dispatch(setSearchTerm(trimmed));

    // 2. Navigate — EnhancedShopPage will now see the correct Redux state
    navigate(`/shop?q=${encodeURIComponent(trimmed)}`);
    setShowResults(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    dispatch(setSearchTerm(""));
  };

  return (
    <div
      ref={searchRef}
      className="w-full relative min-w-[300px] lg:min-w-[420px] h-11 lg:h-12 rounded-lg border overflow-visible flex items-center text-neutral-500 bg-slate-50 group focus-within:border-primary-200"
    >
      <form onSubmit={handleSubmitSearch} className="w-full flex items-center">
        <div>
          {isMobile && isSearchPage ? (
            <Link
              to={"/"}
              className="flex justify-center items-center h-full p-2 m-1 group-focus-within:text-primary-200 bg-white rounded-full shadow-md"
            >
              <FaArrowLeft size={20} />
            </Link>
          ) : (
            <button
              type="submit"
              className="flex justify-center items-center h-full p-3 group-focus-within:text-primary-200"
            >
              <IoSearch size={22} />
            </button>
          )}
        </div>
        <div className="w-full h-full">
          {!isSearchPage ? (
            <div className="w-full h-full flex items-center">
              <input
                type="text"
                placeholder=""
                value={searchQuery}
                onChange={handleSearchChange}
                onClick={() => setShowResults(true)}
                className="w-full h-full bg-transparent outline-none px-2"
              />
              {!searchQuery && (
                <div className="absolute left-12 top-1/2 transform -translate-y-1/2 pointer-events-none opacity-70">
                  <TypeAnimation
                    key={language}
                    sequence={SEARCH_TERMS.flatMap((term) => [
                      `${t("header.searchPrefix")} ${term}`,
                      1000,
                    ])}
                    wrapper="span"
                    speed={50}
                    repeat={Infinity}
                  />
                </div>
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ) : (
            <div className="w-full h-full">
              <input
                type="text"
                placeholder=""
                autoFocus
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full h-full bg-transparent outline-none px-2"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && searchQuery && (
        <div className="absolute z-50 top-full left-0 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              {searchResults.map((product) => (
                <div
                  key={product._id}
                  className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="h-16 w-16 flex-shrink-0 mr-4">
                    <img
                      src={product.image[0]}
                      alt={product.name}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-image.png";
                      }}
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-gray-800">
                      {product.name}
                    </h4>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      {product.productType && (
                        <span className="mr-3">
                          {product.productType.replace("_", " ")}
                        </span>
                      )}
                      {product.brand && product.brand[0] && (
                        <span className="mr-3">{product.brand[0].name}</span>
                      )}
                      {product.roastLevel && (
                        <span className="mr-3">
                          Roast: {product.roastLevel}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {(() => {
                      // Same rule as the single product page: category
                      // decides 5-week vs 3-week delivery, NOT productType.
                      // productType can be mislabeled (e.g. a capsule
                      // machine tagged "COFFEE" for its coffee-pod side),
                      // but category (capsule-machine/coffee-maker) is
                      // the authoritative signal — see config/deliveryCategories.js
                      const isMachine = isFiveWeekDeliveryCategory(
                        product.category,
                      );
                      const deliveryPrice = isMachine
                        ? product.price5weeksDelivery
                        : product.price3weeksDelivery;
                      const deliveryLabel = isMachine
                        ? "5wk delivery"
                        : "3wk delivery";
                      const hasBtcPrice = product.btcPrice > 0;
                      const hasDeliveryPrice = deliveryPrice > 0;

                      if (!hasBtcPrice && !hasDeliveryPrice) return null;

                      return (
                        <>
                          {hasBtcPrice && (
                            <div className="text-primary-600 font-bold">
                              {DisplayPriceInNaira(product.btcPrice)}
                            </div>
                          )}
                          {hasDeliveryPrice && (
                            <div
                              className={
                                hasBtcPrice
                                  ? "text-xs text-gray-500"
                                  : "text-primary-600 font-bold"
                              }
                            >
                              {hasBtcPrice ? `${deliveryLabel}: ` : ""}
                              {DisplayPriceInNaira(deliveryPrice)}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              ))}
              <div className="p-3 text-center">
                <button
                  onClick={handleSubmitSearch}
                  className="text-primary-600 hover:underline font-medium"
                >
                  See all results for "{searchQuery}"
                </button>
              </div>
            </>
          ) : searchQuery.length > 2 ? (
            <div className="p-4 text-center text-gray-500">
              No products found
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Type at least 3 characters to search
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
