import { createContext, useContext, useEffect, useState } from 'react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { useDispatch, useSelector } from 'react-redux';
import { handleAddItemCart } from '../store/cartProduct';
import AxiosToastError from '../utils/AxiosToastError';
import toast from 'react-hot-toast';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
import { handleAddAddress } from '../store/addressSlice';
import { setOrder } from '../store/orderSlice';

export const GlobalContext = createContext(null);

export const useGlobalContext = () => useContext(GlobalContext);

// Wishlist context and functions
export const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within GlobalProvider');
  }
  return context;
};

const GlobalProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [totalPrice, setTotalPrice] = useState(0);
  const [notDiscountTotalPrice, setNotDiscountTotalPrice] = useState(0);
  const [totalQty, setTotalQty] = useState(0);
  const cartItem = useSelector((state) => state.cartItem.cart);
  const user = useSelector((state) => state?.user);

  // Wishlist state
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  // Cart functions
  const fetchCartItem = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getCartItem,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(handleAddItemCart(responseData.data));
        console.log(responseData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateCartItem = async (id, qty) => {
    try {
      const response = await Axios({
        ...SummaryApi.updateCartItemQty,
        data: {
          _id: id,
          qty: qty,
        },
      });
      const { data: responseData } = response;

      if (responseData.success) {
        // toast.success(responseData.message)
        fetchCartItem();
        return responseData;
      }
    } catch (error) {
      AxiosToastError(error);
      return error;
    }
  };

  const deleteCartItem = async (cartId) => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteCartItem,
        data: {
          _id: cartId,
        },
      });
      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        fetchCartItem();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  // Wishlist functions
  // Load wishlist from localStorage on initial render
  const loadWishlist = () => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      const initialWishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
      setWishlistItems(initialWishlist);
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
      setWishlistItems([]);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Check if a product is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item._id === productId);
  };

  // Add product to wishlist
  const addToWishlist = (product) => {
    if (!isInWishlist(product._id)) {
      setWishlistItems((prev) => [...prev, product]);
      return true;
    }
    return false;
  };

  // Remove product from wishlist
  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
    return true;
  };

  // Toggle product in wishlist
  const toggleWishlist = (product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      return false; // Removed from wishlist
    } else {
      addToWishlist(product);
      return true; // Added to wishlist
    }
  };

  // Clear all wishlist items
  const clearWishlist = () => {
    setWishlistItems([]);
  };

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (!wishlistLoading) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, wishlistLoading]);

  useEffect(() => {
    const qty = cartItem.reduce((preve, curr) => {
      return preve + curr.quantity;
    }, 0);
    setTotalQty(qty);

    const tPrice = cartItem.reduce((preve, curr) => {
      const priceAfterDiscount = pricewithDiscount(
        curr?.productId?.price,
        curr?.productId?.discount
      );

      return preve + priceAfterDiscount * curr.quantity;
    }, 0);
    setTotalPrice(tPrice);

    const notDiscountPrice = cartItem.reduce((preve, curr) => {
      return preve + curr?.productId?.price * curr.quantity;
    }, 0);
    setNotDiscountTotalPrice(notDiscountPrice);
  }, [cartItem]);

  const handleLogoutOut = () => {
    localStorage.clear();
    dispatch(handleAddItemCart([]));
    setWishlistItems([]); // Clear wishlist on logout
  };

  const fetchAddress = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getAddress,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(handleAddAddress(responseData.data));
      }
    } catch (error) {
      // AxiosToastError(error)
    }
  };

  const fetchOrder = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getOrderItems,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(setOrder(responseData.data));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCartItem();
    loadWishlist(); // Load wishlist on initial render
    fetchAddress();
    fetchOrder();
  }, []);

  useEffect(() => {
    if (user && !user._id) {
      handleLogoutOut();
    }
  }, [user]);

  // Wishlist context value
  const wishlistContextValue = {
    wishlistItems,
    wishlistCount: wishlistItems.length,
    loading: wishlistLoading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
  };

  // Global context value
  const globalContextValue = {
    fetchCartItem,
    updateCartItem,
    deleteCartItem,
    fetchAddress,
    totalPrice,
    totalQty,
    notDiscountTotalPrice,
    fetchOrder,
  };

  return (
    <GlobalContext.Provider value={globalContextValue}>
      <WishlistContext.Provider value={wishlistContextValue}>
        {children}
      </WishlistContext.Provider>
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
