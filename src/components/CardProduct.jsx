import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DisplayPriceInNaira } from '../utils/DisplayPriceInNaira';
import { valideURLConvert } from '../utils/valideURLConvert';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
import { FaShoppingCart, FaStar, FaCoffee } from 'react-icons/fa';
import { MdLocalCafe } from 'react-icons/md';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { useGlobalContext } from '../provider/GlobalProvider';
import WishlistButton from './WishlistButton';

// Simplified AddToCartButton component
const SimpleAddToCartButton = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const { fetchCartItem } = useGlobalContext();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true);

      const response = await Axios({
        ...SummaryApi.addTocart,
        data: {
          productId: data?._id,
          quantity: 1,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        if (fetchCartItem) {
          fetchCartItem();
        }
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  if (data.stock <= 0) {
    return (
      <button
        className="w-full bg-gray-300 text-gray-700 text-sm font-medium py-2 px-3 rounded-md cursor-not-allowed"
        disabled
      >
        Out of Stock
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      className="w-full bg-green-700 hover:bg-green-800 text-white text-sm font-medium py-2 px-3 rounded-md transition flex items-center justify-center"
      disabled={loading}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
      ) : (
        <>
          <FaShoppingCart className="mr-1" /> Add
        </>
      )}
    </button>
  );
};

const CardProduct = ({ data }) => {
  const url = `/product/${valideURLConvert(data.name)}-${data._id}`;

  // Format product type for display
  const formatProductType = (type) => {
    if (!type) return '';
    return type
      .replace('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Get roast level icon and label
  const getRoastLevelInfo = () => {
    if (!data.roastLevel) return null;

    const levels = {
      LIGHT: { color: 'text-amber-300', label: 'Light Roast' },
      MEDIUM: { color: 'text-amber-600', label: 'Medium Roast' },
      DARK: { color: 'text-amber-900', label: 'Dark Roast' },
    };

    return levels[data.roastLevel] || null;
  };

  // Format coffee intensity level for display
  const getIntensityLevel = () => {
    if (!data.intensity) return null;

    const level = parseInt(data.intensity.split('/')[0]);
    const total = parseInt(data.intensity.split('/')[1]);

    return { level, total };
  };

  // Format product details
  const getProductInfo = () => {
    let details = [];

    if (data.unit) details.push(data.unit);
    if (data.packaging) details.push(data.packaging);
    if (data.weight) details.push(`${data.weight}g`);

    return details.join(' • ');
  };

  // Get product badges and features
  const getProductBadges = () => {
    const badges = [];

    if (data.blend) {
      badges.push({
        label: data.blend,
        class: 'bg-amber-50 text-amber-800',
      });
    }

    if (data.coffeeOrigin) {
      badges.push({
        label: data.coffeeOrigin,
        class: 'bg-green-50 text-green-800',
      });
    }

    if (data.aromaticProfile) {
      badges.push({
        label: data.aromaticProfile,
        class: 'bg-indigo-50 text-indigo-800',
      });
    }

    return badges.slice(0, 2); // Limit to 2 badges to avoid overcrowding
  };

  const roastInfo = getRoastLevelInfo();
  const intensityInfo = getIntensityLevel();
  const badges = getProductBadges();

  return (
    <div className="group relative border hover:shadow-md transition-shadow duration-300 p-3 lg:p-4 flex flex-col rounded-lg cursor-pointer bg-white h-full">
      {/* Wishlist Button */}
      <div className="absolute top-2 right-2 z-10">
        <WishlistButton
          product={data}
          className="bg-white rounded-full p-2 shadow-sm hover:shadow-md transition-all"
          iconOnly={true}
        />
      </div>

      {/* Badge Row */}
      <div className="flex justify-between mb-2">
        {data.productType && (
          <span className="rounded-full text-xs px-2 py-0.5 bg-gray-100 text-gray-600">
            {formatProductType(data.productType)}
          </span>
        )}
        {Boolean(data.discount) && (
          <span className="text-white bg-green-600 px-2 py-0.5 text-xs font-medium rounded-full mr-7">
            {data.discount}% OFF
          </span>
        )}
      </div>

      {/* Image */}
      <Link
        to={url}
        className="relative block h-36 w-full mb-3 flex items-center justify-center bg-gray-50 rounded-md overflow-hidden group-hover:opacity-95 transition-opacity"
      >
        {data.image && data.image.length > 0 ? (
          <img
            src={data.image[0]}
            alt={data.name}
            className="w-full h-full object-contain mix-blend-multiply p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        {data.stock <= 5 && data.stock > 0 && (
          <div className="absolute top-0 left-0 bg-amber-500 text-white text-xs px-2 py-0.5">
            Only {data.stock} left
          </div>
        )}
      </Link>

      {/* Product Name */}
      <Link to={url} className="block">
        <h3 className="font-medium text-gray-800 line-clamp-2 mb-1 hover:text-green-700 transition-colors">
          {data.name}
        </h3>
      </Link>

      {/* Brand/Producer if available */}
      {data.producer && (
        <div className="text-xs text-gray-500 mb-1">
          by{' '}
          <span className="font-medium">{data.producer.name || 'Brand'}</span>
        </div>
      )}

      {/* Feature Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1 my-1">
          {badges.map((badge, index) => (
            <span
              key={index}
              className={`text-xs px-1.5 py-0.5 rounded-sm ${badge.class}`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {/* Coffee-specific details */}
      {data.productType === 'COFFEE' && (
        <div className="my-1 space-y-1">
          {/* Intensity */}
          {intensityInfo && (
            <div className="flex items-center text-xs">
              <span className="mr-1 font-medium">Intensity:</span>
              <div className="flex space-x-0.5">
                {[...Array(intensityInfo.total)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < intensityInfo.level ? 'bg-amber-800' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Details */}
      <div className="text-xs text-gray-500 my-1">{getProductInfo()}</div>

      {/* Rating if available */}
      {data.averageRating > 0 && (
        <div className="flex items-center mb-2">
          <FaStar className="text-amber-400 mr-1" />
          <span className="text-sm font-medium">
            {data.averageRating.toFixed(1)}
          </span>
          {data.ratings && data.ratings.length > 0 && (
            <span className="text-xs text-gray-400 ml-1">
              ({data.ratings.length})
            </span>
          )}
        </div>
      )}

      {/* Price and Add to Cart */}
      <div className="mt-auto pt-2 border-t">
        <div className="flex items-center justify-between mb-1">
          <div>
            <div className="font-bold text-gray-900">
              {DisplayPriceInNaira(
                pricewithDiscount(data.price, data.discount)
              )}
            </div>
            {Boolean(data.discount) && (
              <div className="text-xs text-gray-400 line-through">
                {DisplayPriceInNaira(data.price)}
              </div>
            )}
          </div>

          <div className="w-20">
            <SimpleAddToCartButton data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardProduct;
