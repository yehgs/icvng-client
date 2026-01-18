// icvng-client/src/components/CardProduct.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { valideURLConvert } from "../utils/valideURLConvert";
import { pricewithDiscount } from "../utils/PriceWithDiscount";
import { useGlobalContext, useCurrency } from "../provider/GlobalProvider";
import { useSelector } from "react-redux";
import {
  FaShoppingCart,
  FaStar,
  FaShippingFast,
  FaClock,
  FaCalendarAlt,
  FaSadTear,
  FaShare,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { BsCart4 } from "react-icons/bs";
import toast from "react-hot-toast";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import WishlistButton from "./WishlistButton";
import CompareButton from "./CompareButton";
import ProductRequestModal from "./ProductRequestModal";

const CardProduct = ({ data }) => {
  const url = `/product/${valideURLConvert(data.name)}-${data._id}`;
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedPriceOption, setSelectedPriceOption] = useState("regular");
  const [quickCartLoading, setQuickCartLoading] = useState(false);

  // Track quantities and cart IDs for each price option separately
  const [priceOptionQuantities, setPriceOptionQuantities] = useState({
    regular: 0,
    "3weeks": 0,
    "5weeks": 0,
  });

  const [priceOptionCartIds, setPriceOptionCartIds] = useState({
    regular: null,
    "3weeks": null,
    "5weeks": null,
  });

  const navigate = useNavigate();
  const {
    getEffectiveStock,
    fetchCartItem,
    updateCartItem,
    deleteCartItem,
    isLoggedIn,
    guestCart,
    addToGuestCart,
    updateGuestCartItem,
    removeFromGuestCart,
  } = useGlobalContext();
  const { formatPrice } = useCurrency();
  const cartItem = useSelector((state) => state.cartItem.cart);

  const effectiveStock = getEffectiveStock(data);
  const onlineStock = data.warehouseStock?.onlineStock || 0;

  const getPrimaryPrice = (product) => {
    return product.btcPrice && product.btcPrice > 0
      ? product.btcPrice
      : product.price;
  };

  // Check ALL price options in cart and store their quantities
  useEffect(() => {
    const quantities = {
      regular: 0,
      "3weeks": 0,
      "5weeks": 0,
    };

    const cartIds = {
      regular: null,
      "3weeks": null,
      "5weeks": null,
    };

    if (isLoggedIn) {
      cartItem.forEach((item) => {
        if (item.productId._id === data._id) {
          const option = item.priceOption || "regular";
          quantities[option] = item.quantity;
          cartIds[option] = item._id;
        }
      });
    } else {
      guestCart.forEach((item) => {
        if (item.productId === data._id) {
          const option = item.priceOption || "regular";
          quantities[option] = item.quantity;
        }
      });
    }

    setPriceOptionQuantities(quantities);
    setPriceOptionCartIds(cartIds);
  }, [cartItem, guestCart, data._id, isLoggedIn]);

  const getSelectedPrice = (priceOption) => {
    const primaryPrice = getPrimaryPrice(data);

    switch (priceOption) {
      case "3weeks":
        return data.price3weeksDelivery > 0
          ? data.price3weeksDelivery
          : primaryPrice;
      case "5weeks":
        return data.price5weeksDelivery > 0
          ? data.price5weeksDelivery
          : primaryPrice;
      default:
        return primaryPrice;
    }
  };

  const getRoastLevelInfo = () => {
    if (!data.roastLevel) return null;

    const levels = {
      LIGHT: { color: "text-amber-300", label: "Light Roast" },
      MEDIUM: { color: "text-amber-600", label: "Medium Roast" },
      DARK: { color: "text-amber-900", label: "Dark Roast" },
    };

    return levels[data.roastLevel] || null;
  };

  const getIntensityLevel = () => {
    if (!data.intensity) return null;

    const level = parseInt(data.intensity.split("/")[0]);
    const total = parseInt(data.intensity.split("/")[1]);

    return { level, total };
  };

  const getProductInfo = () => {
    let details = [];

    if (data.unit) details.push(data.unit);
    if (data.packaging) details.push(data.packaging);
    if (data.weight) details.push(`${data.weight}kg`);

    return details.join(" • ");
  };

  const getProductBadges = () => {
    const badges = [];

    if (data.blend) {
      badges.push({
        label: data.blend,
        class: "bg-amber-50 text-amber-800",
      });
    }

    if (data.coffeeOrigin) {
      badges.push({
        label: data.coffeeOrigin,
        class: "bg-green-50 text-green-800",
      });
    }

    return badges.slice(0, 2);
  };

  // ✅ UPDATED: Get pricing options based on stock availability
  const getPricingOptions = () => {
    const options = [];
    const primaryPrice = getPrimaryPrice(data);

    // Only show regular price if online stock > 0
    if (onlineStock > 0 && primaryPrice > 0) {
      options.push({
        price: primaryPrice,
        label: "3 to 5 Days",
        icon: <FaShippingFast className="w-3 h-3" />,
        color: "text-green-600",
        bgColor: "bg-green-50",
        key: "regular",
      });
    }

    // Always show 3-week delivery if price exists
    if (data.price3weeksDelivery > 0) {
      options.push({
        price: data.price3weeksDelivery,
        label: "3 Weeks",
        icon: <FaClock className="w-3 h-3" />,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        key: "3weeks",
      });
    }

    // Always show 5-week delivery if price exists
    if (data.price5weeksDelivery > 0) {
      options.push({
        price: data.price5weeksDelivery,
        label: "5 Weeks",
        icon: <FaCalendarAlt className="w-3 h-3" />,
        color: "text-red-600",
        bgColor: "bg-red-50",
        key: "5weeks",
      });
    }

    return options;
  };

  const handlePriceOptionSelect = (e, optionKey) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPriceOption(optionKey);
  };

  const handleQuickAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setQuickCartLoading(true);

      const priceOptionToUse = selectedPriceOption || "regular";
      const selectedPrice = getSelectedPrice(priceOptionToUse);

      if (!isLoggedIn) {
        const cartData = {
          productId: data._id,
          quantity: 1,
          priceOption: priceOptionToUse,
          price: selectedPrice,
          discount: data.discount || 0,
          name: data.name,
          image: data.image,
          stock: effectiveStock,
          productAvailability: data.productAvailability,
          price3weeksDelivery: data.price3weeksDelivery,
          price5weeksDelivery: data.price5weeksDelivery,
          btcPrice: data.btcPrice,
        };

        addToGuestCart(cartData);
        toast.success("Added to cart");
        window.dispatchEvent(new CustomEvent("cart-updated"));
        return;
      }

      const cartData = {
        productId: data._id,
        quantity: 1,
        priceOption: priceOptionToUse,
      };

      const response = await Axios({
        ...SummaryApi.addTocart,
        data: cartData,
      });

      if (response.data.success) {
        toast.success("Added to cart");
        fetchCartItem();
        window.dispatchEvent(new CustomEvent("cart-updated"));
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setQuickCartLoading(false);
    }
  };

  const handleQuickIncreaseQty = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setQuickCartLoading(true);
      const currentPriceOption = selectedPriceOption || "regular";
      const currentQty = priceOptionQuantities[currentPriceOption] || 0;
      const cartId = priceOptionCartIds[currentPriceOption];

      if (!isLoggedIn) {
        updateGuestCartItem(data._id, currentQty + 1, currentPriceOption);
        toast.success("Quantity updated");
        window.dispatchEvent(new CustomEvent("cart-updated"));
      } else {
        const response = await updateCartItem(cartId, currentQty + 1);
        if (response.success) {
          toast.success("Quantity updated");
          window.dispatchEvent(new CustomEvent("cart-updated"));
        }
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setQuickCartLoading(false);
    }
  };

  const handleQuickDecreaseQty = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setQuickCartLoading(true);
      const currentPriceOption = selectedPriceOption || "regular";
      const currentQty = priceOptionQuantities[currentPriceOption] || 0;
      const cartId = priceOptionCartIds[currentPriceOption];

      if (!isLoggedIn) {
        if (currentQty === 1) {
          removeFromGuestCart(data._id, currentPriceOption);
          toast.success("Removed from cart");
        } else {
          updateGuestCartItem(data._id, currentQty - 1, currentPriceOption);
          toast.success("Quantity updated");
        }
        window.dispatchEvent(new CustomEvent("cart-updated"));
      } else {
        if (currentQty === 1) {
          await deleteCartItem(cartId);
          toast.success("Removed from cart");
        } else {
          const response = await updateCartItem(cartId, currentQty - 1);
          if (response.success) {
            toast.success("Quantity updated");
          }
        }
        window.dispatchEvent(new CustomEvent("cart-updated"));
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setQuickCartLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({
          title: data.name,
          text: `Check out this product: ${data.name}`,
          url: window.location.origin + url,
        });
      } catch (error) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const productUrl = window.location.origin + url;
    navigator.clipboard
      .writeText(productUrl)
      .then(() => {
        toast.success("Product link copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  const handleQuickCheckout = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const currentPriceOption = selectedPriceOption || "regular";
    const hasItemInCart = priceOptionQuantities[currentPriceOption] > 0;

    if (!hasItemInCart) {
      await handleQuickAddToCart(e);
    }

    navigate("/checkout");
  };

  const pricingOptions = getPricingOptions();
  const roastInfo = getRoastLevelInfo();
  const intensityInfo = getIntensityLevel();
  const badges = getProductBadges();

  const formatProductType = (type) => {
    if (!type) return "";
    return type
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Get current quantity and state for selected price option
  const currentQty = priceOptionQuantities[selectedPriceOption] || 0;
  const isInCart = currentQty > 0;

  // ✅ Auto-select first available pricing option
  useEffect(() => {
    if (
      pricingOptions.length > 0 &&
      !pricingOptions.find((opt) => opt.key === selectedPriceOption)
    ) {
      setSelectedPriceOption(pricingOptions[0].key);
    }
  }, [
    onlineStock,
    data.price,
    data.btcPrice,
    data.price3weeksDelivery,
    data.price5weeksDelivery,
  ]);

  return (
    <div className="group relative border hover:shadow-md transition-shadow duration-300 p-3 lg:p-4 flex flex-col rounded-lg cursor-pointer bg-white h-full">
      {/* Floating Action Buttons */}
      <div className="absolute top-2 right-2 z-10 group">
        <WishlistButton
          product={data}
          className="bg-white rounded-full p-2 shadow-sm hover:shadow-md transition-all"
          iconOnly={true}
        />

        <div className="opacity-0 group-hover:opacity-100 transform translate-y-0 group-hover:translate-y-2 transition-all duration-300 ease-in-out">
          <div className="mt-2 space-y-2">
            <CompareButton
              product={data}
              className="bg-white rounded-full p-2 shadow-sm hover:shadow-md transition-all w-10 h-10 flex items-center justify-center"
              iconOnly={true}
            />

            <button
              onClick={handleShare}
              className="bg-white rounded-full p-2 shadow-sm hover:shadow-md transition-all w-10 h-10 flex items-center justify-center"
              title="Share product"
            >
              <FaShare className="text-gray-500 hover:text-blue-600 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Badge Row */}
      <div className="flex justify-between mb-2">
        {data.productType && (
          <span className="rounded-full text-xs px-2 py-0.5 bg-gray-100 text-gray-600">
            {formatProductType(data.productType)}
          </span>
        )}
        <div className="flex gap-1 mr-7">
          {data.featured && (
            <span className="text-white bg-yellow-500 px-2 py-0.5 text-xs font-medium rounded-full">
              Featured
            </span>
          )}
          {Boolean(data.discount) && (
            <span className="text-white bg-green-600 px-2 py-0.5 text-xs font-medium rounded-full">
              {data.discount}% OFF
            </span>
          )}
        </div>
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

        {/* ✅ UPDATED: Stock indicator */}
        {onlineStock > 0 ? (
          <div className="absolute bottom-1 right-1 bg-green-600 text-white text-xs px-2 py-1 rounded">
            {onlineStock <= 5
              ? `Only ${onlineStock} left`
              : `Stock: ${onlineStock}`}
          </div>
        ) : pricingOptions.length > 0 ? (
          <div className=""></div>
        ) : null}
      </Link>

      {/* Product Name */}
      <Link to={url} className="block">
        <h3 className="font-medium text-gray-800 line-clamp-2 mb-1 hover:text-green-700 transition-colors">
          {data.name}
        </h3>
      </Link>

      {/* SKU */}
      {data.sku && (
        <div className="text-xs text-gray-400 mb-1">SKU: {data.sku}</div>
      )}

      {/* Brand/Producer */}
      {data.producer && (
        <div className="text-xs text-gray-500 mb-1">
          by{" "}
          <span className="font-medium">{data.producer.name || "Brand"}</span>
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

      {/* Product Details */}
      <div className="text-xs text-gray-500 my-1">{getProductInfo()}</div>

      {/* Rating */}
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

      {/* ✅ UPDATED: Pricing Options - Only show if online stock > 0 OR has delivery prices */}
      {data.productAvailability && pricingOptions.length > 0 ? (
        <div className="space-y-2 mb-3">
          {pricingOptions.map((option, index) => (
            <div
              key={index}
              className={`flex items-center justify-between text-xs p-2 rounded cursor-pointer transition-colors ${
                selectedPriceOption === option.key
                  ? `${option.bgColor} ring-2 ring-green-500`
                  : `${option.bgColor} hover:ring-1 hover:ring-gray-300`
              }`}
              onClick={(e) => handlePriceOptionSelect(e, option.key)}
            >
              <div className={`flex items-center gap-1 ${option.color}`}>
                {option.icon}
                <span className="font-medium">{option.label}</span>
              </div>
              <div className={`font-bold ${option.color}`}>
                {formatPrice(pricewithDiscount(option.price, data.discount))}
                {Boolean(data.discount) && (
                  <div className="text-xs text-gray-400 line-through">
                    {formatPrice(option.price)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-3 p-2 bg-gray-100 rounded text-center">
          <p className="text-xs text-gray-500">No delivery options available</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto pt-2 border-t space-y-2 text-sm">
        {!data.productAvailability || pricingOptions.length === 0 ? (
          <button
            onClick={() => setShowRequestModal(true)}
            className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium py-2 px-3 rounded-md transition flex items-center justify-center border border-yellow-300"
          >
            <FaSadTear className="mr-2 text-yellow-600" />
            <span className="text-sm">Request Product</span>
          </button>
        ) : (
          <>
            {!isInCart ? (
              <button
                onClick={handleQuickAddToCart}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-3 rounded-md transition flex items-center justify-center"
                disabled={quickCartLoading}
              >
                {quickCartLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                ) : (
                  <>
                    <BsCart4 className="mr-2" />
                    Add to Cart
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center bg-green-50 border border-green-200 rounded-md">
                <button
                  onClick={handleQuickDecreaseQty}
                  className="bg-green-700 hover:bg-green-800 text-white p-2 rounded-l-md flex items-center justify-center transition"
                  disabled={quickCartLoading}
                >
                  <FaMinus className="text-sm" />
                </button>

                <div className="flex-1 py-2 px-3 bg-white font-semibold text-center">
                  {quickCartLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-green-700 mx-auto"></div>
                  ) : (
                    currentQty
                  )}
                </div>

                <button
                  onClick={handleQuickIncreaseQty}
                  className="bg-green-700 hover:bg-green-800 text-white p-2 rounded-r-md flex items-center justify-center transition"
                  disabled={quickCartLoading}
                >
                  <FaPlus className="text-sm" />
                </button>
              </div>
            )}

            {/* Quick Checkout Button */}
            <button
              onClick={handleQuickCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md transition flex items-center justify-center text-sm"
            >
              <FaShoppingCart className="mr-2" />
              Quick Checkout
            </button>
          </>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <ProductRequestModal
          product={data}
          onClose={() => setShowRequestModal(false)}
          isDiscontinued={!data.productAvailability}
        />
      )}
    </div>
  );
};

export default CardProduct;
