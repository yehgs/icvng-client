import React from 'react';
import { IoClose } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobalContext, useCurrency } from '../provider/GlobalProvider';
import { FaCaretRight } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import AddToCartButton from './AddToCartButton';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
import imageEmpty from '../assets/empty_cart.webp';
import toast from 'react-hot-toast';

const DisplayCartItem = ({ close }) => {
  const { notDiscountTotalPrice, totalPrice, totalQty, isLoggedIn, guestCart } =
    useGlobalContext();
  const { formatPrice } = useCurrency();
  const cartItem = useSelector((state) => state.cartItem.cart);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Get current cart based on login status
  const currentCart = isLoggedIn ? cartItem : guestCart;

  const redirectToCheckoutPage = () => {
    // Allow both guests and logged-in users to proceed to checkout
    navigate('/checkout');
    if (close) {
      close();
    }
  };

  // Render guest cart item
  const renderGuestCartItem = (item, index) => {
    return (
      <div
        key={item.productId + 'guestCartItem' + index}
        className="flex w-full gap-4"
      >
        <div className="w-16 h-16 min-h-16 min-w-16 bg-red-500 border rounded">
          <img
            src={item.image?.[0] || '/placeholder-image.jpg'}
            className="object-scale-down w-full h-full"
            alt={item.name}
          />
        </div>
        <div className="w-full max-w-sm text-xs">
          <p className="text-xs text-ellipsis line-clamp-2">{item.name}</p>
          <p className="text-neutral-400">Qty: {item.quantity}</p>
          <p className="font-semibold">
            {formatPrice(pricewithDiscount(item.price, item.discount || 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-blue-600">Proceed to checkout</p>
        </div>
      </div>
    );
  };

  // Render logged-in user cart item
  const renderLoggedInCartItem = (item, index) => {
    return (
      <div key={item?._id + 'cartItemDisplay'} className="flex w-full gap-4">
        <div className="w-16 h-16 min-h-16 min-w-16 bg-red-500 border rounded">
          <img
            src={item?.productId?.image[0]}
            className="object-scale-down w-full h-full"
            alt={item?.productId?.name}
          />
        </div>
        <div className="w-full max-w-sm text-xs">
          <p className="text-xs text-ellipsis line-clamp-2">
            {item?.productId?.name}
          </p>
          <p className="text-neutral-400">{item?.productId?.unit}</p>
          <p className="font-semibold">
            {formatPrice(
              pricewithDiscount(
                item?.productId?.price,
                item?.productId?.discount
              )
            )}
          </p>
        </div>
        <div>
          <AddToCartButton data={item?.productId} />
        </div>
      </div>
    );
  };

  return (
    <section className="bg-neutral-900 fixed top-0 bottom-0 right-0 left-0 bg-opacity-70 z-50">
      <div className="bg-white w-full max-w-sm min-h-screen max-h-screen ml-auto">
        <div className="flex items-center p-4 shadow-md gap-3 justify-between">
          <h2 className="font-semibold">Cart</h2>
          <Link to={'/'} className="lg:hidden">
            <IoClose size={25} />
          </Link>
          <button onClick={close} className="hidden lg:block">
            <IoClose size={25} />
          </button>
        </div>

        <div className="min-h-[75vh] lg:min-h-[80vh] h-full max-h-[calc(100vh-150px)] bg-blue-50 p-2 flex flex-col gap-4">
          {/* Display items */}
          {currentCart.length > 0 ? (
            <>
              {/* Savings display */}
              {notDiscountTotalPrice > totalPrice && (
                <div className="flex items-center justify-between px-4 py-2 bg-blue-100 text-blue-500 rounded-full">
                  <p>Your total savings</p>
                  <p>{formatPrice(notDiscountTotalPrice - totalPrice)}</p>
                </div>
              )}

              {/* Guest user notice */}
              {!isLoggedIn && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-blue-800 mb-2">
                    Shopping as Guest
                  </p>
                  <p className="text-xs text-blue-600">
                    You'll be asked to login or register at checkout
                  </p>
                </div>
              )}

              {/* Cart items */}
              <div className="bg-white rounded-lg p-4 grid gap-5 overflow-auto">
                {currentCart.map((item, index) => {
                  return isLoggedIn
                    ? renderLoggedInCartItem(item, index)
                    : renderGuestCartItem(item, index);
                })}
              </div>

              {/* Bill details */}
              <div className="bg-white p-4">
                <h3 className="font-semibold">Bill details</h3>
                <div className="flex gap-4 justify-between ml-1">
                  <p>Items total</p>
                  <p className="flex items-center gap-2">
                    {notDiscountTotalPrice > totalPrice && (
                      <span className="line-through text-neutral-400">
                        {formatPrice(notDiscountTotalPrice)}
                      </span>
                    )}
                    <span>{formatPrice(totalPrice)}</span>
                  </p>
                </div>
                <div className="flex gap-4 justify-between ml-1">
                  <p>Quantity total</p>
                  <p className="flex items-center gap-2">
                    {totalQty} item{totalQty > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-4 justify-between ml-1">
                  <p>Delivery Charge</p>
                  <p className="flex items-center gap-2">Free</p>
                </div>
                <div className="font-semibold flex items-center justify-between gap-4">
                  <p>Grand total</p>
                  <p>{formatPrice(totalPrice)}</p>
                </div>
              </div>
            </>
          ) : (
            /* Empty cart */
            <div className="bg-white flex flex-col justify-center items-center">
              <img
                src={imageEmpty}
                className="w-full h-full object-scale-down"
                alt="Empty cart"
              />
              <Link
                onClick={close}
                to={'/'}
                className="block bg-green-600 px-4 py-2 text-white rounded"
              >
                Shop Now
              </Link>
            </div>
          )}
        </div>

        {/* Proceed button */}
        {currentCart.length > 0 && (
          <div className="p-2">
            <div className="bg-green-700 text-neutral-100 px-4 font-bold text-base py-4 static bottom-3 rounded flex items-center gap-4 justify-between">
              <div>{formatPrice(totalPrice)}</div>
              <button
                onClick={redirectToCheckoutPage}
                className="flex items-center gap-1"
              >
                {isLoggedIn ? 'Proceed' : 'Checkout'}
                <span>
                  <FaCaretRight />
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DisplayCartItem;
