import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../provider/GlobalProvider';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { useSelector } from 'react-redux';
import { FaMinus, FaPlus, FaSadTear } from 'react-icons/fa';
import { BsCart4 } from 'react-icons/bs';
import ProductRequestModal from './ProductRequestModal';
import { useTranslation } from '../hooks/useTranslation';

const AddToCartButton = ({ data, quantity = 1, selectedPriceOption = null }) => {
  const {
    fetchCartItem, updateCartItem, deleteCartItem, getEffectiveStock,
    isLoggedIn, guestCart, addToGuestCart, updateGuestCartItem, removeFromGuestCart,
  } = useGlobalContext();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const cartItem = useSelector((state) => state.cartItem.cart);
  const [isAvailableCart, setIsAvailableCart] = useState(false);
  const [qty, setQty] = useState(0);
  const [cartItemDetails, setCartItemsDetails] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const effectiveStock = getEffectiveStock(data);

  const handleAddToCart = async (e) => {
    e?.preventDefault(); e?.stopPropagation();

    if (!isLoggedIn) {
      // Add to local guest cart — no login required to browse/add
      const cartData = {
        productId: data._id,
        quantity: quantity,
        priceOption: selectedPriceOption || 'regular',
        price: data.price,
        selectedPrice: data.btcPrice || data.price,
        btcPrice: data.btcPrice,
        discount: data.discount || 0,
        name: data.name,
        image: data.image,
        price3weeksDelivery: data.price3weeksDelivery,
        price5weeksDelivery: data.price5weeksDelivery,
      };
      addToGuestCart(cartData);
      toast.success(t('notifications.addedToCart'));
      window.dispatchEvent(new CustomEvent('cart-updated'));
      return;
    }

    try {
      setLoading(true);
      const cartData = { productId: data._id, quantity };
      if (selectedPriceOption) cartData.priceOption = selectedPriceOption;
      const response = await Axios({ ...SummaryApi.addTocart, data: cartData });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchCartItem?.();
        window.dispatchEvent(new CustomEvent('cart-updated'));
      }
    } catch (error) { AxiosToastError(error); }
    finally { setLoading(false); }
  };

  // Sync cart state
  useEffect(() => {
    if (isLoggedIn) {
      const product = cartItem.find((item) => item.productId?._id === data._id);
      setIsAvailableCart(!!product);
      setQty(product?.quantity || 0);
      setCartItemsDetails(product || null);
    } else {
      const guestItem = guestCart.find((i) => i.productId === data._id &&
        (i.priceOption || 'regular') === (selectedPriceOption || 'regular'));
      setIsAvailableCart(!!guestItem);
      setQty(guestItem?.quantity || 0);
      setCartItemsDetails(guestItem || null);
    }
  }, [data, cartItem, guestCart, isLoggedIn, selectedPriceOption]);

  const increaseQty = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isLoggedIn) {
      updateGuestCartItem(data._id, qty + 1, selectedPriceOption || 'regular');
      toast.success('Item added'); window.dispatchEvent(new CustomEvent('cart-updated')); return;
    }
    const r = await updateCartItem(cartItemDetails?._id, qty + 1);
    if (r?.success) { toast.success('Item added'); window.dispatchEvent(new CustomEvent('cart-updated')); }
  };

  const decreaseQty = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isLoggedIn) {
      if (qty === 1) removeFromGuestCart(data._id, selectedPriceOption || 'regular');
      else updateGuestCartItem(data._id, qty - 1, selectedPriceOption || 'regular');
      window.dispatchEvent(new CustomEvent('cart-updated')); return;
    }
    if (qty === 1) { deleteCartItem(cartItemDetails?._id); }
    else { const r = await updateCartItem(cartItemDetails?._id, qty - 1); if (r?.success) toast.success('Item removed'); }
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  if (!data.productAvailability) {
    return (
      <>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowRequestModal(true); }}
          className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium py-3 px-6 rounded-md transition flex items-center justify-center border border-yellow-300">
          <FaSadTear className="mr-2" /> Not in Production - Request Notification
        </button>
        {showRequestModal && <ProductRequestModal product={data} onClose={() => setShowRequestModal(false)} isDiscontinued={true} />}
      </>
    );
  }

  return (
    <div className="w-full">
      {isAvailableCart ? (
        <div className="flex items-center w-full">
          <button onClick={decreaseQty} className="bg-green-700 hover:bg-green-800 text-white h-8 w-8 rounded-l-md flex items-center justify-center transition">
            <FaMinus />
          </button>
          <div className="flex-1 h-8 bg-white border-t border-b border-gray-200 font-semibold flex items-center justify-center">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-green-700" /> : qty}
          </div>
          <button onClick={increaseQty} className="bg-green-700 hover:bg-green-800 text-white h-8 w-8 rounded-r-md flex items-center justify-center transition">
            <FaPlus />
          </button>
        </div>
      ) : (
        <button onClick={handleAddToCart} disabled={loading}
          className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-3 px-6 rounded-md transition flex items-center justify-center">
          {loading
            ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
            : <><BsCart4 className="mr-2" /> {t('product.addToCart')}</>}
        </button>
      )}
      {effectiveStock > 0 && effectiveStock <= 5 && (
        <div className="mt-2 text-center">
          <span className="text-xs text-orange-600 font-medium">Only {effectiveStock} left in stock</span>
        </div>
      )}
    </div>
  );
};

export default AddToCartButton;
