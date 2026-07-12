import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { pricewithDiscount } from "../utils/PriceWithDiscount";
import { valideURLConvert } from "../utils/valideURLConvert";
import { updateCompareCount } from "../utils/eventUtils";
import { useCurrency } from "../provider/GlobalProvider";
import { useCountry } from "../context/CountryContext";
import {
  FaTimes,
  FaShoppingCart,
  FaHeart,
  FaShare,
  FaStar,
  FaCheck,
  FaInfoCircle,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";
import WishlistButton from "../components/WishlistButton";

const ComparePage = () => {
  const { t } = useCountry();
  const { formatPrice } = useCurrency();
  const [compareItems, setCompareItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const user = useSelector((state) => state.user);
  const isLoggedIn = Boolean(user?._id);

  useEffect(() => {
    if (isLoggedIn) {
      fetchCompareList();
    } else {
      toast.error(t('wishlist.signInToAddToCart'));
    }
  }, [isLoggedIn]);

  const fetchCompareList = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getCompareList,
      });

      const { data: responseData } = response;
      if (responseData.success) {
        setCompareItems(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Add to cart handler with automatic removal from compare list
  const handleAddToCart = async (product) => {
    if (!product.productAvailability) {
      toast.error(t('wishlist.productNotAvailable'));
      return;
    }

    try {
      setAddingToCart((prev) => ({ ...prev, [product._id]: true }));

      if (isLoggedIn) {
        // For logged-in users, use API
        const response = await Axios({
          ...SummaryApi.addTocart,
          data: {
            productId: product._id,
            quantity: 1,
          },
        });

        const { data: responseData } = response;

        if (responseData.success) {
          toast.success(responseData.message || t('wishlist.productAddedToCart'));

          // ✅ CRITICAL: Trigger multiple events to update cart everywhere
          window.dispatchEvent(new CustomEvent("cart-updated"));
          window.dispatchEvent(new Event("storage")); // For cross-tab updates

          // ✅ Small delay to ensure backend updates before removing from compare
          setTimeout(async () => {
            await removeFromCompare(product._id);
          }, 100);
        }
      } else {
        toast.error(t('wishlist.signInToAddToCart'));
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product._id]: false }));
    }
  };

  const removeFromCompare = async (productId) => {
    if (isLoggedIn) {
      try {
        const response = await Axios({
          ...SummaryApi.removeFromCompare,
          data: { productId },
        });

        const { data: responseData } = response;
        if (responseData.success) {
          setCompareItems((prev) =>
            prev.filter((item) => item._id !== productId)
          );
          toast.success(t('compare.productRemoved'));

          // Update header count using event utils
          updateCompareCount();
        }
      } catch (error) {
        AxiosToastError(error);
      }
    } else {
      // Handle localStorage for non-logged-in users
      const updatedList = compareItems.filter((item) => item._id !== productId);
      setCompareItems(updatedList);
      localStorage.setItem("compareList", JSON.stringify(updatedList));
      toast.success(t('compare.productRemoved'));

      // Update header count using event utils
      updateCompareCount();
    }
  };

  const clearCompareList = async () => {
    if (window.confirm(t('compare.confirmClear'))) {
      if (isLoggedIn) {
        try {
          const response = await Axios({
            ...SummaryApi.clearCompareList,
          });

          const { data: responseData } = response;
          if (responseData.success) {
            setCompareItems([]);
            toast.success(t('compare.cleared'));

            // Update header count using event utils
            updateCompareCount();
          }
        } catch (error) {
          AxiosToastError(error);
        }
      } else {
        setCompareItems([]);
        localStorage.setItem("compareList", JSON.stringify([]));
        toast.success(t('compare.cleared'));

        // Update header count using event utils
        updateCompareCount();
      }
    }
  };

  // Get comparison attributes
  const getComparisonAttributes = () => {
    if (compareItems.length === 0) return [];

    const attributes = [
      {
        key: "price",
        label: t('compare.regularPrice'),
        type: "price",
        priceKey: "btcPrice",
      },
      { key: "price3weeksDelivery", label: t('compare.twoWeeksPrice'), type: "price" },
      { key: "price5weeksDelivery", label: t('compare.fiveWeeksPrice'), type: "price" },
      { key: "discount", label: t('compare.discount'), type: "percentage" },
      { key: "weight", label: t('compare.weight'), type: "text" },
      { key: "packaging", label: t('compare.packaging'), type: "text" },
      { key: "productType", label: t('compare.productType'), type: "text" },
      { key: "roastLevel", label: t('compare.roastLevel'), type: "text" },
      { key: "intensity", label: t('compare.intensity'), type: "text" },
      { key: "blend", label: t('compare.blend'), type: "text" },
      { key: "coffeeOrigin", label: t('compare.coffeeOrigin'), type: "text" },
      { key: "aromaticProfile", label: t('compare.aromaticProfile'), type: "text" },
      { key: "averageRating", label: t('compare.rating'), type: "rating" },
      {
        key: "productAvailability",
        label: t('compare.availability'),
        type: "availability",
      },
    ];

    // Filter attributes that have values in at least one product
    return attributes.filter((attr) =>
      compareItems.some((item) => {
        const value = attr.priceKey ? item[attr.priceKey] : item[attr.key];
        return value && value !== "";
      })
    );
  };

  const renderAttributeValue = (item, attribute) => {
    const value = attribute.priceKey
      ? item[attribute.priceKey]
      : item[attribute.key];

    if (!value && value !== 0) return <span className="text-gray-400">-</span>;

    switch (attribute.type) {
      case "price":
        return (
          <div>
            <div className="font-semibold text-green-600">
              {formatPrice(
                pricewithDiscount(value, item.discount || 0)
              )}
            </div>
            {item.discount > 0 && (
              <div className="text-xs text-gray-500 line-through">
                {formatPrice(value)}
              </div>
            )}
          </div>
        );
      case "percentage":
        return value > 0 ? `${value}%` : "-";
      case "rating":
        return (
          <div className="flex items-center">
            <FaStar className="text-yellow-400 mr-1" />
            <span>{value.toFixed(1)}</span>
          </div>
        );
      case "availability":
        return (
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {value ? t('wishlist.available') : t('wishlist.discontinued')}
          </span>
        );
      case "number":
        return value;
      default:
        return value;
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('compare.title')}</h1>
        {compareItems.length > 0 && (
          <button
            onClick={clearCompareList}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition flex items-center"
          >
            <FaTimes className="mr-2" />
            {t('compare.clearAll')}
          </button>
        )}
      </div>

      {compareItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <FaInfoCircle className="text-gray-400 text-5xl" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {t('compare.noProducts')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('compare.noProductsMessage')}
            </p>
            <Link
              to="/shop"
              className="px-6 py-3 bg-green-700 text-white rounded-md hover:bg-green-800 transition"
            >
              {t('wishlist.continueShopping')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left font-medium text-gray-700 w-48">
                    {t('compare.productsCount', { count: compareItems.length })}
                  </th>
                  {compareItems.map((item) => (
                    <th key={item._id} className="p-4 text-center min-w-64">
                      <div className="relative">
                        <button
                          onClick={() => removeFromCompare(item._id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition z-10"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>

                        <div className="mb-3">
                          {item.image && item.image[0] ? (
                            <img
                              src={item.image[0]}
                              alt={item.name}
                              className="w-24 h-24 object-contain mx-auto mb-2 rounded"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gray-100 flex items-center justify-center mx-auto mb-2 rounded">
                              <span className="text-gray-400 text-xs">
                                {t('compare.noImage')}
                              </span>
                            </div>
                          )}

                          <Link
                            to={`/product/${valideURLConvert(item.name)}-${
                              item._id
                            }`}
                            className="text-sm font-medium text-gray-900 hover:text-green-700 line-clamp-2"
                          >
                            {item.name}
                          </Link>

                          {item.sku && (
                            <p className="text-xs text-gray-500 mt-1">
                              {t('productRequest.sku')}: {item.sku}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <WishlistButton
                            product={item}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs"
                          />

                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={
                              !item.productAvailability ||
                              addingToCart[item._id]
                            }
                            className={`${
                              item.productAvailability
                                ? "bg-green-700 hover:bg-green-800 text-white"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            } px-3 py-1 rounded text-xs flex items-center justify-center transition`}
                          >
                            {addingToCart[item._id] ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-white"></div>
                            ) : (
                              <>
                                <FaShoppingCart className="mr-1" />
                                {item.productAvailability
                                  ? t('product.addToCart')
                                  : t('wishlist.discontinued')}
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {getComparisonAttributes().map((attribute) => (
                  <tr key={attribute.key} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-700 bg-gray-50">
                      {attribute.label}
                    </td>
                    {compareItems.map((item) => (
                      <td key={item._id} className="p-4 text-center">
                        {renderAttributeValue(item, attribute)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Additional Information */}
      {compareItems.length > 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <FaInfoCircle className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                {t('compare.howToCompare')}
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• {t('compare.tip1')}</li>
                <li>• {t('compare.tip2')}</li>
                <li>• {t('compare.tip3')}</li>
                <li>• {t('compare.tip4')}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions for more products */}
      {compareItems.length > 0 && compareItems.length < 4 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t('compare.addMore')}
          </h2>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-4">
              {t('compare.addMoreMessage', { count: 4 - compareItems.length })}
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition"
            >
              {t('compare.browseProducts')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparePage;
