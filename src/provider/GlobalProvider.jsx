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

// Currency context
export const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within GlobalProvider');
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

  // Currency state
  const [selectedCurrency, setSelectedCurrency] = useState('NGN');
  const [exchangeRates, setExchangeRates] = useState({});
  const [currencyLoading, setCurrencyLoading] = useState(false);

  // Available currencies
  const availableCurrencies = [
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', isBase: true },
    { code: 'USD', name: 'US Dollar', symbol: '$', isBase: false },
    { code: 'EUR', name: 'Euro', symbol: '€', isBase: false },
    { code: 'GBP', name: 'British Pound', symbol: '£', isBase: false },
  ];

  // Get effective stock for a product
  const getEffectiveStock = (product) => {
    if (
      product.warehouseStock?.enabled &&
      product.warehouseStock.onlineStock !== undefined
    ) {
      return product.warehouseStock.onlineStock;
    }
    return product.stock || 0;
  };

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

  // Currency functions
  const fetchExchangeRates = async () => {
    try {
      setCurrencyLoading(true);
      const response = await Axios({
        ...SummaryApi.getExchangeRates,
        params: { baseCurrency: 'NGN' },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        const rates = {};
        responseData.data.forEach((rate) => {
          rates[rate.targetCurrency] = rate.rate;
        });
        // Add NGN to NGN rate
        rates['NGN'] = 1;
        setExchangeRates(rates);
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      // Set fallback rates
      setExchangeRates({
        NGN: 1,
        USD: 0.00217,
        EUR: 0.00185,
        GBP: 0.00159,
      });
    } finally {
      setCurrencyLoading(false);
    }
  };

  const convertPrice = (priceInNGN, targetCurrency = selectedCurrency) => {
    if (targetCurrency === 'NGN') return priceInNGN;
    const rate = exchangeRates[targetCurrency];
    if (!rate) return priceInNGN;
    return priceInNGN * rate;
  };

  const formatPrice = (price, currency = selectedCurrency) => {
    const convertedPrice = convertPrice(price, currency);
    const currencyData = availableCurrencies.find((c) => c.code === currency);

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'NGN' ? 0 : 2,
    }).format(convertedPrice);
  };

  const changeCurrency = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    localStorage.setItem('selectedCurrency', currencyCode);
  };

  // Get payment method based on currency
  const getPaymentMethod = (currency = selectedCurrency) => {
    return currency === 'NGN' ? 'flutterwave' : 'stripe';
  };

  // Wishlist functions
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

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item._id === productId);
  };

  const addToWishlist = (product) => {
    if (!isInWishlist(product._id)) {
      setWishlistItems((prev) => [...prev, product]);
      return true;
    }
    return false;
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
    return true;
  };

  const toggleWishlist = (product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      return false;
    } else {
      addToWishlist(product);
      return true;
    }
  };

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
    setWishlistItems([]);
    setSelectedCurrency('NGN');
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
    loadWishlist();
    fetchAddress();
    fetchOrder();
    fetchExchangeRates();

    // Load saved currency
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (
      savedCurrency &&
      availableCurrencies.some((c) => c.code === savedCurrency)
    ) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  useEffect(() => {
    if (user && !user._id) {
      handleLogoutOut();
    }
  }, [user]);

  // Fetch exchange rates periodically (every 30 minutes)
  useEffect(() => {
    const interval = setInterval(fetchExchangeRates, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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

  // Currency context value
  const currencyContextValue = {
    selectedCurrency,
    availableCurrencies,
    exchangeRates,
    currencyLoading,
    convertPrice,
    formatPrice,
    changeCurrency,
    getPaymentMethod,
    fetchExchangeRates,
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
    getEffectiveStock,
  };

  return (
    <GlobalContext.Provider value={globalContextValue}>
      <WishlistContext.Provider value={wishlistContextValue}>
        <CurrencyContext.Provider value={currencyContextValue}>
          {children}
        </CurrencyContext.Provider>
      </WishlistContext.Provider>
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
