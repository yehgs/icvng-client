// client/src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useGlobalContext, useCurrency } from '../provider/GlobalProvider';
import CurrencySelector from '../components/CurrencySelector';
import CheckoutCartDisplay from '../components/CheckoutCartDisplay';
import AuthModal from '../components/AuthModel';
import { useSelector } from 'react-redux';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaUser,
  FaLock,
  FaCreditCard,
  FaUniversity,
  FaShoppingCart,
} from 'react-icons/fa';

const CheckoutPage = () => {
  const {
    notDiscountTotalPrice,
    totalPrice,
    totalQty,
    fetchCartItem,
    fetchOrder,
    isLoggedIn,
    guestCart,
    fetchAddress,
  } = useGlobalContext();

  const { selectedCurrency, formatPrice, convertPrice, getPaymentMethod } =
    useCurrency();

  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const addressList = useSelector((state) => state.addresses.addressList);
  const [selectAddress, setSelectAddress] = useState(0);
  const cartItemsList = useSelector((state) => state.cartItem.cart);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Guest delivery address - always collected
  const [deliveryAddress, setDeliveryAddress] = useState({
    address_line: '',
    city: '',
    state: '',
    country: 'Nigeria',
    pincode: '',
    mobile: '',
  });

  // Get current cart items based on login status
  const currentCartItems = isLoggedIn ? cartItemsList : guestCart;

  // Convert prices to selected currency
  const convertedTotalPrice = convertPrice(totalPrice);
  const convertedNotDiscountTotalPrice = convertPrice(notDiscountTotalPrice);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setDeliveryAddress((prev) => ({ ...prev, [name]: value }));
  };

  const validateDeliveryAddress = Object.values(deliveryAddress).every(
    (value) => value.trim()
  );

  const handleAuthSuccess = (userData) => {
    toast.success('Welcome! Your cart has been preserved.');
    setShowAuthModal(false);
    // Refresh data after login
    fetchCartItem();
    fetchAddress();
    fetchOrder();
  };

  // Create address if needed
  const getOrCreateAddress = async () => {
    if (addressList.length > 0 && addressList[selectAddress]) {
      return addressList[selectAddress]._id;
    }

    if (!validateDeliveryAddress) {
      throw new Error('Please fill in all delivery address fields');
    }

    const addressResponse = await Axios({
      ...SummaryApi.createAddress,
      data: deliveryAddress,
    });

    if (addressResponse.data.success) {
      fetchAddress();
      return addressResponse.data.data._id;
    } else {
      throw new Error('Failed to create address');
    }
  };

  // Handle Direct Bank Transfer
  const handleDirectBankTransfer = async () => {
    if (selectedCurrency !== 'NGN') {
      toast.error('Direct Bank Transfer is only available for NGN currency');
      return;
    }

    if (!isLoggedIn) {
      toast.error('Please login to complete your order');
      setShowAuthModal(true);
      return;
    }

    try {
      setLoading(true);

      const addressId = await getOrCreateAddress();

      // Generate bank transfer reference
      const bankDetails = {
        bankName: 'First Bank of Nigeria',
        accountName: 'I-Coffee Nigeria Limited',
        accountNumber: '2013456789',
        sortCode: '011',
        reference: `ICOFFEE-${Date.now()}-${user._id}`,
      };

      const response = await Axios({
        ...SummaryApi.directBankTransferOrder,
        data: {
          list_items: currentCartItems,
          addressId: addressId,
          subTotalAmt: totalPrice,
          totalAmt: totalPrice,
          currency: selectedCurrency,
          bankDetails: bankDetails,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success('Order created! Please complete bank transfer.');

        if (fetchCartItem) fetchCartItem();
        if (fetchOrder) fetchOrder();

        navigate('/bank-transfer-instructions', {
          state: {
            orderDetails: responseData.data,
            bankDetails: bankDetails,
            totalAmount: totalPrice,
          },
        });
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Online Payment
  const handleOnlinePayment = async () => {
    if (!isLoggedIn) {
      toast.error('Please login to complete your order');
      setShowAuthModal(true);
      return;
    }

    try {
      setLoading(true);
      toast.loading('Processing payment...');

      const addressId = await getOrCreateAddress();
      const paymentMethod = getPaymentMethod();

      if (paymentMethod === 'stripe') {
        await handleStripePayment(addressId);
      } else {
        await handleFlutterwavePayment(addressId);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
      toast.dismiss();
    }
  };

  const handleStripePayment = async (addressId) => {
    try {
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      const stripePromise = await loadStripe(stripePublicKey);

      const response = await Axios({
        ...SummaryApi.payment_url,
        data: {
          list_items: currentCartItems,
          addressId: addressId,
          subTotalAmt: convertedTotalPrice,
          totalAmt: convertedTotalPrice,
          currency: selectedCurrency,
          paymentMethod: 'stripe',
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        stripePromise.redirectToCheckout({ sessionId: responseData.id });
        if (fetchCartItem) fetchCartItem();
        if (fetchOrder) fetchOrder();
      }
    } catch (error) {
      throw error;
    }
  };

  const handleFlutterwavePayment = async (addressId) => {
    try {
      const response = await Axios({
        ...SummaryApi.flutterwavePaymentController,
        data: {
          list_items: currentCartItems,
          addressId: addressId,
          subTotalAmt: totalPrice,
          totalAmt: totalPrice,
          currency: selectedCurrency,
          paymentMethod: 'flutterwave',
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        window.location.href = responseData.paymentUrl;
        if (fetchCartItem) fetchCartItem();
        if (fetchOrder) fetchOrder();
      }
    } catch (error) {
      throw error;
    }
  };

  // Check if form is valid for proceeding
  const hasValidAddress = isLoggedIn
    ? addressList.length > 0 || validateDeliveryAddress
    : validateDeliveryAddress;

  const canProceed = currentCartItems.length > 0 && hasValidAddress;

  if (currentCartItems.length === 0) {
    return (
      <section className="bg-blue-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <FaShoppingCart className="mx-auto text-gray-400 text-6xl mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some items to your cart before proceeding to checkout.
          </p>
          <Link
            to="/shop"
            className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Checkout</h1>
          <p className="text-gray-600">
            Review your order and complete your purchase
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Display */}
            <CheckoutCartDisplay />

            {/* Authentication Status */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Account Status
                </h3>
                {isLoggedIn ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <FaUser />
                    <span className="text-sm font-medium">
                      Logged in as {user.name}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary-200 text-white rounded-md hover:bg-secondary-100 transition-colors"
                  >
                    <FaUser size={16} />
                    Login / Register
                  </button>
                )}
              </div>

              {!isLoggedIn && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 text-sm">
                    <strong>Note:</strong> You need to login or register to
                    complete your order. Your cart items will be preserved
                    during the login process.
                  </p>
                </div>
              )}
            </div>

            {/* Currency Selector */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Payment Currency
                </h3>
                <CurrencySelector />
              </div>
              <div className="text-sm text-gray-600">
                {selectedCurrency === 'NGN' ? (
                  <div className="space-y-1">
                    <p className="text-green-600">
                      ✓ Flutterwave payment available
                    </p>
                    <p className="text-blue-600">
                      ✓ Direct Bank Transfer available
                    </p>
                  </div>
                ) : (
                  <p className="text-blue-600">✓ Stripe payment available</p>
                )}
              </div>
            </div>

            {/* Delivery Address - Show regardless of login status */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Delivery Address
              </h3>

              {/* Show existing addresses if logged in */}
              {isLoggedIn && addressList.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">
                    Saved Addresses
                  </h4>
                  <div className="grid gap-3">
                    {addressList.map((address, index) => (
                      <label
                        key={address._id}
                        htmlFor={'address' + index}
                        className={!address.status ? 'hidden' : 'block'}
                      >
                        <div className="border rounded-lg p-4 flex gap-3 hover:bg-blue-50 cursor-pointer transition-colors">
                          <input
                            id={'address' + index}
                            type="radio"
                            value={index}
                            onChange={(e) => setSelectAddress(e.target.value)}
                            name="address"
                            className="mt-1"
                          />
                          <div>
                            <p className="font-medium text-gray-800">
                              {address.address_line}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state}, {address.country}{' '}
                              - {address.pincode}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.mobile}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-gray-600 border-t pt-4">
                    Or add a new address below:
                  </div>
                </div>
              )}

              {/* Address form - always shown */}
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line *
                  </label>
                  <input
                    type="text"
                    name="address_line"
                    value={deliveryAddress.address_line}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full address"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={deliveryAddress.city}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter city"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={deliveryAddress.state}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter state"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={deliveryAddress.country}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter country"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={deliveryAddress.pincode}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter postal code"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={deliveryAddress.mobile}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary & Payment */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Items total</span>
                  <div className="text-right">
                    {notDiscountTotalPrice > totalPrice && (
                      <span className="line-through text-gray-400 block text-sm">
                        {formatPrice(notDiscountTotalPrice)}
                      </span>
                    )}
                    <span className="font-medium">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-medium">
                    {totalQty} item{totalQty > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Delivery</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>

                {selectedCurrency !== 'NGN' && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Exchange Rate</span>
                    <span className="text-gray-500">Live rates applied</span>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">
                      Total
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleOnlinePayment}
                  disabled={!canProceed || loading || !isLoggedIn}
                  className={`w-full py-4 px-6 rounded-lg font-semibold transition flex items-center justify-center ${
                    canProceed && isLoggedIn && !loading
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <FaCreditCard className="mr-2" />
                      {selectedCurrency === 'NGN'
                        ? 'Pay with Flutterwave'
                        : 'Pay with Stripe'}
                      {!isLoggedIn && ' (Login Required)'}
                    </>
                  )}
                </button>

                {selectedCurrency === 'NGN' && (
                  <button
                    onClick={handleDirectBankTransfer}
                    disabled={!canProceed || loading || !isLoggedIn}
                    className={`w-full py-4 px-6 border-2 font-semibold rounded-lg transition flex items-center justify-center ${
                      canProceed && isLoggedIn && !loading
                        ? 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                        : 'border-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-600 mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <FaUniversity className="mr-2" />
                        Direct Bank Transfer
                        {!isLoggedIn && ' (Login Required)'}
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Status Messages */}
              {!isLoggedIn && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 text-center">
                    Please login or register to complete your order
                  </p>
                </div>
              )}

              {isLoggedIn && !canProceed && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 text-center">
                    {currentCartItems.length === 0
                      ? 'Your cart is empty'
                      : 'Please fill in your delivery address'}
                  </p>
                </div>
              )}

              {/* Security Notice */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <FaLock />
                  <span>Your information is secure and encrypted</span>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-3">Need Help?</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Free delivery on all orders</p>
                <p>• 24/7 customer support</p>
                <p>• Secure payment processing</p>
                <p>• Order tracking available</p>
              </div>
              <div className="mt-4">
                <Link
                  to="/contact"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Contact Support →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        mode="login"
      />
    </section>
  );
};

export default CheckoutPage;
