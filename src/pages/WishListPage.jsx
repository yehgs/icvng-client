import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { DisplayPriceInNaira } from "../utils/DisplayPriceInNaira";
import { pricewithDiscount } from "../utils/PriceWithDiscount";
import { valideURLConvert } from "../utils/valideURLConvert";
import { updateWishlistCount } from "../utils/eventUtils";
import {
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const user = useSelector((state) => state.user);
  const isLoggedIn = Boolean(user?._id);

  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist();
    } else {
      // Load from localStorage for non-logged-in users
      const localWishlist = JSON.parse(
        localStorage.getItem("wishlist") || "[]"
      );
      setWishlistItems(localWishlist);
      setLoading(false);
    }
  }, [isLoggedIn]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getWishlist,
      });

      const { data: responseData } = response;
      if (responseData.success) {
        setWishlistItems(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Add to cart handler with automatic removal from wishlist
  const handleAddToCart = async (product) => {
    if (!product.productAvailability) {
      toast.error("This product is not available");
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
          toast.success(responseData.message || "Product added to cart");

          // ✅ CRITICAL: Trigger multiple events to update cart everywhere
          window.dispatchEvent(new CustomEvent("cart-updated"));
          window.dispatchEvent(new Event("storage")); // For cross-tab updates

          // ✅ Small delay to ensure backend updates before removing from wishlist
          setTimeout(async () => {
            await removeFromWishlist(product._id);
          }, 100);
        }
      } else {
        // For guest users, add to localStorage cart
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");

        // Check if product already in cart
        const existingItemIndex = guestCart.findIndex(
          (item) => item.productId === product._id
        );

        if (existingItemIndex !== -1) {
          // Update quantity
          guestCart[existingItemIndex].quantity += 1;
          toast.success("Product quantity updated in cart");
        } else {
          // Add new item with proper structure
          guestCart.push({
            productId: product._id,
            quantity: 1,
            name: product.name,
            image: product.image,
            btcPrice: product.btcPrice || product.price || 0,
            price3weeksDelivery: product.price3weeksDelivery || 0,
            price5weeksDelivery: product.price5weeksDelivery || 0,
            discount: product.discount || 0,
            productAvailability: product.productAvailability,
            sku: product.sku,
            productType: product.productType,
            weight: product.weight,
            priceOption: "regular", // Default price option
          });
          toast.success("Product added to cart");
        }

        localStorage.setItem("guestCart", JSON.stringify(guestCart));

        // Trigger cart update event
        window.dispatchEvent(new CustomEvent("cart-updated"));

        // ✅ Remove from wishlist after successful add to cart
        await removeFromWishlist(product._id);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product._id]: false }));
    }
  };

  // Add all to cart
  const handleAddAllToCart = async () => {
    if (wishlistItems.length === 0) return;

    setLoading(true);
    try {
      // Only filter out discontinued items
      const availableItems = wishlistItems.filter(
        (item) => item.productAvailability
      );

      if (availableItems.length === 0) {
        toast.error("No available items to add to cart");
        setLoading(false);
        return;
      }

      if (isLoggedIn) {
        // Add all available items to cart one by one via API
        let successCount = 0;
        for (const item of availableItems) {
          try {
            await Axios({
              ...SummaryApi.addTocart,
              data: {
                productId: item._id,
                quantity: 1,
              },
            });
            successCount++;
          } catch (error) {
            console.error(`Failed to add ${item.name} to cart:`, error);
          }
        }

        toast.success(`Added ${successCount} items to cart`);
        window.dispatchEvent(new CustomEvent("cart-updated"));

        // ✅ Clear wishlist after adding all to cart
        await handleClearWishlist(true); // Pass true to skip confirmation
      } else {
        // For guest users, add all to localStorage
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        let addedCount = 0;

        availableItems.forEach((item) => {
          const existingItemIndex = guestCart.findIndex(
            (cartItem) => cartItem.productId === item._id
          );

          if (existingItemIndex !== -1) {
            guestCart[existingItemIndex].quantity += 1;
          } else {
            guestCart.push({
              productId: item._id,
              quantity: 1,
              name: item.name,
              image: item.image,
              btcPrice: item.btcPrice || item.price || 0,
              price3weeksDelivery: item.price3weeksDelivery || 0,
              price5weeksDelivery: item.price5weeksDelivery || 0,
              discount: item.discount || 0,
              productAvailability: item.productAvailability,
              sku: item.sku,
              productType: item.productType,
              weight: item.weight,
              priceOption: "regular",
            });
            addedCount++;
          }
        });

        localStorage.setItem("guestCart", JSON.stringify(guestCart));
        toast.success(`Added ${addedCount} items to cart`);
        window.dispatchEvent(new CustomEvent("cart-updated"));

        // ✅ Clear wishlist after adding all to cart
        await handleClearWishlist(true); // Pass true to skip confirmation
      }
    } catch (error) {
      toast.error("Failed to add all items to cart");
    } finally {
      setLoading(false);
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
    if (isLoggedIn) {
      try {
        const response = await Axios({
          ...SummaryApi.removeFromWishlist,
          data: { productId },
        });

        const { data: responseData } = response;
        if (responseData.success) {
          setWishlistItems((prev) =>
            prev.filter((item) => item._id !== productId)
          );
          toast.success("Product removed from wishlist");

          // Update header count using event utils
          updateWishlistCount();
        }
      } catch (error) {
        AxiosToastError(error);
      }
    } else {
      // Handle localStorage for non-logged-in users
      const updatedList = wishlistItems.filter(
        (item) => item._id !== productId
      );
      setWishlistItems(updatedList);
      localStorage.setItem("wishlist", JSON.stringify(updatedList));
      toast.success("Product removed from wishlist");

      // Update header count using event utils
      updateWishlistCount();
    }
  };

  // Clear wishlist with confirmation
  const handleClearWishlist = async (skipConfirmation = false) => {
    if (
      !skipConfirmation &&
      !window.confirm("Are you sure you want to clear your wishlist?")
    ) {
      return;
    }

    if (isLoggedIn) {
      try {
        const response = await Axios({
          ...SummaryApi.clearWishlist,
        });

        const { data: responseData } = response;
        if (responseData.success) {
          setWishlistItems([]);
          if (!skipConfirmation) {
            toast.success("Wishlist cleared");
          }

          // Update header count using event utils
          updateWishlistCount();
        }
      } catch (error) {
        AxiosToastError(error);
      }
    } else {
      setWishlistItems([]);
      localStorage.setItem("wishlist", JSON.stringify([]));
      if (!skipConfirmation) {
        toast.success("Wishlist cleared");
      }

      // Update header count using event utils
      updateWishlistCount();
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
        <div className="flex space-x-4">
          {wishlistItems.length > 0 && (
            <>
              <button
                onClick={handleAddAllToCart}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                    Adding...
                  </span>
                ) : (
                  <>
                    <FaShoppingCart className="mr-2" />
                    Add All to Cart
                  </>
                )}
              </button>
              <button
                onClick={handleClearWishlist}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                <FaTrash className="mr-2" />
                Clear Wishlist
              </button>
            </>
          )}
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <FaRegHeart className="text-gray-400 text-5xl" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Add products to your wishlist by clicking the heart icon on
              product cards.
            </p>
            <Link
              to="/shop"
              className="px-6 py-3 bg-green-700 text-white rounded-md hover:bg-green-800 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {wishlistItems.map((item) => {
                    const productUrl = `/product/${valideURLConvert(
                      item.name
                    )}-${item._id}`;
                    const price = pricewithDiscount(
                      item.btcPrice || item.price || 0,
                      item.discount || 0
                    );
                    const isAvailable = item.productAvailability;

                    return (
                      <tr key={item._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-16 w-16 mr-4">
                              <img
                                className="h-16 w-16 object-contain"
                                src={
                                  item.image && item.image.length > 0
                                    ? item.image[0]
                                    : "/api/placeholder/100/100"
                                }
                                alt={item.name}
                              />
                            </div>
                            <div>
                              <Link
                                to={productUrl}
                                className="text-sm font-medium text-gray-900 hover:text-green-700"
                              >
                                {item.name}
                              </Link>
                              {item.sku && (
                                <p className="text-xs text-gray-500 mt-1">
                                  SKU: {item.sku}
                                </p>
                              )}
                              {item.productType && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {item.productType
                                    .replace("_", " ")
                                    .toLowerCase()
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {DisplayPriceInNaira(price)}
                          </div>
                          {Boolean(item.discount) && (
                            <div className="text-xs text-gray-500 line-through">
                              {DisplayPriceInNaira(
                                item.btcPrice || item.price || 0
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              isAvailable
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {isAvailable ? "Available" : "Discontinued"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => handleAddToCart(item)}
                              disabled={!isAvailable || addingToCart[item._id]}
                              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md 
                                ${
                                  isAvailable
                                    ? "bg-green-700 text-white hover:bg-green-800"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                } transition`}
                            >
                              {addingToCart[item._id] ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-white"></div>
                              ) : (
                                <>
                                  <FaShoppingCart className="mr-1" />
                                  Add to Cart
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => removeFromWishlist(item._id)}
                              className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-700 hover:text-red-500 transition"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Related Products Section - Optional */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              You may also like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Recommended products would appear here */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
