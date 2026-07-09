//client
import { createContext, useContext, useEffect, useState } from 'react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { useDispatch, useSelector } from 'react-redux';
// Phase 2: country-aware currency
import { useCountry } from '../context/CountryContext.jsx';
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

  // ─── CURRENCY ─────────────────────────────────────────────────────────────────
  // Phase 2: pull country config so currency defaults to the active country
  // useCountry() is safe here because GlobalProvider is always wrapped inside CountryProvider
  const { country: activeCountry, formatPrice: countryFormatPrice, hasPaystack } = useCountry();

  // Default selected currency to the active country's native currency —
  // i-coffee.ng → NGN, i-coffee.tg → XOF, i-coffee.it → EUR, etc.
  const defaultCurrency = activeCountry?.currency?.code || 'NGN';

  // Base currency list — "isBase" (shown as the market's native currency in
  // the selector) now follows the visited domain instead of always being
  // NGN. If a country's currency isn't in the static list yet, it's added
  // dynamically from the country config so new markets work with zero code
  // changes here.
  const CURRENCY_CATALOG = [
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'XOF', name: 'CFA Franc', symbol: 'CFA' },
  ];
  const knownCodes = CURRENCY_CATALOG.map((c) => c.code);
  const catalog = knownCodes.includes(defaultCurrency)
    ? CURRENCY_CATALOG
    : [
        {
          code: defaultCurrency,
          name: activeCountry?.currency?.name || defaultCurrency,
          symbol: activeCountry?.currency?.symbol || defaultCurrency,
        },
        ...CURRENCY_CATALOG,
      ];
  const availableCurrencies = catalog.map((c) => ({
    ...c,
    isBase: c.code === defaultCurrency,
  }));

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

  // ─── CURRENCY (continued) ──────────────────────────────────────────────────
  // activeCountry / defaultCurrency / availableCurrencies are declared near
  // the top of the component (needed before this point too).
  const fetchExchangeRates = async () => {
    try {
      setCurrencyLoading(true);
      const r = await Axios({ ...SummaryApi.getExchangeRates, params: { limit: 100 } });
      if (r.data.success && r.data.data.length > 0) {
        const rateMap = { NGN: 1 };
        const FIAT = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'XOF'];
        const process = (rate) => {
          const { baseCurrency: base, targetCurrency: target, rate: value } = rate;
          if (base === 'NGN' && FIAT.includes(target)) rateMap[target] = value;
          else if (FIAT.includes(base) && target === 'NGN' && value > 0) rateMap[base] = 1 / value;
        };
        r.data.data.filter((x) => x.source !== 'MANUAL').forEach(process);
        r.data.data.filter((x) => x.source === 'MANUAL').forEach(process);
        setExchangeRates(rateMap);
        // PHASE 6: persist so the DisplayPriceInNaira shim (pure fn, outside
        // React) can convert legacy call sites to the active currency.
        try { localStorage.setItem('exchangeRates', JSON.stringify(rateMap)); } catch {}
      }
    } catch {} finally { setCurrencyLoading(false); }
  };

  const convertPrice = (priceInBase, targetCurrency = selectedCurrency) => {
    const base = defaultCurrency;
    if (targetCurrency === base) return priceInBase;
    const rate = exchangeRates[targetCurrency];
    return rate ? priceInBase * rate : priceInBase;
  };

  const formatPrice = (price, currency = selectedCurrency) => {
    // Use country-native formatting when displaying in the country's default currency
    if (currency === defaultCurrency) {
      return countryFormatPrice(price);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency,
      minimumFractionDigits: currency === 'NGN' || currency === 'XOF' ? 0 : 2,
    }).format(convertPrice(price, currency));
  };

  const changeCurrency = (code) => {
    setSelectedCurrency(code);
    localStorage.setItem('selectedCurrency', code);
    localStorage.setItem('icvng_active_currency', code);
    window.dispatchEvent(new CustomEvent('currency-changed', { detail: { currency: code } }));
  };

  // Phase 2: derive payment method from country config
  const getPaymentMethod = (currency = selectedCurrency) => {
    if (hasPaystack && currency === 'NGN') return 'paystack';
    return 'stripe';
  };

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
  }, []);

  // Keep selectedCurrency following the visited domain's native currency.
  // localStorage is per-origin, so a choice made on i-coffee.tg never leaks
  // to i-coffee.ng — if nothing is EXPLICITLY saved for THIS domain, default
  // to its native currency (defaultCurrency resolves from "NGN" → the real
  // country once CountryContext's bootstrap fetch completes, so this
  // re-runs then). An explicit past selection (via the selector) always
  // wins over the default.
  //
  // IMPORTANT: 'selectedCurrency' in localStorage is ONLY ever written by
  // changeCurrency() (an explicit user pick) — never by this effect. Writing
  // the auto-resolved value here too would create a feedback loop: on first
  // mount defaultCurrency is briefly "NGN" (the synchronous placeholder
  // before the real country loads), so an early write would get read back
  // on the very next run as if the shopper had "chosen" NGN, permanently
  // overriding the real country default once it arrives.
  //
  // We still persist the CURRENTLY ACTIVE currency to a separate key
  // (icvng_active_currency) for legacy price-display call sites (e.g. the
  // DisplayPriceInNaira shim) that are plain functions outside React and
  // read localStorage directly instead of this context.
  useEffect(() => {
    const explicitChoice = localStorage.getItem('selectedCurrency');
    const explicitChoiceIsValid =
      explicitChoice && availableCurrencies.some((c) => c.code === explicitChoice);
    const resolved = explicitChoiceIsValid ? explicitChoice : defaultCurrency;
    setSelectedCurrency(resolved);
    try { localStorage.setItem('icvng_active_currency', resolved); } catch {}
    window.dispatchEvent(new CustomEvent('currency-changed', { detail: { currency: resolved } }));
  }, [defaultCurrency]);

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
            selectedCurrency, availableCurrencies, exchangeRates, currencyLoading, defaultCurrency,
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
