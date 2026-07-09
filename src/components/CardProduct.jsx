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
import AuthModal from "./AuthModel";
import { isFiveWeekDeliveryCategory } from "../config/deliveryCategories";
import { useEntityTranslation } from "../hooks/useEntityTranslation.js";
import { useCountry } from "../context/CountryContext";

const CardProduct = ({ data }) => {
  // Merge server-side translations (FR/IT) over the English source data
  const translatedData = useEntityTranslation("product", data._id, data);
  const { t } = useCountry();
  const url = `/product/${valideURLConvert(data.name)}-${data._id}`;
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPriceOption, setSelectedPriceOption] = useState("regular");
  const [quickCartLoading, setQuickCartLoading] = useState(false);

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
  const showFiveWeekDelivery = isFiveWeekDeliveryCategory(data.category);

  const getPrimaryPrice = (product) =>
    product.btcPrice && product.btcPrice > 0 ? product.btcPrice : product.price;

  // Sync cart quantities (server cart only — no guest cart)
  useEffect(() => {
    const quantities = { regular: 0, "3weeks": 0, "5weeks": 0 };
    const cartIds = { regular: null, "3weeks": null, "5weeks": null };

    if (isLoggedIn) {
      cartItem.forEach((item) => {
        if (item.productId?._id === data._id) {
          const option = item.priceOption || "regular";
          quantities[option] = item.quantity;
          cartIds[option] = item._id;
        }
      });
    }
    // Guest: show nothing in cart — they must log in first

    setPriceOptionQuantities(quantities);
    setPriceOptionCartIds(cartIds);
    if (!isLoggedIn) {
      guestCart.forEach((item) => {
        if (item.productId === data._id) {
          const option = item.priceOption || "regular";
          quantities[option] = item.quantity;
        }
      });
    }
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

  const getPricingOptions = () => {
    const options = [];
    const primaryPrice = getPrimaryPrice(data);
    const isPartnerProduct = data.partnerStock?.enabled === true;
    const partnerQty = data.partnerStock?.quantity || 0;

    // Regular / fast price:
    // Show if onlineStock > 0 (warehouse) OR if partner product with stock
    // Hide if no physical stock available — don't reveal internal stock status to users
    const hasAvailableStock =
      onlineStock > 0 || (isPartnerProduct && partnerQty > 0);

    if (primaryPrice > 0 && hasAvailableStock) {
      options.push({
        price: primaryPrice,
        label: onlineStock > 0 ? t("product.oneToThreeDays") : t("product.specialOrder"),
        icon: <FaShippingFast className="w-3 h-3" />,
        color: "text-green-600",
        bgColor: "bg-green-50",
        key: "regular",
      });
    }

    if (showFiveWeekDelivery) {
      if (data.price5weeksDelivery > 0) {
        options.push({
          price: data.price5weeksDelivery,
          label: t("product.fiveWeeksDelivery"),
          icon: <FaCalendarAlt className="w-3 h-3" />,
          color: "text-red-600",
          bgColor: "bg-red-50",
          key: "5weeks",
        });
      }
    } else {
      if (data.price3weeksDelivery > 0) {
        options.push({
          price: data.price3weeksDelivery,
          // NOTE: shown to shoppers as "2 weeks" while the backend field/key
          // remains price3weeksDelivery/"3weeks" — display label only, the
          // underlying delivery-window business logic is untouched.
          label: t("product.twoWeeksDelivery"),
          icon: <FaClock className="w-3 h-3" />,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          key: "3weeks",
        });
      }
    }
    return options;
  };

  useEffect(() => {
    const options = getPricingOptions();
    if (
      options.length > 0 &&
      !options.find((opt) => opt.key === selectedPriceOption)
    ) {
      setSelectedPriceOption(options[0].key);
    }
  }, [
    onlineStock,
    data.price,
    data.btcPrice,
    data.price3weeksDelivery,
    data.price5weeksDelivery,
    showFiveWeekDelivery,
  ]);

  const handlePriceOptionSelect = (e, optionKey) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPriceOption(optionKey);
  };

  const handleQuickAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      const priceOptionToUse = selectedPriceOption || "regular";
      const selectedPrice = getSelectedPrice(priceOptionToUse);
      addToGuestCart({
        productId: data._id,
        quantity: 1,
        priceOption: priceOptionToUse,
        price: selectedPrice,
        selectedPrice,
        btcPrice: data.btcPrice,
        discount: data.discount || 0,
        name: data.name,
        image: data.image,
        price3weeksDelivery: data.price3weeksDelivery,
        price5weeksDelivery: data.price5weeksDelivery,
      });
      toast.success(t("product.addedToCart"));
      window.dispatchEvent(new CustomEvent("cart-updated"));
      return;
    }

    try {
      setQuickCartLoading(true);
      const priceOptionToUse = selectedPriceOption || "regular";
      const response = await Axios({
        ...SummaryApi.addTocart,
        data: {
          productId: data._id,
          quantity: 1,
          priceOption: priceOptionToUse,
        },
      });
      if (response.data.success) {
        toast.success(t("product.addedToCart"));
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
        toast.success(t("product.quantityUpdated"));
        window.dispatchEvent(new CustomEvent("cart-updated"));
        return;
      }
      const response = await updateCartItem(cartId, currentQty + 1);
      if (response?.success) {
        toast.success(t("product.quantityUpdated"));
        window.dispatchEvent(new CustomEvent("cart-updated"));
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
        if (currentQty === 1) removeFromGuestCart(data._id, currentPriceOption);
        else updateGuestCartItem(data._id, currentQty - 1, currentPriceOption);
        window.dispatchEvent(new CustomEvent("cart-updated"));
        return;
      }
      if (currentQty === 1) {
        await deleteCartItem(cartId);
        toast.success(t("product.removedFromCart"));
      } else {
        const response = await updateCartItem(cartId, currentQty - 1);
        if (response?.success) toast.success(t("product.quantityUpdated"));
      }
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setQuickCartLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const productUrl = window.location.origin + url;
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.name,
          text: `Check out: ${translatedData.name}`,
          url: productUrl,
        });
      } catch {
        copyToClipboard(productUrl);
      }
    } else {
      copyToClipboard(productUrl);
    }
  };

  const copyToClipboard = (productUrl) => {
    navigator.clipboard
      .writeText(productUrl)
      .then(() => toast.success(t("product.linkCopied")))
      .catch(() => toast.error(t("product.copyLinkFailed")));
  };

  const handleQuickCheckout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      // Guest: add to cart first, then show auth modal via cart drawer
      const currentPriceOption = selectedPriceOption || "regular";
      const hasItemInCart = priceOptionQuantities[currentPriceOption] > 0;
      if (!hasItemInCart) await handleQuickAddToCart(e);
      setShowAuthModal(true);
      return;
    }
    const currentPriceOption = selectedPriceOption || "regular";
    const hasItemInCart = priceOptionQuantities[currentPriceOption] > 0;
    if (!hasItemInCart) await handleQuickAddToCart(e);
    navigate("/checkout");
  };

  const pricingOptions = getPricingOptions();
  const badges = (() => {
    const b = [];
    if (data.blend)
      b.push({ label: data.blend, class: "bg-amber-50 text-amber-800" });
    if (data.coffeeOrigin)
      b.push({ label: data.coffeeOrigin, class: "bg-green-50 text-green-800" });
    return b.slice(0, 2);
  })();

  const getProductInfo = () => {
    const d = [];
    if (data.unit) d.push(data.unit);
    if (data.packaging) d.push(data.packaging);
    if (data.weight) d.push(`${data.weight}kg`);
    return d.join(" • ");
  };

  const formatProductType = (type) => {
    if (!type) return "";
    // Known enum values get a real translation; anything unrecognized
    // falls back to a simple title-cased version of the raw value.
    const key = `product.type.${type}`;
    const translated = t(key);
    if (translated && translated !== key) return translated;
    return type
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // A large batch of existing products were created by an older admin form
  // that pre-filled this field with the literal English string "Limited
  // Edition" as a DEFAULT (not a deliberate admin choice) — so it's almost
  // always set, and the "use the translated label" fallback below never
  // actually ran. Treat that exact legacy default as if it were unset.
  const rawBannerText = data.limitedEdition?.bannerText?.trim();
  const limitedEditionBannerText =
    rawBannerText && rawBannerText.toLowerCase() !== "limited edition"
      ? rawBannerText
      : t("product.limitedEdition");

  const currentQty = priceOptionQuantities[selectedPriceOption] || 0;
  const isInCart = currentQty > 0;

  return (
    <div className="group relative border hover:shadow-md transition-shadow duration-300 p-3 lg:p-4 flex flex-col rounded-lg cursor-pointer bg-white h-full">
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          fetchCartItem?.();
        }}
        mode="login"
        title={t("product.signInToAddToCart")}
        message="Create an account or sign in to add products to your cart."
      />

      {/* Floating Actions */}
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
              title={t("product.shareProduct")}
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
          {data.limitedEdition?.isLimitedEdition && (
            <span
              className="text-white px-2 py-0.5 text-xs font-medium rounded-full"
              style={{
                backgroundColor: data.limitedEdition?.bannerColor || "#c8102e",
              }}
            >
              {limitedEditionBannerText}
            </span>
          )}
          {data.featured && (
            <span className="text-white bg-yellow-500 px-2 py-0.5 text-xs font-medium rounded-full">
              {t("product.featured")}
            </span>
          )}
          {Boolean(data.discount) && (
            <span className="text-white bg-green-600 px-2 py-0.5 text-xs font-medium rounded-full">
              {data.discount}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Product Image */}
      <Link
        to={url}
        className="relative block h-36 w-full mb-3 flex items-center justify-center bg-gray-50 rounded-md overflow-hidden group-hover:opacity-95 transition-opacity"
      >
        {data.image && data.image.length > 0 ? (
          <img
            loading="lazy"
            decoding="async"
            src={data.image[0]}
            alt={translatedData.name}
            className="w-full h-full object-contain mix-blend-multiply p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        {onlineStock > 0 && (
          <div className="absolute bottom-1 right-1 bg-green-600 text-white text-xs px-2 py-1 rounded">
            {t("product.stock")}: {onlineStock}
          </div>
        )}
      </Link>

      {/* Product Name */}
      <Link to={url} className="block">
        <h3 className="font-medium text-gray-800 line-clamp-2 mb-1 hover:text-green-700 transition-colors">
          {translatedData.name}
        </h3>
      </Link>

      {data.sku && (
        <div className="text-xs text-gray-400 mb-1">SKU: {data.sku}</div>
      )}
      {data.producer && (
        <div className="text-xs text-gray-500 mb-1">
          by{" "}
          <span className="font-medium">{data.producer.name || "Brand"}</span>
        </div>
      )}

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

      <div className="text-xs text-gray-500 my-1">{getProductInfo()}</div>

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

      {/* Pricing Options */}
      {data.productAvailability && pricingOptions.length > 0 ? (
        <div className="space-y-2 mb-3">
          {pricingOptions.map((option) => (
            <div
              key={option.key}
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
          <p className="text-xs text-gray-500">{t("product.noDeliveryOptions")}</p>
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
            <span className="text-sm">{t("product.requestProduct")}</span>
          </button>
        ) : (
          <>
            {!isInCart ? (
              <button
                onClick={handleQuickAddToCart}
                disabled={quickCartLoading}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-3 rounded-md transition flex items-center justify-center"
              >
                {quickCartLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
                ) : (
                  <>
                    <BsCart4 className="mr-2" /> {t("product.addToCart")}
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center bg-green-50 border border-green-200 rounded-md">
                <button
                  onClick={handleQuickDecreaseQty}
                  disabled={quickCartLoading}
                  className="bg-green-700 hover:bg-green-800 text-white p-2 rounded-l-md flex items-center justify-center transition"
                >
                  <FaMinus className="text-sm" />
                </button>
                <div className="flex-1 py-2 px-3 bg-white font-semibold text-center">
                  {quickCartLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-green-700 mx-auto" />
                  ) : (
                    currentQty
                  )}
                </div>
                <button
                  onClick={handleQuickIncreaseQty}
                  disabled={quickCartLoading}
                  className="bg-green-700 hover:bg-green-800 text-white p-2 rounded-r-md flex items-center justify-center transition"
                >
                  <FaPlus className="text-sm" />
                </button>
              </div>
            )}
            <button
              onClick={handleQuickCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md transition flex items-center justify-center text-sm"
            >
              <FaShoppingCart className="mr-2" /> {t("product.quickCheckout")}
            </button>
          </>
        )}
      </div>

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
