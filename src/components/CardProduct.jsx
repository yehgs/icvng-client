import React, { useState } from 'react';
import { DisplayPriceInNaira } from '../utils/DisplayPriceInNaira';
import { Link } from 'react-router-dom';
import { valideURLConvert } from '../utils/valideURLConvert';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
import AddToCartButton from './AddToCartButton';
import { FaStar, FaHeart, FaShareAlt } from 'react-icons/fa';
import { MdCoffee } from 'react-icons/md';

const CardProduct = ({ data }) => {
  const [isHovering, setIsHovering] = useState(false);
  const url = `/product/${valideURLConvert(data.name)}-${data._id}`;

  // Coffee attributes display helpers
  const renderIntensity = () => {
    if (!data.intensity) return null;
    const intensityValue = parseInt(data.intensity?.split('/')[0]) || 0;

    return (
      <div className="flex items-center gap-1 text-xs">
        <span className="font-medium text-gray-700">Intensity:</span>
        <div className="flex gap-0.5">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-4 rounded-sm ${
                i < intensityValue ? 'bg-amber-800' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  // Attributes to display for coffee products
  const renderCoffeeAttributes = () => {
    if (data.productType !== 'COFFEE' && data.productType !== 'COFFEE_BEANS')
      return null;

    return (
      <div className="mt-2 grid gap-1.5 text-xs">
        {data.roastLevel && (
          <div className="flex items-center gap-1">
            <span className="text-gray-700">Roast:</span>
            <span className="font-medium capitalize">
              {data.roastLevel.toLowerCase()}
            </span>
          </div>
        )}

        {data.blend && (
          <div className="flex items-center gap-1">
            <span className="text-gray-700">Blend:</span>
            <span className="font-medium">{data.blend}</span>
          </div>
        )}

        {data.coffeeOrigin && (
          <div className="flex items-center gap-1">
            <span className="text-gray-700">Origin:</span>
            <span className="font-medium">{data.coffeeOrigin}</span>
          </div>
        )}

        {renderIntensity()}

        {data.aromaticProfile && (
          <div className="flex items-center gap-1">
            <span className="text-gray-700">Profile:</span>
            <span className="font-medium">{data.aromaticProfile}</span>
          </div>
        )}
      </div>
    );
  };

  // Product badge (discount or type)
  const renderBadge = () => {
    if (data.discount > 0) {
      return (
        <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-medium py-1 px-2 rounded-full z-10">
          {data.discount}% OFF
        </span>
      );
    }

    return null;
  };

  // Prevent event bubbling for action buttons
  const handleActionClick = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    // Implement share or favorite functionality
    console.log(`${action} clicked for product: ${data.name}`);
  };

  return (
    <Link
      to={url}
      className="relative flex flex-col h-full border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 bg-white"
    >
      {/* Discount Badge */}
      {renderBadge()}

      {/* Image with hover actions */}
      <div
        className="relative h-48 w-full bg-gray-50 p-4 flex items-center justify-center overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img
          src={data.image[0]}
          alt={data.name}
          className="h-full object-contain mix-blend-multiply transition-transform duration-300 ease-in-out"
        />

        {/* Product Type Badge - visible when not hovering */}
        <div
          className={`absolute top-3 left-3 transition-all duration-300 ${
            isHovering ? 'opacity-0 translate-y-2' : 'opacity-100'
          }`}
        >
          {data.productType && (
            <span
              className={`
              ${
                data.productType === 'COFFEE'
                  ? 'bg-amber-600'
                  : data.productType === 'COFFEE_BEANS'
                  ? 'bg-amber-800'
                  : data.productType === 'TEA'
                  ? 'bg-green-600'
                  : data.productType === 'MACHINE'
                  ? 'bg-gray-700'
                  : data.productType === 'ACCESSORIES'
                  ? 'bg-blue-600'
                  : 'bg-gray-600'
              } 
              text-white text-xs font-medium py-1 px-2 rounded-full
            `}
            >
              {data.productType === 'COFFEE_BEANS' ? 'BEANS' : data.productType}
            </span>
          )}
        </div>

        {/* Action buttons - visible on hover */}
        <div
          className={`absolute top-3 left-0 right-0 flex justify-center gap-3 transition-all duration-300 ${
            isHovering ? 'opacity-100' : 'opacity-0 translate-y-2'
          }`}
        >
          <button
            onClick={(e) => handleActionClick(e, 'favorite')}
            className="bg-white bg-opacity-90 text-amber-700 hover:text-red-500 p-2 rounded-full shadow-md transition-colors duration-200"
            aria-label="Add to favorites"
          >
            <FaHeart size={16} />
          </button>
          <button
            onClick={(e) => handleActionClick(e, 'share')}
            className="bg-white bg-opacity-90 text-amber-700 hover:text-blue-500 p-2 rounded-full shadow-md transition-colors duration-200"
            aria-label="Share product"
          >
            <FaShareAlt size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-4">
        {/* Brand if available */}
        {data.brand?.length > 0 && (
          <div className="text-xs text-gray-500 uppercase mb-1">
            {/* This would need to be updated if brand is populated */}
            {data.brand[0]?.name || 'Premium Brand'}
          </div>
        )}

        {/* Product name */}
        <h3 className="font-medium text-base line-clamp-2 mb-1 text-gray-800">
          {data.name}
        </h3>

        {/* Rating */}
        {data.averageRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={
                    i < Math.round(data.averageRating)
                      ? 'text-amber-400'
                      : 'text-gray-300'
                  }
                  size={14}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({data.ratings?.length || 0})
            </span>
          </div>
        )}

        {/* Coffee specific attributes */}
        {renderCoffeeAttributes()}

        {/* Weight/Unit */}
        <div className="text-sm text-gray-600 mt-2">
          {data.weight && `${data.weight}${data.unit}`}
          {!data.weight && data.unit && data.unit}
        </div>

        {/* Spacer */}
        <div className="flex-grow"></div>

        {/* Price and button */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-col">
            {data.discount > 0 && (
              <span className="text-xs text-gray-500 line-through">
                {DisplayPriceInNaira(data.price)}
              </span>
            )}
            <span className="font-bold text-gray-900">
              {DisplayPriceInNaira(
                pricewithDiscount(data.price, data.discount)
              )}
            </span>
          </div>

          <div>
            {data.stock === 0 ? (
              <span className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded">
                Out of stock
              </span>
            ) : (
              <AddToCartButton
                data={data}
                buttonClassName="bg-amber-600 hover:bg-amber-700"
              />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CardProduct;
