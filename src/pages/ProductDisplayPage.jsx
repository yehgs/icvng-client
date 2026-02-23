// icvng-client/src/pages/ProductDisplayPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SummaryApi from "../common/SummaryApi";
import Axios from "../utils/Axios";
import AxiosToastError from "../utils/AxiosToastError";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaTruck,
  FaShieldAlt,
  FaLeaf,
  FaClock,
  FaShippingFast,
  FaCalendarAlt,
  FaSadTear,
  FaEdit,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { BsCart4 } from "react-icons/bs";
import { pricewithDiscount } from "../utils/PriceWithDiscount";
import ProductRequestModal from "../components/ProductRequestModal";
import EditProductAdmin from "../components/EditProductAdmin";
import { useSelector } from "react-redux";
import { useGlobalContext, useCurrency } from "../provider/GlobalProvider";
import RoastIndicator from "../components/RoastIndicator";
import IntensityMeter from "../components/IntensityMeter";
import RatingReviewComponent from "../components/RatingReviewComponent";
import toast from "react-hot-toast";
import { isFiveWeekDeliveryCategory } from "../config/deliveryCategories";

const ProductDisplayPage = () => {
  const params = useParams();

  // ── Safe param parsing ────────────────────────────────────────────────────
  // URL pattern: /product/product-name-slug-{id}
  // params.product may be undefined if route config changes — guard with ?.
  const productId = params?.product?.split("-")?.slice(-1)[0];
  // ─────────────────────────────────────────────────────────────────────────

  const [data, setData] = useState({
    name: "",
    image: [],
    brand: [],
    category: null,
    roastLevel: "",
    aromaticProfile: "",
    blend: "",
    intensity: "",
    coffeeOrigin: "",
    roastOrigin: "",
    productType: "",
    description: "",
    shortDescription: "",
    additionalInfo: "",
    more_details: {},
    weight: 0,
    unit: "",
    packaging: "",
    ratings: [],
    averageRating: 0,
    price: 0,
    btcPrice: 0,
    price3weeksDelivery: 0,
    price5weeksDelivery: 0,
    discount: 0,
    stock: 0,
    warehouseStock: {
      enabled: false,
      onlineStock: 0,
    },
    productAvailability: true,
    sku: "",
    featured: false,
  });

  const [image, setImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedPriceOption, setSelectedPriceOption] = useState("regular");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // Image magnifier state
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  // Track quantities and cart IDs per price option
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

  const user = useSelector((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const cartItem = useSelector((state) => state.cartItem.cart);

  const { formatPrice, selectedCurrency } = useCurrency();
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

  const effectiveStock = getEffectiveStock(data);
  const onlineStock = data.warehouseStock?.onlineStock || 0;

  // ── Category-based delivery pricing mode ─────────────────────────────────
  // Capsule Machine & Coffee Maker → show 5-week delivery price
  // All other categories           → show 3-week delivery price
  // To change which categories use 5-week pricing, edit:
  //   src/config/deliveryCategories.js
  const showFiveWeekDelivery = isFiveWeekDeliveryCategory(data.category);
  // ─────────────────────────────────────────────────────────────────────────

  const getPrimaryPrice = (product) =>
    product.btcPrice && product.btcPrice > 0 ? product.btcPrice : product.price;

  // Sync cart quantities for all price options
  useEffect(() => {
    const quantities = { regular: 0, "3weeks": 0, "5weeks": 0 };
    const cartIds = { regular: null, "3weeks": null, "5weeks": null };

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

  // Listen for currency changes
  useEffect(() => {
    const handleCurrencyChange = () =>
      setSelectedPriceOption(selectedPriceOption);
    window.addEventListener("currency-changed", handleCurrencyChange);
    return () =>
      window.removeEventListener("currency-changed", handleCurrencyChange);
  }, [selectedPriceOption]);

  const fetchProductDetails = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getProductDetails,
        data: { productId },
      });
      const { data: responseData } = response;
      if (responseData.success) {
        setData(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProductDetails();
  }, [params]);

  // ── Build price options (max 2) ───────────────────────────────────────────
  // 1. Regular / fast delivery  — only when onlineStock > 0
  // 2. Delivery price           — 5-week (Capsule Machine / Coffee Maker)
  //                               3-week (all other categories)
  // Computed fresh each render so it always reflects latest data + category
  const priceOptions = [
    // Option 1 — Regular (fast) delivery, only when stock is available
    ...(onlineStock > 0 && getPrimaryPrice(data) > 0
      ? [
          {
            key: "regular",
            label: "Regular Price",
            price: getPrimaryPrice(data),
            icon: <FaShippingFast className="text-green-600" />,
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            description: `Standard delivery (3–5 business days) — ${onlineStock} unit${onlineStock !== 1 ? "s" : ""} available`,
            delivery: "Fast Delivery",
          },
        ]
      : []),

    // Option 2 — Delivery price (category-driven)
    ...(showFiveWeekDelivery
      ? // Capsule Machine & Coffee Maker: 5-week only
        data.price5weeksDelivery > 0
        ? [
            {
              key: "5weeks",
              label: "5 Weeks Delivery",
              price: data.price5weeksDelivery,
              icon: <FaCalendarAlt className="text-red-600" />,
              color: "text-red-600",
              bgColor: "bg-red-50",
              borderColor: "border-red-200",
              description: "Special order — Delivery in approximately 5 weeks",
              delivery: "5 Week Special Order",
            },
          ]
        : []
      : // All other categories: 3-week only
        data.price3weeksDelivery > 0
        ? [
            {
              key: "3weeks",
              label: "3 Weeks Delivery",
              price: data.price3weeksDelivery,
              icon: <FaClock className="text-orange-600" />,
              color: "text-orange-600",
              bgColor: "bg-orange-50",
              borderColor: "border-orange-200",
              description: "Special order — Delivery in approximately 3 weeks",
              delivery: "3 Week Special Order",
            },
          ]
        : []),
  ];

  // Auto-select first available option when stock/prices/category change
  useEffect(() => {
    if (
      priceOptions.length > 0 &&
      !priceOptions.find((opt) => opt.key === selectedPriceOption)
    ) {
      setSelectedPriceOption(priceOptions[0].key);
    }
  }, [
    onlineStock,
    data.price,
    data.btcPrice,
    data.price3weeksDelivery,
    data.price5weeksDelivery,
    showFiveWeekDelivery,
  ]);

  // ─────────────────────────────────────────────────────────────────────────

  const handleAddToCart = async () => {
    try {
      setCartLoading(true);
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

      const response = await Axios({
        ...SummaryApi.addTocart,
        data: {
          productId: data._id,
          quantity: 1,
          priceOption: priceOptionToUse,
        },
      });

      if (response.data.success) {
        toast.success("Added to cart");
        fetchCartItem();
        window.dispatchEvent(new CustomEvent("cart-updated"));
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setCartLoading(false);
    }
  };

  const handleIncreaseQty = async () => {
    try {
      setCartLoading(true);
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
      setCartLoading(false);
    }
  };

  const handleDecreaseQty = async () => {
    try {
      setCartLoading(true);
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
          if (response.success) toast.success("Quantity updated");
        }
        window.dispatchEvent(new CustomEvent("cart-updated"));
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setCartLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars)
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      else if (i === fullStars + 1 && hasHalf)
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      else stars.push(<FaRegStar key={i} className="text-gray-300" />);
    }
    return stars;
  };

  // Image magnifier handlers
  const handleMouseEnter = (e) => {
    const { width, height } = e.currentTarget.getBoundingClientRect();
    setImgSize({ width, height });
    setShowMagnifier(true);
  };

  const handleMouseMove = (e) => {
    const { top, left } = e.currentTarget.getBoundingClientRect();
    const x = e.pageX - left - window.pageXOffset;
    const y = e.pageY - top - window.pageYOffset;
    setMagnifierPosition({ x, y });
  };

  const handleMouseLeave = () => setShowMagnifier(false);

  const currentQty = priceOptionQuantities[selectedPriceOption] || 0;
  const isInCart = currentQty > 0;

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600" />
      </div>
    );
  }

  const magnifierHeight = 350;
  const magnifierWidth = 350;
  const zoomLevel = 3.5;

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto p-4 pt-8">
        {/* ── Breadcrumb ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-500">
            Home / {data.productType?.toLowerCase() || "Products"} / {data.name}
          </div>
          {isAdmin && (
            <button
              onClick={() => setOpenEditModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition flex items-center"
            >
              <FaEdit className="mr-2" />
              Edit Product
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* ── Left Column — Images with Magnifier ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div
                className="h-96 flex items-center justify-center p-4 relative"
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={data.image[image]}
                  alt={data.name}
                  className="max-h-full object-contain"
                />

                {showMagnifier && (
                  <div
                    style={{
                      position: "absolute",
                      pointerEvents: "none",
                      height: `${magnifierHeight}px`,
                      width: `${magnifierWidth}px`,
                      top: `${magnifierPosition.y - magnifierHeight / 2}px`,
                      left: `${magnifierPosition.x + 20}px`,
                      border: "2px solid rgba(0,0,0,0.1)",
                      backgroundColor: "white",
                      backgroundImage: `url('${data.image[image]}')`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: `${imgSize.width * zoomLevel}px ${imgSize.height * zoomLevel}px`,
                      backgroundPositionX: `${-magnifierPosition.x * zoomLevel + magnifierWidth / 2}px`,
                      backgroundPositionY: `${-magnifierPosition.y * zoomLevel + magnifierHeight / 2}px`,
                      borderRadius: "8px",
                      boxShadow: "0 8px 16px rgba(0,0,0,0.25)",
                      zIndex: 1000,
                      transition: "background-position 0.05s ease-out",
                    }}
                  />
                )}
              </div>
            </div>

            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                {data.image.map((img, index) => (
                  <div
                    key={`thumb-${index}`}
                    onClick={() => setImage(index)}
                    className={`cursor-pointer border-2 rounded p-1 min-w-20 h-20 ${
                      index === image ? "border-green-600" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${data.name} - view ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Column — Product Info ── */}
          <div className="space-y-6">
            {/* Brand & Title */}
            <div>
              {data.brand && data.brand[0] && (
                <div className="flex items-center mb-1">
                  <p className="text-green-700 text-sm font-medium uppercase mr-2">
                    {data.brand[0].name}
                  </p>
                  <img
                    src={data.brand[0].image}
                    className="w-12"
                    alt={data.brand[0].name}
                  />
                </div>
              )}
              <h1 className="text-3xl font-bold text-gray-800 capitalize">
                {data.name}
              </h1>
              {data.sku && (
                <p className="text-sm text-gray-500 mt-1">SKU: {data.sku}</p>
              )}
              {data.featured && (
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-2">
                  Featured Product
                </span>
              )}
              <div className="flex items-center mt-2">
                <div className="flex mr-2">
                  {renderStars(data.averageRating)}
                </div>
                <span className="text-sm text-gray-500">
                  {data.averageRating.toFixed(1)} ({data.ratings.length}{" "}
                  reviews)
                </span>
              </div>
            </div>

            {data.shortDescription && (
              <p className="text-gray-600">{data.shortDescription}</p>
            )}

            {/* ── Pricing / Availability section ── */}
            {!data.productAvailability ? (
              // Product marked as unavailable by admin
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <FaSadTear className="text-yellow-600 text-3xl mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Not Available
                </h3>
                <p className="text-yellow-700 mb-4">
                  This product is currently not available for purchase. You can
                  request to be notified when it becomes available.
                </p>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-md transition"
                >
                  Request Notification
                </button>
              </div>
            ) : priceOptions.length > 0 ? (
              // Product has pricing options
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Choose Delivery Option
                  </h3>
                  {/* Delivery mode badge */}
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 ${
                      showFiveWeekDelivery
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-orange-50 text-orange-700 border border-orange-200"
                    }`}
                  >
                    {showFiveWeekDelivery ? (
                      <>
                        <FaCalendarAlt className="w-3 h-3" />
                        Up to 5 weeks
                      </>
                    ) : (
                      <>
                        <FaClock className="w-3 h-3" />
                        Up to 3 weeks
                      </>
                    )}
                  </span>
                </div>

                <div className="space-y-3">
                  {priceOptions.map((option) => {
                    const optionQty = priceOptionQuantities[option.key] || 0;
                    return (
                      <div
                        key={option.key}
                        className={`block p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedPriceOption === option.key
                            ? `${option.borderColor} ${option.bgColor}`
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedPriceOption(option.key)}
                      >
                        <label className="cursor-pointer">
                          <input
                            type="radio"
                            name="priceOption"
                            value={option.key}
                            checked={selectedPriceOption === option.key}
                            onChange={(e) =>
                              setSelectedPriceOption(e.target.value)
                            }
                            className="sr-only"
                          />
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {option.icon}
                              <div className="text-sm text-gray-600">
                                {option.description}
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-xl font-bold ${option.color}`}
                              >
                                {formatPrice(
                                  pricewithDiscount(
                                    option.price,
                                    data.discount,
                                  ),
                                )}
                              </div>
                              {data.discount > 0 && (
                                <div className="text-sm text-gray-500 line-through">
                                  {formatPrice(option.price)}
                                </div>
                              )}
                            </div>
                          </div>
                        </label>

                        {/* Qty controls — shown inline on the selected option when in cart */}
                        {optionQty > 0 &&
                          selectedPriceOption === option.key && (
                            <div className="mt-3 flex items-center justify-center bg-white rounded-md border border-gray-300">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDecreaseQty();
                                }}
                                disabled={cartLoading}
                                className="bg-green-700 hover:bg-green-800 text-white p-2 rounded-l-md transition"
                              >
                                <FaMinus className="text-sm" />
                              </button>
                              <div className="flex-1 py-2 px-4 font-semibold text-center">
                                {cartLoading ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-green-700 mx-auto" />
                                ) : (
                                  `${optionQty} in cart`
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleIncreaseQty();
                                }}
                                disabled={cartLoading}
                                className="bg-green-700 hover:bg-green-800 text-white p-2 rounded-r-md transition"
                              >
                                <FaPlus className="text-sm" />
                              </button>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>

                {/* Add to Cart — only shown when selected option is not already in cart */}
                {!isInCart && (
                  <button
                    onClick={handleAddToCart}
                    disabled={cartLoading}
                    className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-3 px-6 rounded-md transition flex items-center justify-center"
                  >
                    {cartLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
                    ) : (
                      <>
                        <BsCart4 className="mr-2" />
                        Add to Cart
                      </>
                    )}
                  </button>
                )}

                {/* Stock status */}
                <div className="flex items-center text-sm">
                  {onlineStock > 0 ? (
                    <>
                      <span className="text-green-600">In Stock</span>
                      <span className="ml-2 text-gray-500">
                        ({onlineStock} unit{onlineStock !== 1 ? "s" : ""}{" "}
                        available)
                      </span>
                    </>
                  ) : (
                    <span className="text-orange-600">
                      Available on special order
                    </span>
                  )}
                </div>

                {data.discount > 0 && (
                  <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium inline-block">
                    {data.discount}% OFF — Save{" "}
                    {formatPrice(
                      (getSelectedPrice(selectedPriceOption) * data.discount) /
                        100,
                    )}
                  </div>
                )}
              </div>
            ) : (
              // No pricing options at all
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <FaSadTear className="text-gray-400 text-3xl mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Pricing Unavailable
                </h3>
                <p className="text-gray-600 mb-4">
                  Pricing information for this product is currently unavailable.
                  Please contact us for more details.
                </p>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md transition"
                >
                  Request Information
                </button>
              </div>
            )}

            {/* ── Coffee attributes ── */}
            {data.productType === "COFFEE" && (
              <div className="bg-gray-50 p-4 rounded-lg grid md:grid-cols-2 gap-4">
                {data.weight > 0 && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Weight</span>
                    <span className="font-medium">
                      {data.weight} {data.unit}
                    </span>
                  </div>
                )}
                {data.packaging && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Packaging</span>
                    <span className="font-medium">{data.packaging}</span>
                  </div>
                )}
                {data.blend && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Blend</span>
                    <span className="font-medium">{data.blend}</span>
                  </div>
                )}
                {data.coffeeOrigin && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Origin</span>
                    <span className="font-medium">{data.coffeeOrigin}</span>
                  </div>
                )}
                {data.roastOrigin && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Roast Origin</span>
                    <span className="font-medium">{data.roastOrigin}</span>
                  </div>
                )}
                {data.aromaticProfile && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Profile</span>
                    <span className="font-medium">{data.aromaticProfile}</span>
                  </div>
                )}
                {data.roastLevel && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Roast Level</span>
                    <RoastIndicator level={data.roastLevel} />
                  </div>
                )}
                {data.intensity && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Intensity</span>
                    <IntensityMeter intensity={data.intensity} />
                  </div>
                )}
              </div>
            )}

            {/* ── Trust badges ── */}
            <div className="grid grid-cols-3 gap-4 border-t border-b py-4">
              <div className="flex flex-col items-center text-center">
                <FaTruck className="text-green-700 text-2xl mb-2" />
                <span className="text-sm font-medium">Fast Delivery</span>
                <span className="text-xs text-gray-500">Multiple Options</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <FaShieldAlt className="text-green-700 text-2xl mb-2" />
                <span className="text-sm font-medium">Quality Guarantee</span>
                <span className="text-xs text-gray-500">
                  100% Original Products
                </span>
              </div>
              <div className="flex flex-col items-center text-center">
                <FaLeaf className="text-green-700 text-2xl mb-2" />
                <span className="text-sm font-medium">Sustainably Sourced</span>
                <span className="text-xs text-gray-500">
                  Eco-friendly options
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Product Details Tabs ── */}
        <div className="mt-12">
          <div className="border-b">
            <div className="flex flex-wrap -mb-px">
              <button
                className={`inline-block p-4 font-medium text-sm border-b-2 ${
                  activeTab === "description"
                    ? "border-green-700 text-green-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("description")}
              >
                Description
              </button>
              {data.additionalInfo && data.additionalInfo.trim() !== "" && (
                <button
                  className={`inline-block p-4 font-medium text-sm border-b-2 ${
                    activeTab === "additionalInfo"
                      ? "border-green-700 text-green-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("additionalInfo")}
                >
                  Additional Information
                </button>
              )}
              <button
                className={`inline-block p-4 font-medium text-sm border-b-2 ${
                  activeTab === "reviews"
                    ? "border-green-700 text-green-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews ({data.ratings.length})
              </button>
            </div>
          </div>

          <div className="py-6">
            {activeTab === "description" && (
              <div className="prose max-w-none grid md:grid-cols-2 gap-6">
                <div dangerouslySetInnerHTML={{ __html: data.description }} />
                {data.more_details &&
                  Object.keys(data.more_details).length > 0 && (
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="divide-y divide-gray-200">
                        {Object.keys(data.more_details).map((key) => (
                          <tr key={key}>
                            <td className="py-3 px-4 text-sm text-gray-500">
                              {key}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {data.more_details[key]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
              </div>
            )}

            {activeTab === "additionalInfo" && data.additionalInfo && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Product Details</h3>
                  <div
                    dangerouslySetInnerHTML={{ __html: data.additionalInfo }}
                  />
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <RatingReviewComponent
                productId={productId}
                onRatingAdded={fetchProductDetails}
              />
            )}
          </div>
        </div>

        {/* ── Related Products ── */}
        {data.relatedProducts && data.relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <p className="text-gray-500">
              Related products component would be rendered here
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showRequestModal && (
        <ProductRequestModal
          product={data}
          onClose={() => setShowRequestModal(false)}
          isDiscontinued={!data.productAvailability}
        />
      )}

      {openEditModal && isAdmin && (
        <EditProductAdmin
          data={data}
          close={() => setOpenEditModal(false)}
          fetchProductData={fetchProductDetails}
        />
      )}
    </div>
  );
};

export default ProductDisplayPage;
