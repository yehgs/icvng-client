import React, { useEffect, useState } from 'react';
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
import { IoSearch } from 'react-icons/io5';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import { FaArrowLeft } from 'react-icons/fa';
import useMobile from '../hooks/useMobile';

const SearchInput = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchPage, setIsSearchPage] = useState(false);
  const [isMobile] = useMobile();
  const params = useLocation();
  const allBrands = useSelector((state) => state.product.allBrands);
  const searchText = params.search.slice(3);

  useEffect(() => {
    const isSearch = location.pathname === '/search';
    setIsSearchPage(isSearch);
  }, [location]);

  const redirectToSearchPage = () => {
    navigate('/search');
  };

  const handleOnChange = (e) => {
    const value = e.target.value;
    const url = `/search?q=${value}`;
    navigate(url);
  };

  return (
    <div className="w-full  min-w-[300px] lg:min-w-[420px] h-11 lg:h-12 rounded-lg border overflow-hidden flex items-center text-neutral-500 bg-slate-50 group focus-within:border-primary-200 ">
      <div>
        {isMobile && isSearchPage ? (
          <Link
            to={'/'}
            className="flex justify-center items-center h-full p-2 m-1 group-focus-within:text-primary-200 bg-white rounded-full shadow-md"
          >
            <FaArrowLeft size={20} />
          </Link>
        ) : (
          <button className="flex justify-center items-center h-full p-3 group-focus-within:text-primary-200">
            <IoSearch size={22} />
          </button>
        )}
      </div>
      <div className="w-full h-full">
        {!isSearchPage ? (
          //not in search page
          <div
            onClick={redirectToSearchPage}
            className="w-full h-full flex items-center"
          >
            <TypeAnimation
              sequence={[
                // Same substring at the start will only be typed out once, initially
                'Search "Nespresso"',
                1000, // wait 1s before replacing "Mice" with "Hamsters"
                'Search "Caffitaly"',
                1000,
                'Search "Dolce Gusto"',
                1000,
                'Search "Carimalli"',
                1000,
                'Search "Lavazza"',
                1000,
                'Search "curd"',
                1000,
                'Search "rice"',
                1000,
                'Search "egg"',
                1000,
                'Search "chips"',
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </div>
        ) : (
          //when i was search page
          <div className="w-full h-full">
            <input
              type="text"
              placeholder="Search for coffee products..."
              autoFocus
              defaultValue={searchText}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brown-400"
              onChange={handleOnChange}
            />
            <Search
              size={20}
              className="absolute right-3 top-3 text-gray-400"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
