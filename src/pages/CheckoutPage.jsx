import React, { useState } from 'react';
import { useGlobalContext, useCurrency } from '../provider/GlobalProvider';
import AddAddress from '../components/AddAddress';
import CurrencySelector from '../components/CurrencySelector';
import { useSelector } from 'react-redux';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const {
    notDiscountTotalPrice,
    totalPrice,
    totalQty,
    fetchCartItem,
    fetchOrder,
  } = useGlobalContext();

  const { selectedCurrency, formatPrice, convertPrice, getPaymentMethod } =
    useCurrency();

  const [openAddress, setOpenAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const addressList = useSelector((state) => state.addresses.addressList);
  const [selectAddress, setSelectAddress] = useState(0);
  const cartItemsList = useSelector((state) => state.cartItem.cart);
  const navigate = useNavigate();

  // Convert prices to selected currency
  const convertedTotalPrice = convertPrice(totalPrice);
  const convertedNotDiscountTotalPrice = convertPrice(notDiscountTotalPrice);

  const handleCashOnDelivery = async () => {
    if (selectedCurrency !== 'NGN') {
      toast.error('Cash on Delivery is only available for NGN currency');
      return;
    }

    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.CashOnDeliveryOrder,
        data: {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]?._id,
          subTotalAmt: totalPrice,
          totalAmt: totalPrice,
          currency: selectedCurrency,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        if (fetchCartItem) {
          fetchCartItem();
        }
        if (fetchOrder) {
          fetchOrder();
        }
        navigate('/success', {
          state: {
            text: 'Order',
          },
        });
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    try {
      setLoading(true);
      toast.loading('Processing payment...');

      const paymentMethod = getPaymentMethod();

      if (paymentMethod === 'stripe') {
        // Stripe payment for international currencies
        await handleStripePayment();
      } else {
        // Flutterwave payment for NGN
        await handleFlutterwavePayment();
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
      toast.dismiss();
    }
  };

  const handleStripePayment = async () => {
    try {
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      const stripePromise = await loadStripe(stripePublicKey);

      const response = await Axios({
        ...SummaryApi.payment_url,
        data: {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]?._id,
          subTotalAmt: convertedTotalPrice,
          totalAmt: convertedTotalPrice,
          currency: selectedCurrency,
          paymentMethod: 'stripe',
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        stripePromise.redirectToCheckout({ sessionId: responseData.id });

        if (fetchCartItem) {
          fetchCartItem();
        }
        if (fetchOrder) {
          fetchOrder();
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const handleFlutterwavePayment = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.flutterwave_payment,
        data: {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]?._id,
          subTotalAmt: totalPrice,
          totalAmt: totalPrice,
          currency: selectedCurrency,
          paymentMethod: 'flutterwave',
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        // Redirect to Flutterwave payment page
        window.location.href = responseData.paymentUrl;

        if (fetchCartItem) {
          fetchCartItem();
        }
        if (fetchOrder) {
          fetchOrder();
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const isValidAddress = addressList[selectAddress]?._id;
  const canProceed = cartItemsList.length > 0 && isValidAddress;

  return (
    <section className="bg-blue-50 min-h-screen">
      <div className="container mx-auto p-4 flex flex-col lg:flex-row w-full gap-5 justify-between">
        <div className="w-full">
          {/* Currency Selector */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Payment Currency</h3>
              <CurrencySelector />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {selectedCurrency === 'NGN' ? (
                <span className="text-green-600">
                  ✓ Flutterwave & Cash on Delivery available
                </span>
              ) : (
                <span className="text-blue-600">
                  ✓ Stripe payment available
                </span>
              )}
            </div>
          </div>

          {/***address***/}
          <h3 className="text-lg font-semibold">Choose your address</h3>
          <div className="bg-white p-2 grid gap-4">
            {addressList.map((address, index) => {
              return (
                <label
                  key={address._id}
                  htmlFor={'address' + index}
                  className={!address.status ? 'hidden' : ''}
                >
                  <div className="border rounded p-3 flex gap-3 hover:bg-blue-50">
                    <div>
                      <input
                        id={'address' + index}
                        type="radio"
                        value={index}
                        onChange={(e) => setSelectAddress(e.target.value)}
                        name="address"
                      />
                    </div>
                    <div>
                      <p>{address.address_line}</p>
                      <p>{address.city}</p>
                      <p>{address.state}</p>
                      <p>
                        {address.country} - {address.pincode}
                      </p>
                      <p>{address.mobile}</p>
                    </div>
                  </div>
                </label>
              );
            })}
            <div
              onClick={() => setOpenAddress(true)}
              className="h-16 bg-blue-50 border-2 border-dashed flex justify-center items-center cursor-pointer"
            >
              Add address
            </div>
          </div>
        </div>

        <div className="w-full max-w-md bg-white py-4 px-2">
          {/**summary**/}
          <h3 className="text-lg font-semibold">Summary</h3>
          <div className="bg-white p-4">
            <h3 className="font-semibold">Bill details</h3>
            <div className="flex gap-4 justify-between ml-1">
              <p>Items total</p>
              <p className="flex items-center gap-2">
                <span className="line-through text-neutral-400">
                  {formatPrice(notDiscountTotalPrice)}
                </span>
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
            {selectedCurrency !== 'NGN' && (
              <div className="flex gap-4 justify-between ml-1 text-sm text-gray-500">
                <p>Exchange Rate</p>
                <p>Live rates applied</p>
              </div>
            )}
            <div className="font-semibold flex items-center justify-between gap-4 border-t pt-2 mt-2">
              <p>Grand total</p>
              <p>{formatPrice(totalPrice)}</p>
            </div>
          </div>

          <div className="w-full flex flex-col gap-4">
            <button
              className={`py-2 px-4 rounded text-white font-semibold transition ${
                canProceed && !loading
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              onClick={handleOnlinePayment}
              disabled={!canProceed || loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : selectedCurrency === 'NGN' ? (
                'Pay with Flutterwave'
              ) : (
                `Pay with Stripe (${formatPrice(totalPrice)})`
              )}
            </button>

            {selectedCurrency === 'NGN' && (
              <button
                className={`py-2 px-4 border-2 font-semibold transition ${
                  canProceed && !loading
                    ? 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
                    : 'border-gray-400 text-gray-400 cursor-not-allowed'
                }`}
                onClick={handleCashOnDelivery}
                disabled={!canProceed || loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-green-600 mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Cash on Delivery'
                )}
              </button>
            )}
          </div>

          {!canProceed && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                {cartItemsList.length === 0
                  ? 'Your cart is empty'
                  : 'Please select a delivery address'}
              </p>
            </div>
          )}
        </div>
      </div>

      {openAddress && <AddAddress close={() => setOpenAddress(false)} />}
    </section>
  );
};

export default CheckoutPage;
