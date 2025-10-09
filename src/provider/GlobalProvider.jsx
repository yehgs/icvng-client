//client
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

// Wishlist context
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
  const user = useSelector((state) => state?.user);
  const cartItem = useSelector((state) => state.cartItem.cart);

  // Core state
  const [totalPrice, setTotalPrice] = useState(0);
  const [notDiscountTotalPrice, setNotDiscountTotalPrice] = useState(0);
  const [totalQty, setTotalQty] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Guest cart state with improved management
  const [guestCart, setGuestCart] = useState([]);
  const [migrationInProgress, setMigrationInProgress] = useState(false);

  // Wishlist state
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  // Compare state
  const [compareItems, setCompareItems] = useState([]);
  const [compareLoading, setCompareLoading] = useState(true);

  // Currency state
  const [selectedCurrency, setSelectedCurrency] = useState('NGN');
  const [exchangeRates, setExchangeRates] = useState({
    NGN: 1,
    USD: 0.00217,
    EUR: 0.00185,
    GBP: 0.00159,
  });
  const [currencyLoading, setCurrencyLoading] = useState(false);

  // Available currencies
  const availableCurrencies = [
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', isBase: true },
    { code: 'USD', name: 'US Dollar', symbol: '$', isBase: false },
    { code: 'EUR', name: 'Euro', symbol: '€', isBase: false },
    { code: 'GBP', name: 'British Pound', symbol: '£', isBase: false },
  ];

  // Update login status when user changes
  useEffect(() => {
    const newLoginStatus = Boolean(user?._id);
    if (newLoginStatus !== isLoggedIn) {
      setIsLoggedIn(newLoginStatus);

      if (newLoginStatus && !migrationInProgress) {
        // User just logged in, migrate guest data
        migrateGuestDataToUser();
      }
    }
  }, [user?._id, isLoggedIn, migrationInProgress]);

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

  // ===== UTILITY FUNCTIONS =====
  const triggerCartUpdate = () => {
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  const triggerWishlistUpdate = () => {
    window.dispatchEvent(new CustomEvent('wishlist-updated'));
  };

  const triggerCompareUpdate = () => {
    window.dispatchEvent(new CustomEvent('compare-updated'));
  };

  // ===== GUEST CART FUNCTIONS =====
  const loadGuestCart = () => {
    try {
      const savedCart = localStorage.getItem('guestCart');
      const initialCart = savedCart ? JSON.parse(savedCart) : [];
      setGuestCart(initialCart);
      return initialCart;
    } catch (error) {
      console.error('Error loading guest cart:', error);
      setGuestCart([]);
      return [];
    }
  };

  const saveGuestCart = (cart) => {
    try {
      localStorage.setItem('guestCart', JSON.stringify(cart));
      setGuestCart(cart);
      triggerCartUpdate();
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  };

  const addToGuestCart = (productData) => {
    const existingItemIndex = guestCart.findIndex(
      (item) =>
        item.productId === productData.productId &&
        (item.priceOption || 'regular') ===
          (productData.priceOption || 'regular')
    );

    let updatedCart;
    if (existingItemIndex !== -1) {
      // Item with this price option exists, update quantity
      updatedCart = [...guestCart];
      updatedCart[existingItemIndex].quantity += productData.quantity;
    } else {
      // New item with this price option
      const itemToAdd = {
        ...productData,
        priceOption: productData.priceOption || 'regular',
      };
      updatedCart = [...guestCart, itemToAdd];
    }

    saveGuestCart(updatedCart);
  };

  const updateGuestCartItem = (
    productId,
    quantity,
    priceOption = 'regular'
  ) => {
    if (quantity <= 0) {
      removeFromGuestCart(productId, priceOption);
      return;
    }

    const updatedCart = guestCart.map((item) => {
      // Match by BOTH productId AND priceOption
      const matches =
        item.productId === productId &&
        (item.priceOption || 'regular') === priceOption;

      if (matches) {
        return { ...item, quantity };
      }
      return item;
    });

    saveGuestCart(updatedCart);
  };

  const removeFromGuestCart = (productId, priceOption = 'regular') => {
    const updatedCart = guestCart.filter((item) => {
      // Remove only items matching BOTH productId AND priceOption
      return !(
        item.productId === productId &&
        (item.priceOption || 'regular') === priceOption
      );
    });

    saveGuestCart(updatedCart);
  };

  const clearGuestCart = () => {
    localStorage.removeItem('guestCart');
    setGuestCart([]);
    triggerCartUpdate();
  };

  // ===== GUEST WISHLIST FUNCTIONS =====
  const loadWishlist = () => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      const initialWishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
      setWishlistItems(initialWishlist);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlistItems([]);
    } finally {
      setWishlistLoading(false);
    }
  };

  const saveWishlist = (wishlist) => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      setWishlistItems(wishlist);
      triggerWishlistUpdate();
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item._id === productId);
  };

  const addToWishlist = (product) => {
    if (!isInWishlist(product._id)) {
      const updatedWishlist = [...wishlistItems, product];
      saveWishlist(updatedWishlist);
      return true;
    }
    return false;
  };

  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlistItems.filter(
      (item) => item._id !== productId
    );
    saveWishlist(updatedWishlist);
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
    localStorage.removeItem('wishlist');
    setWishlistItems([]);
    triggerWishlistUpdate();
  };

  // ===== GUEST COMPARE FUNCTIONS =====
  const loadCompare = () => {
    try {
      const savedCompare = localStorage.getItem('compareList');
      const initialCompare = savedCompare ? JSON.parse(savedCompare) : [];
      setCompareItems(initialCompare);
    } catch (error) {
      console.error('Error loading compare list:', error);
      setCompareItems([]);
    } finally {
      setCompareLoading(false);
    }
  };

  const saveCompare = (compareList) => {
    try {
      localStorage.setItem('compareList', JSON.stringify(compareList));
      setCompareItems(compareList);
      triggerCompareUpdate();
    } catch (error) {
      console.error('Error saving compare list:', error);
    }
  };

  const isInCompare = (productId) => {
    return compareItems.some((item) => item._id === productId);
  };

  const addToCompare = (product) => {
    if (compareItems.length >= 4) {
      toast.error('You can only compare up to 4 products');
      return false;
    }

    if (!isInCompare(product._id)) {
      const updatedCompare = [...compareItems, product];
      saveCompare(updatedCompare);
      return true;
    }
    return false;
  };

  const removeFromCompare = (productId) => {
    const updatedCompare = compareItems.filter(
      (item) => item._id !== productId
    );
    saveCompare(updatedCompare);
    return true;
  };

  const toggleCompare = (product) => {
    if (isInCompare(product._id)) {
      removeFromCompare(product._id);
      return false;
    } else {
      return addToCompare(product);
    }
  };

  const clearCompare = () => {
    localStorage.removeItem('compareList');
    setCompareItems([]);
    triggerCompareUpdate();
  };

  // ===== MIGRATION FUNCTIONS =====
  const migrateGuestDataToUser = async () => {
    if (!isLoggedIn || migrationInProgress) return;

    try {
      setMigrationInProgress(true);
      const promises = [];

      // Migrate cart
      if (guestCart.length > 0) {
        promises.push(migrateGuestCart());
      }

      // Migrate wishlist
      if (wishlistItems.length > 0) {
        promises.push(migrateGuestWishlist());
      }

      // Migrate compare
      if (compareItems.length > 0) {
        promises.push(migrateGuestCompare());
      }

      // Execute all migrations
      if (promises.length > 0) {
        await Promise.allSettled(promises);

        // Refresh data after migration
        fetchCartItem();
        fetchWishlist();
        fetchCompare();
      }
    } catch (error) {
      console.error('Migration error:', error);
    } finally {
      setMigrationInProgress(false);
    }
  };

  const migrateGuestCart = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.migrateGuestCart,
        data: { guestCartItems: guestCart },
      });

      if (response.data.success) {
        clearGuestCart();
        toast.success(
          `${response.data.data.migratedCount} items migrated to your cart`
        );
      }
    } catch (error) {
      console.error('Cart migration error:', error);
    }
  };

  const migrateGuestWishlist = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.migrateGuestWishlist,
        data: { guestWishlistItems: wishlistItems },
      });

      if (response.data.success) {
        clearWishlist();
        toast.success(
          `${response.data.data.migratedCount} items migrated to your wishlist`
        );
      }
    } catch (error) {
      console.error('Wishlist migration error:', error);
    }
  };

  const migrateGuestCompare = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.migrateGuestCompare,
        data: { guestCompareItems: compareItems },
      });

      if (response.data.success) {
        clearCompare();
        toast.success(
          `${response.data.data.migratedCount} items migrated to your compare list`
        );
      }
    } catch (error) {
      console.error('Compare migration error:', error);
    }
  };

  // ===== CART FUNCTIONS =====
  const fetchCartItem = async () => {
    if (!isLoggedIn) {
      dispatch(handleAddItemCart([]));
      return;
    }

    try {
      const response = await Axios({
        ...SummaryApi.getCartItem,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(handleAddItemCart(responseData.data));
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const fetchWishlist = async () => {
    if (!isLoggedIn) return;

    try {
      const response = await Axios({
        ...SummaryApi.getWishlist,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        setWishlistItems(responseData.data);
        triggerWishlistUpdate();
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const fetchCompare = async () => {
    if (!isLoggedIn) return;

    try {
      const response = await Axios({
        ...SummaryApi.getCompareList,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        setCompareItems(responseData.data);
        triggerCompareUpdate();
      }
    } catch (error) {
      console.error('Error fetching compare list:', error);
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    if (!isLoggedIn) {
      // For guest users, update guest cart
      updateGuestCartItem(cartItemId, quantity);
      return { success: true };
    }

    if (quantity <= 0) {
      return deleteCartItem(cartItemId);
    }

    try {
      const response = await Axios({
        ...SummaryApi.updateCartItemQty,
        data: {
          _id: cartItemId,
          qty: quantity,
        },
      });
      const { data: responseData } = response;

      if (responseData.success) {
        fetchCartItem();
        triggerCartUpdate();
        return responseData;
      }
    } catch (error) {
      AxiosToastError(error);
      return error;
    }
  };

  const deleteCartItem = async (cartId) => {
    if (!isLoggedIn) {
      removeFromGuestCart(cartId);
      return { success: true };
    }

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
        triggerCartUpdate();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  // ===== CURRENCY FUNCTIONS =====
  const fetchExchangeRates = async () => {
    try {
      setCurrencyLoading(true);
      const response = await Axios({
        ...SummaryApi.getExchangeRates,
        params: { baseCurrency: 'NGN' },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        const rates = { NGN: 1 };
        responseData.data.forEach((rate) => {
          rates[rate.targetCurrency] = rate.rate;
        });
        setExchangeRates(rates);
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      // Keep default fallback rates
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

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'NGN' ? 0 : 2,
    }).format(convertedPrice);
  };

  const changeCurrency = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    localStorage.setItem('selectedCurrency', currencyCode);

    window.dispatchEvent(
      new CustomEvent('currency-changed', {
        detail: { currency: currencyCode },
      })
    );
  };

  const getPaymentMethod = (currency = selectedCurrency) => {
    return currency === 'NGN' ? 'paystack' : 'stripe';
  };

  // ===== OTHER FUNCTIONS =====
  const fetchAddress = async () => {
    if (!isLoggedIn) return;

    try {
      const response = await Axios({
        ...SummaryApi.getAddress,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(handleAddAddress(responseData.data));
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const fetchOrder = async () => {
    if (!isLoggedIn) return;

    try {
      const response = await Axios({
        ...SummaryApi.getOrderItems,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(setOrder(responseData.data));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleLogout = () => {
    // Don't preserve cart on logout anymore since we have proper migration
    localStorage.removeItem('accesstoken');
    localStorage.removeItem('refreshToken');
    dispatch(handleAddItemCart([]));

    // Don't clear guest data on logout - let user keep their guest items
    setMigrationInProgress(false);
    triggerCartUpdate();
    triggerWishlistUpdate();
    triggerCompareUpdate();
  };

  // ===== CALCULATE TOTALS =====
  const calculateTotals = () => {
    const currentCart = isLoggedIn ? cartItem : guestCart;

    let qty = 0;
    let tPrice = 0;
    let notDiscountPrice = 0;

    currentCart.forEach((item) => {
      const quantity = item.quantity || 0;
      qty += quantity;

      if (isLoggedIn && item.productId) {
        // Logged-in user cart - use selectedPrice from backend
        const price = item.selectedPrice || item.productId.price;
        tPrice += price * quantity;

        // Get original price based on priceOption for discount calculation
        let originalPrice = item.productId.price;
        const priceOption = item.priceOption || 'regular';

        if (
          priceOption === '3weeks' &&
          item.productId.price3weeksDelivery > 0
        ) {
          originalPrice = item.productId.price3weeksDelivery;
        } else if (
          priceOption === '5weeks' &&
          item.productId.price5weeksDelivery > 0
        ) {
          originalPrice = item.productId.price5weeksDelivery;
        }

        notDiscountPrice += originalPrice * quantity;
      } else if (!isLoggedIn) {
        // Guest cart - calculate price based on priceOption
        const priceOption = item.priceOption || 'regular';
        let basePrice = item.price || 0;

        // Get correct base price for this price option
        if (priceOption === '3weeks' && item.price3weeksDelivery > 0) {
          basePrice = item.price3weeksDelivery;
        } else if (priceOption === '5weeks' && item.price5weeksDelivery > 0) {
          basePrice = item.price5weeksDelivery;
        }

        const price = pricewithDiscount(basePrice, item.discount || 0);
        tPrice += price * quantity;
        notDiscountPrice += basePrice * quantity;
      }
    });

    setTotalQty(qty);
    setTotalPrice(tPrice);
    setNotDiscountTotalPrice(notDiscountPrice);
  };

  // ===== EFFECTS =====

  // Calculate totals when cart changes
  useEffect(() => {
    calculateTotals();
  }, [cartItem, guestCart, isLoggedIn]);

  // Initialize data on mount
  useEffect(() => {
    loadGuestCart();
    loadWishlist();
    loadCompare();
    fetchExchangeRates();

    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (
      savedCurrency &&
      availableCurrencies.some((c) => c.code === savedCurrency)
    ) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  // Handle login status changes
  useEffect(() => {
    if (isLoggedIn) {
      fetchCartItem();
      fetchAddress();
      fetchOrder();
      fetchWishlist();
      fetchCompare();
    } else {
      // User logged out, clear user-specific data
      dispatch(handleAddItemCart([]));
    }
  }, [isLoggedIn]);

  // Fetch exchange rates periodically
  useEffect(() => {
    const interval = setInterval(fetchExchangeRates, 30 * 60 * 1000); // Every 30 minutes
    return () => clearInterval(interval);
  }, []);

  // ===== CONTEXT VALUES =====
  const wishlistContextValue = {
    wishlistItems,
    wishlistCount: wishlistItems.length,
    loading: wishlistLoading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    fetchWishlist,
  };

  const compareContextValue = {
    compareItems,
    compareCount: compareItems.length,
    loading: compareLoading,
    isInCompare,
    addToCompare,
    removeFromCompare,
    toggleCompare,
    clearCompare,
    fetchCompare,
  };

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

  const globalContextValue = {
    // Cart functions
    fetchCartItem,
    updateCartItem,
    deleteCartItem,

    // Guest cart functions
    guestCart,
    addToGuestCart,
    updateGuestCartItem,
    removeFromGuestCart,
    clearGuestCart,

    // Migration functions
    migrateGuestDataToUser,
    migrationInProgress,

    // Totals and state
    totalPrice,
    totalQty,
    notDiscountTotalPrice,
    isLoggedIn,

    // Other functions
    fetchAddress,
    fetchOrder,
    getEffectiveStock,
    handleLogout,
  };

  return (
    <GlobalContext.Provider value={globalContextValue}>
      <WishlistContext.Provider value={wishlistContextValue}>
        <CompareContext.Provider value={compareContextValue}>
          <CurrencyContext.Provider value={currencyContextValue}>
            {children}
          </CurrencyContext.Provider>
        </CompareContext.Provider>
      </WishlistContext.Provider>
    </GlobalContext.Provider>
  );
};

// Compare context for easier access
export const CompareContext = createContext();
export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within GlobalProvider');
  }
  return context;
};

export default GlobalProvider;
