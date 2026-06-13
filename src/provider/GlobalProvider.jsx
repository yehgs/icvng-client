//client
import { createContext, useContext, useEffect, useState } from 'react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { useDispatch, useSelector } from 'react-redux';
import { handleAddItemCart } from '../store/cartProduct';
import AxiosToastError from '../utils/AxiosToastError';
import toast from 'react-hot-toast';
import { handleAddAddress } from '../store/addressSlice';
import { setOrder } from '../store/orderSlice';

export const GlobalContext = createContext(null);
export const useGlobalContext = () => useContext(GlobalContext);

export const WishlistContext = createContext();
export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within GlobalProvider');
  return ctx;
};

export const CurrencyContext = createContext();
export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within GlobalProvider');
  return ctx;
};

export const CompareContext = createContext();
export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within GlobalProvider');
  return ctx;
};

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS_GUEST_CART = 'icvng_guest_cart';

const loadGuestCartFromStorage = () => {
  try { return JSON.parse(localStorage.getItem(LS_GUEST_CART) || '[]'); }
  catch { return []; }
};

const saveGuestCartToStorage = (cart) => {
  try { localStorage.setItem(LS_GUEST_CART, JSON.stringify(cart)); }
  catch {}
};

// ─── GlobalProvider ───────────────────────────────────────────────────────────
const GlobalProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user);
  const cartItem = useSelector((state) => state.cartItem.cart);

  const [totalPrice, setTotalPrice] = useState(0);
  const [notDiscountTotalPrice, setNotDiscountTotalPrice] = useState(0);
  const [totalQty, setTotalQty] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Guest cart — stored in localStorage, visible even when not logged in
  const [guestCart, setGuestCart] = useState(() => loadGuestCartFromStorage());
  const [isMerging, setIsMerging] = useState(false); // true while guest cart is being merged on login

  // Wishlist & Compare (localStorage — browsing without login)
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [compareItems, setCompareItems] = useState([]);
  const [compareLoading, setCompareLoading] = useState(true);

  // Currency
  const [selectedCurrency, setSelectedCurrency] = useState('NGN');
  const [exchangeRates, setExchangeRates] = useState({
    NGN: 1, USD: 1 / 1550, EUR: 1 / 1650, GBP: 1 / 1950, XOF: 1 / 2.5,
  });
  const [currencyLoading, setCurrencyLoading] = useState(false);

  const availableCurrencies = [
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', isBase: true },
    { code: 'USD', name: 'US Dollar', symbol: '$', isBase: false },
    { code: 'EUR', name: 'Euro', symbol: '€', isBase: false },
    { code: 'GBP', name: 'British Pound', symbol: '£', isBase: false },
    { code: 'XOF', name: 'CFA Franc', symbol: 'CFA', isBase: false },
  ];

  // ─── Login status ───────────────────────────────────────────────────────────
  useEffect(() => { setIsLoggedIn(Boolean(user?._id)); }, [user?._id]);

  // ─── Utilities ──────────────────────────────────────────────────────────────
  const getEffectiveStock = (product) => {
    if (product.warehouseStock?.enabled && product.warehouseStock.onlineStock !== undefined)
      return product.warehouseStock.onlineStock;
    return product.stock || 0;
  };
  const triggerCartUpdate = () => window.dispatchEvent(new CustomEvent('cart-updated'));
  const triggerWishlistUpdate = () => window.dispatchEvent(new CustomEvent('wishlist-updated'));
  const triggerCompareUpdate = () => window.dispatchEvent(new CustomEvent('compare-updated'));

  // ─── GUEST CART ─────────────────────────────────────────────────────────────
  // Persisted to localStorage so items survive page refresh / login redirect
  const _setGuestCart = (cart) => {
    setGuestCart(cart);
    saveGuestCartToStorage(cart);
    triggerCartUpdate();
  };

  const addToGuestCart = (productData) => {
    const existing = guestCart.findIndex(
      (i) => i.productId === productData.productId &&
              (i.priceOption || 'regular') === (productData.priceOption || 'regular')
    );
    let updated;
    if (existing !== -1) {
      updated = guestCart.map((i, idx) =>
        idx === existing ? { ...i, quantity: i.quantity + productData.quantity } : i
      );
    } else {
      updated = [...guestCart, { ...productData, priceOption: productData.priceOption || 'regular' }];
    }
    _setGuestCart(updated);
  };

  const updateGuestCartItem = (productId, quantity, priceOption = 'regular') => {
    if (quantity <= 0) { removeFromGuestCart(productId, priceOption); return; }
    _setGuestCart(guestCart.map((i) =>
      i.productId === productId && (i.priceOption || 'regular') === priceOption
        ? { ...i, quantity } : i
    ));
  };

  const removeFromGuestCart = (productId, priceOption = 'regular') => {
    _setGuestCart(guestCart.filter((i) =>
      !(i.productId === productId && (i.priceOption || 'regular') === priceOption)
    ));
  };

  const clearGuestCart = () => {
    localStorage.removeItem(LS_GUEST_CART);
    setGuestCart([]);
    triggerCartUpdate();
  };

  // Merge guest cart into server after login
  const mergeGuestCartToServer = async () => {
    const cartToMigrate = loadGuestCartFromStorage(); // read fresh from storage
    if (cartToMigrate.length === 0) return;

    setIsMerging(true);
    try {
      // Try the dedicated migrate endpoint first
      await Axios({
        ...SummaryApi.migrateGuestCart,
        data: { guestCartItems: cartToMigrate },
      });
      clearGuestCart();
      await fetchCartItem();
      toast.success(`${cartToMigrate.length} cart item${cartToMigrate.length > 1 ? 's' : ''} added to your account`);
    } catch {
      // Fallback: add each item individually
      for (const item of cartToMigrate) {
        try {
          await Axios({
            ...SummaryApi.addTocart,
            data: { productId: item.productId, quantity: item.quantity, priceOption: item.priceOption || 'regular' },
          });
        } catch {}
      }
      clearGuestCart();
      await fetchCartItem();
    } finally {
      setIsMerging(false);
    }
  };

  // ─── WISHLIST ────────────────────────────────────────────────────────────────
  const loadWishlist = () => {
    try { setWishlistItems(JSON.parse(localStorage.getItem('wishlist') || '[]')); }
    catch { setWishlistItems([]); }
    finally { setWishlistLoading(false); }
  };
  const saveWishlist = (list) => {
    try { localStorage.setItem('wishlist', JSON.stringify(list)); setWishlistItems(list); triggerWishlistUpdate(); }
    catch {}
  };
  const isInWishlist = (id) => wishlistItems.some((i) => i._id === id);
  const addToWishlist = (p) => { if (!isInWishlist(p._id)) { saveWishlist([...wishlistItems, p]); return true; } return false; };
  const removeFromWishlist = (id) => { saveWishlist(wishlistItems.filter((i) => i._id !== id)); return true; };
  const toggleWishlist = (p) => { if (isInWishlist(p._id)) { removeFromWishlist(p._id); return false; } addToWishlist(p); return true; };
  const clearWishlist = () => { localStorage.removeItem('wishlist'); setWishlistItems([]); triggerWishlistUpdate(); };
  const fetchWishlist = async () => {
    if (!isLoggedIn) return;
    try { const r = await Axios({ ...SummaryApi.getWishlist }); if (r.data.success) { setWishlistItems(r.data.data); triggerWishlistUpdate(); } } catch {}
  };

  // ─── COMPARE ─────────────────────────────────────────────────────────────────
  const loadCompare = () => {
    try { setCompareItems(JSON.parse(localStorage.getItem('compareList') || '[]')); }
    catch { setCompareItems([]); }
    finally { setCompareLoading(false); }
  };
  const saveCompare = (list) => {
    try { localStorage.setItem('compareList', JSON.stringify(list)); setCompareItems(list); triggerCompareUpdate(); }
    catch {}
  };
  const isInCompare = (id) => compareItems.some((i) => i._id === id);
  const addToCompare = (p) => { if (compareItems.length >= 4) { toast.error('You can only compare up to 4 products'); return false; } if (!isInCompare(p._id)) { saveCompare([...compareItems, p]); return true; } return false; };
  const removeFromCompare = (id) => { saveCompare(compareItems.filter((i) => i._id !== id)); return true; };
  const toggleCompare = (p) => { if (isInCompare(p._id)) { removeFromCompare(p._id); return false; } return addToCompare(p); };
  const clearCompare = () => { localStorage.removeItem('compareList'); setCompareItems([]); triggerCompareUpdate(); };
  const fetchCompare = async () => {
    if (!isLoggedIn) return;
    try { const r = await Axios({ ...SummaryApi.getCompareList }); if (r.data.success) { setCompareItems(r.data.data); triggerCompareUpdate(); } } catch {}
  };

  // ─── SERVER CART ─────────────────────────────────────────────────────────────
  const fetchCartItem = async () => {
    if (!isLoggedIn) { dispatch(handleAddItemCart([])); return; }
    try {
      const r = await Axios({ ...SummaryApi.getCartItem });
      if (r.data.success) dispatch(handleAddItemCart(r.data.data));
    } catch {}
  };

  const updateCartItem = async (cartItemId, quantity) => {
    if (quantity <= 0) return deleteCartItem(cartItemId);
    try {
      const r = await Axios({ ...SummaryApi.updateCartItemQty, data: { _id: cartItemId, qty: quantity } });
      if (r.data.success) { fetchCartItem(); triggerCartUpdate(); return r.data; }
    } catch (e) { AxiosToastError(e); return e; }
  };

  const deleteCartItem = async (cartId) => {
    try {
      const r = await Axios({ ...SummaryApi.deleteCartItem, data: { _id: cartId } });
      if (r.data.success) { toast.success(r.data.message); fetchCartItem(); triggerCartUpdate(); }
    } catch (e) { AxiosToastError(e); }
  };

  // ─── CURRENCY ─────────────────────────────────────────────────────────────────
  const fetchExchangeRates = async () => {
    try {
      setCurrencyLoading(true);
      const r = await Axios({ ...SummaryApi.getExchangeRates, params: { limit: 100 } });
      if (r.data.success && r.data.data.length > 0) {
        const rateMap = { NGN: 1 };
        const FIAT = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF'];
        const process = (rate) => {
          const { baseCurrency: base, targetCurrency: target, rate: value } = rate;
          if (base === 'NGN' && FIAT.includes(target)) rateMap[target] = value;
          else if (FIAT.includes(base) && target === 'NGN' && value > 0) rateMap[base] = 1 / value;
        };
        r.data.data.filter((x) => x.source !== 'MANUAL').forEach(process);
        r.data.data.filter((x) => x.source === 'MANUAL').forEach(process);
        setExchangeRates(rateMap);
      }
    } catch {} finally { setCurrencyLoading(false); }
  };

  const convertPrice = (priceInNGN, targetCurrency = selectedCurrency) => {
    if (targetCurrency === 'NGN') return priceInNGN;
    const rate = exchangeRates[targetCurrency];
    return rate ? priceInNGN * rate : priceInNGN;
  };

  const formatPrice = (price, currency = selectedCurrency) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency', currency,
      minimumFractionDigits: currency === 'NGN' ? 0 : 2,
    }).format(convertPrice(price, currency));

  const changeCurrency = (code) => {
    setSelectedCurrency(code);
    localStorage.setItem('selectedCurrency', code);
    window.dispatchEvent(new CustomEvent('currency-changed', { detail: { currency: code } }));
  };

  const getPaymentMethod = (currency = selectedCurrency) => currency === 'NGN' ? 'paystack' : 'stripe';

  // ─── ADDRESS & ORDERS ─────────────────────────────────────────────────────────
  const fetchAddress = async () => {
    if (!isLoggedIn) return;
    try { const r = await Axios({ ...SummaryApi.getAddress }); if (r.data.success) dispatch(handleAddAddress(r.data.data)); } catch {}
  };

  const fetchOrder = async () => {
    if (!isLoggedIn) return;
    try { const r = await Axios({ ...SummaryApi.getOrderItems }); if (r.data.success) dispatch(setOrder(r.data.data)); } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem('accesstoken');
    localStorage.removeItem('refreshToken');
    dispatch(handleAddItemCart([]));
    triggerCartUpdate(); triggerWishlistUpdate(); triggerCompareUpdate();
  };

  // ─── TOTALS ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    // When logged in: use server cart. When guest: use local guest cart.
    let qty = 0, tPrice = 0, notDiscount = 0;

    if (isLoggedIn) {
      cartItem.forEach((item) => {
        const quantity = item.quantity || 0;
        qty += quantity;
        if (item.productId) {
          const price = item.selectedPrice || item.productId.btcPrice || item.productId.price || 0;
          tPrice += price * quantity;
          const priceOption = item.priceOption || 'regular';
          let orig = item.productId.btcPrice || item.productId.price || 0;
          if (priceOption === '3weeks' && item.productId.price3weeksDelivery > 0) orig = item.productId.price3weeksDelivery;
          else if (priceOption === '5weeks' && item.productId.price5weeksDelivery > 0) orig = item.productId.price5weeksDelivery;
          notDiscount += orig * quantity;
        }
      });
    } else {
      // Guest cart totals
      guestCart.forEach((item) => {
        const quantity = item.quantity || 0;
        qty += quantity;
        const price = item.selectedPrice || item.btcPrice || item.price || 0;
        tPrice += price * quantity;
        notDiscount += (item.selectedPrice || item.btcPrice || item.price || 0) * quantity;
      });
    }

    setTotalQty(qty);
    setTotalPrice(tPrice);
    setNotDiscountTotalPrice(notDiscount);
  }, [cartItem, guestCart, isLoggedIn]);

  // ─── EFFECTS ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadWishlist(); loadCompare(); fetchExchangeRates();
    const saved = localStorage.getItem('selectedCurrency');
    if (saved && availableCurrencies.some((c) => c.code === saved)) setSelectedCurrency(saved);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      // Merge guest cart first, then fetch everything
      mergeGuestCartToServer().then(() => {
        fetchCartItem(); fetchAddress(); fetchOrder(); fetchWishlist(); fetchCompare();
      });
    } else {
      dispatch(handleAddItemCart([]));
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const iv = setInterval(fetchExchangeRates, 30 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  // ─── CONTEXT VALUES ───────────────────────────────────────────────────────────
  const globalContextValue = {
    // Server cart
    fetchCartItem, updateCartItem, deleteCartItem,
    // Guest cart (localStorage)
    guestCart, addToGuestCart, updateGuestCartItem, removeFromGuestCart, clearGuestCart, mergeGuestCartToServer,
    isMerging,
    // Totals
    totalPrice, totalQty, notDiscountTotalPrice, isLoggedIn,
    // Other
    fetchAddress, fetchOrder, getEffectiveStock, handleLogout,
  };

  return (
    <GlobalContext.Provider value={globalContextValue}>
      <WishlistContext.Provider value={{
        wishlistItems, wishlistCount: wishlistItems.length, loading: wishlistLoading,
        isInWishlist, addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist, fetchWishlist,
      }}>
        <CompareContext.Provider value={{
          compareItems, compareCount: compareItems.length, loading: compareLoading,
          isInCompare, addToCompare, removeFromCompare, toggleCompare, clearCompare, fetchCompare,
        }}>
          <CurrencyContext.Provider value={{
            selectedCurrency, availableCurrencies, exchangeRates, currencyLoading,
            convertPrice, formatPrice, changeCurrency, getPaymentMethod, fetchExchangeRates,
          }}>
            {children}
          </CurrencyContext.Provider>
        </CompareContext.Provider>
      </WishlistContext.Provider>
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
