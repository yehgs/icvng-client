import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobalContext, useCurrency } from '../provider/GlobalProvider';
import { FaCaretRight, FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import { LogIn, UserPlus, ShoppingCart, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
import imageEmpty from '../assets/empty_cart.webp';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';

// ─── "Almost there!" modal — exactly like the reference app ──────────────────
function AuthRequiredModal({ onClose, navigate, close }) {
  const go = (path) => { onClose(); close?.(); navigate(path); };
  return (
    <div className="cart-auth-modal fixed inset-0 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-6 pt-6 pb-4 text-center relative">
          <button onClick={onClose}
            className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShoppingCart className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Almost there!</h2>
          <p className="text-sm text-gray-500 mt-1">
            Sign in or create an account to complete your order. Your cart items will be saved automatically.
          </p>
        </div>
        <div className="px-6 pb-6 space-y-3">
          <button onClick={() => go('/login?redirect=checkout')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors">
            <LogIn className="w-4 h-4" /> Sign In to Checkout
          </button>
          <button onClick={() => go('/register?redirect=checkout')}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-green-600 text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-colors">
            <UserPlus className="w-4 h-4" /> Create Account
          </button>
          <p className="text-center text-xs text-gray-400 pt-1">
            Your cart items will be waiting for you after sign in
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────
// Push every tawk.to element behind the cart drawer while it is open,
// then restore them when the drawer unmounts.
// Tawk injects several iframes + a container div — we target all of them.
function useTawkZIndex() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Selectors that cover every element tawk injects into the page
    const TAWK_SELECTORS = [
      'iframe[src*="tawk.to"]',
      'iframe[id*="tawk"]',
      'iframe[name*="tawk"]',
      '[id*="tawk"]',
      '[class*="tawk"]',
      // The bubble launcher tawk uses in some embed versions
      '#tawk-bubble-container',
      '.tawkchat-container',
      '.widget-visible',
    ].join(', ');

    const applyZ = (zIndex) => {
      try {
        // 1. Use the official Tawk_API if available (most reliable)
        if (window.Tawk_API) {
          if (zIndex === 1) {
            // Cart is open — hide tawk completely so it can't overlap
            if (typeof window.Tawk_API.hideWidget === 'function') {
              window.Tawk_API.hideWidget();
            }
          } else {
            // Cart closed — show tawk again
            if (typeof window.Tawk_API.showWidget === 'function') {
              window.Tawk_API.showWidget();
            }
          }
        }

        // 2. Belt-and-suspenders: also directly style every matched element
        document.querySelectorAll(TAWK_SELECTORS).forEach((el) => {
          el.style.setProperty('z-index', String(zIndex), 'important');
        });

        // 3. Walk ALL iframes and hit any that embed tawk.to in their src
        document.querySelectorAll('iframe').forEach((iframe) => {
          const src = iframe.src || iframe.getAttribute('src') || '';
          if (src.includes('tawk.to') || src.includes('tawkto')) {
            iframe.style.setProperty('z-index', String(zIndex), 'important');
            // Also style the immediate parent wrapper tawk injects
            if (iframe.parentElement) {
              iframe.parentElement.style.setProperty('z-index', String(zIndex), 'important');
            }
          }
        });
      } catch (e) {
        // Never crash the cart drawer over a widget issue
      }
    };

    // Drawer is mounting — push tawk behind (drawer backdrop is z-index 2,000,000,001)
    applyZ(1);

    return () => {
      // Drawer unmounting — restore tawk
      applyZ(2000000000);
    };
  }, []); // run once on mount / cleanup on unmount — no deps needed
}

const DisplayCartItem = ({ close }) => {
  const {
    notDiscountTotalPrice, totalPrice, totalQty,
    isLoggedIn,
    guestCart, updateGuestCartItem, removeFromGuestCart,
    updateCartItem, deleteCartItem,
  } = useGlobalContext();

  const { formatPrice } = useCurrency();
  const cartItem = useSelector((state) => state.cartItem.cart);
  const navigate = useNavigate();
  const [loadingItems, setLoadingItems] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Keep tawk.to widget behind the cart drawer while it is open
  useTawkZIndex();

  // Use server cart when logged in, guest cart when not
  const currentCart = isLoggedIn ? cartItem : guestCart;

  const handleCheckout = () => {
    if (!isLoggedIn) { setShowAuthModal(true); return; }
    navigate('/checkout');
    close?.();
  };

  const getPriceOptionLabel = (opt) =>
    ({ regular: 'Regular Delivery', '3weeks': '3 Weeks Delivery', '5weeks': '5 Weeks Delivery' }[opt] || 'Regular Delivery');

  const getPriceOptionColor = (opt) =>
    ({ regular: 'bg-green-100 text-green-700 border-green-200', '3weeks': 'bg-orange-100 text-orange-700 border-orange-200', '5weeks': 'bg-red-100 text-red-700 border-red-200' }[opt] || 'bg-gray-100 text-gray-700 border-gray-200');

  // ─── Guest cart handlers ────────────────────────────────────────────────────
  const handleGuestIncrease = (item) => {
    updateGuestCartItem(item.productId, item.quantity + 1, item.priceOption);
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };
  const handleGuestDecrease = (item) => {
    if (item.quantity === 1) removeFromGuestCart(item.productId, item.priceOption);
    else updateGuestCartItem(item.productId, item.quantity - 1, item.priceOption);
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };
  const handleGuestDelete = (item) => {
    removeFromGuestCart(item.productId, item.priceOption);
    window.dispatchEvent(new CustomEvent('cart-updated'));
    toast.success('Item removed');
  };

  // ─── Server cart handlers ────────────────────────────────────────────────────
  const handleUserIncrease = async (item) => {
    const key = item._id;
    setLoadingItems((p) => ({ ...p, [key]: true }));
    try {
      const r = await updateCartItem(item._id, item.quantity + 1);
      if (r?.success) { toast.success('Quantity updated'); window.dispatchEvent(new CustomEvent('cart-updated')); }
    } catch (e) { AxiosToastError(e); }
    finally { setLoadingItems((p) => ({ ...p, [key]: false })); }
  };

  const handleUserDecrease = async (item) => {
    const key = item._id;
    setLoadingItems((p) => ({ ...p, [key]: true }));
    try {
      if (item.quantity === 1) { await deleteCartItem(item._id); toast.success('Item removed'); }
      else { const r = await updateCartItem(item._id, item.quantity - 1); if (r?.success) toast.success('Quantity updated'); }
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (e) { AxiosToastError(e); }
    finally { setLoadingItems((p) => ({ ...p, [key]: false })); }
  };

  const handleUserDelete = async (item) => {
    const key = item._id;
    setLoadingItems((p) => ({ ...p, [key]: true }));
    try { await deleteCartItem(item._id); toast.success('Item removed'); window.dispatchEvent(new CustomEvent('cart-updated')); }
    catch (e) { AxiosToastError(e); }
    finally { setLoadingItems((p) => ({ ...p, [key]: false })); }
  };

  // ─── Render a guest item ─────────────────────────────────────────────────────
  const renderGuestItem = (item, index) => {
    const priceOption = item.priceOption || 'regular';
    const price = item.selectedPrice || item.btcPrice || item.price || 0;
    return (
      <div key={`guest-${item.productId}-${priceOption}-${index}`} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="w-20 h-20 min-w-20 bg-white border rounded-lg overflow-hidden">
          <img src={item.image?.[0] || '/placeholder-image.jpg'} className="object-contain w-full h-full p-1" alt={item.name} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{item.name}</h4>
          <div className="mb-2">
            <span className={`text-xs px-2 py-1 rounded-md border ${getPriceOptionColor(priceOption)}`}>{getPriceOptionLabel(priceOption)}</span>
          </div>
          <p className="font-bold text-green-700 mb-2">{formatPrice(price)}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => handleGuestDecrease(item)} className="bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-md flex items-center justify-center">
              {item.quantity === 1 ? <FaTrash size={12} /> : <FaMinus size={12} />}
            </button>
            <span className="px-3 py-1 bg-white border border-gray-300 rounded-md font-semibold min-w-[50px] text-center">{item.quantity}</span>
            <button onClick={() => handleGuestIncrease(item)} className="bg-green-600 hover:bg-green-700 text-white w-8 h-8 rounded-md flex items-center justify-center">
              <FaPlus size={12} />
            </button>
            <button onClick={() => handleGuestDelete(item)} className="ml-auto text-red-600 hover:text-red-800">
              <FaTrash size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── Render a server cart item ────────────────────────────────────────────────
  const renderServerItem = (item, index) => {
    const priceOption = item.priceOption || 'regular';
    const displayPrice = item.selectedPrice || item?.productId?.btcPrice || item?.productId?.price || 0;
    const key = item._id;
    const isLoading = loadingItems[key];
    return (
      <div key={`${item._id}-${index}`} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="w-20 h-20 min-w-20 bg-white border rounded-lg overflow-hidden">
          <img src={item?.productId?.image?.[0]} className="object-contain w-full h-full p-1" alt={item?.productId?.name} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{item?.productId?.name}</h4>
          <div className="mb-2">
            <span className={`text-xs px-2 py-1 rounded-md border ${getPriceOptionColor(priceOption)}`}>{getPriceOptionLabel(priceOption)}</span>
          </div>
          <p className="font-bold text-green-700 mb-2">{formatPrice(displayPrice)}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => handleUserDecrease(item)} disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white w-8 h-8 rounded-md flex items-center justify-center">
              {item.quantity === 1 ? <FaTrash size={12} /> : <FaMinus size={12} />}
            </button>
            <span className="px-3 py-1 bg-white border border-gray-300 rounded-md font-semibold min-w-[50px] text-center">
              {isLoading ? '...' : item.quantity}
            </span>
            <button onClick={() => handleUserIncrease(item)} disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white w-8 h-8 rounded-md flex items-center justify-center">
              <FaPlus size={12} />
            </button>
            <button onClick={() => handleUserDelete(item)} disabled={isLoading}
              className="ml-auto text-red-600 hover:text-red-800 disabled:text-gray-400">
              <FaTrash size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="cart-drawer-backdrop bg-neutral-900 fixed top-0 bottom-0 right-0 left-0 bg-opacity-70">
      {showAuthModal && (
        <AuthRequiredModal onClose={() => setShowAuthModal(false)} navigate={navigate} close={close} />
      )}

      <div className="cart-drawer-panel bg-white w-full max-w-sm min-h-screen max-h-screen ml-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center p-4 shadow-md gap-3 justify-between border-b">
          <h2 className="font-semibold text-lg">Cart {totalQty > 0 && `(${totalQty})`}</h2>
          <button
            onClick={close}
            className="hover:bg-gray-100 p-1 rounded transition-colors"
            aria-label="Close cart"
          >
            <IoClose size={25} />
          </button>
        </div>

        {/* Guest sign-in banner */}
        {!isLoggedIn && currentCart.length > 0 && (
          <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-xs text-amber-700">
            <LogIn className="w-3.5 h-3.5 shrink-0" />
            <span>Sign in to save your cart and track your order</span>
          </div>
        )}

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto bg-blue-50 p-3">
          {currentCart.length > 0 ? (
            <div className="space-y-4">
              {/* Savings */}
              {notDiscountTotalPrice > totalPrice && (
                <div className="flex items-center justify-between px-4 py-3 bg-green-100 text-green-700 rounded-lg border border-green-200">
                  <p className="font-medium">Total Savings</p>
                  <p className="font-bold">{formatPrice(notDiscountTotalPrice - totalPrice)}</p>
                </div>
              )}

              {/* Items */}
              <div className="space-y-3">
                {currentCart.map((item, index) =>
                  isLoggedIn ? renderServerItem(item, index) : renderGuestItem(item, index)
                )}
              </div>

              {/* Bill Summary */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold mb-3 text-gray-800">Bill Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-600">Items total</p>
                    <div className="text-right">
                      {notDiscountTotalPrice > totalPrice && (
                        <p className="line-through text-gray-400 text-xs">{formatPrice(notDiscountTotalPrice)}</p>
                      )}
                      <p className="font-semibold text-gray-800">{formatPrice(totalPrice)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-600">Quantity</p>
                    <p className="font-semibold text-gray-800">{totalQty} item{totalQty > 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-600">Delivery</p>
                    <p className="font-semibold text-green-600">Calculated at checkout</p>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <p className="font-bold text-lg text-gray-800">Total</p>
                    <p className="font-bold text-lg text-green-700">{formatPrice(totalPrice)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white flex flex-col justify-center items-center p-8 rounded-lg">
              <img src={imageEmpty} className="w-full h-full object-scale-down max-w-xs mb-4" alt="Empty cart" />
              <p className="text-gray-600 text-lg font-medium mb-4">Your cart is empty</p>
              <Link onClick={close} to={'/'} className="bg-green-600 hover:bg-green-700 px-6 py-3 text-white rounded-lg font-medium transition">
                Start Shopping
              </Link>
            </div>
          )}
        </div>

        {/* Checkout Button */}
        {currentCart.length > 0 && (
          <div className="p-4 bg-white border-t shadow-lg">
            <button onClick={handleCheckout}
              className="w-full bg-green-700 hover:bg-green-800 text-white px-4 py-4 rounded-lg font-bold text-base flex items-center justify-between transition shadow-md">
              <span>{formatPrice(totalPrice)}</span>
              <span className="flex items-center gap-2">
                {isLoggedIn ? 'Proceed to Checkout' : 'Checkout'}
                <FaCaretRight />
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default DisplayCartItem;
