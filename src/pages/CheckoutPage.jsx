// src/pages/Complete CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useGlobalContext, useCurrency } from '../provider/GlobalProvider';
import CurrencySelector from '../components/CurrencySelector';
import CheckoutCartDisplay from '../components/CheckoutCartDisplay';
import ShippingMethodSelector from '../components/ShippingMethodSelector';
import AddressFormModal from '../components/AddressFormModal';
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
  FaMapMarkerAlt,
  FaPlus,
  FaEdit,
  FaInfoCircle,
  FaShieldAlt,
  FaCheckCircle,
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

  const {
    selectedCurrency,
    formatPrice,
    convertPrice,
    getPaymentMethod,
    exchangeRates,
  } = useCurrency();

  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const addressList = useSelector((state) => state.addresses.addressList);
  const [selectAddress, setSelectAddress] = useState(0);
  const cartItemsList = useSelector((state) => state.cartItem.cart);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Get current cart items based on login status
  const currentCartItems = isLoggedIn ? cartItemsList : guestCart;

  // Convert prices to selected currency
  const convertedTotalPrice = convertPrice(totalPrice);
  const convertedNotDiscountTotalPrice = convertPrice(notDiscountTotalPrice);
  const convertedShippingCost = convertPrice(shippingCost);

  // Calculate final total with shipping
  const finalTotal = totalPrice + shippingCost;
  const convertedFinalTotal = convertPrice(finalTotal);

  // Calculate discount amount
  const discountAmount = notDiscountTotalPrice - totalPrice;
  const hasDiscount = discountAmount > 0;

  const handleAuthSuccess = (userData) => {
    toast.success('Welcome! Your cart has been preserved.');
    setShowAuthModal(false);
    fetchCartItem();
    fetchAddress();
    fetchOrder();
  };

  // Handle address selection change
  const handleAddressSelect = async (addressIndex) => {
    setSelectAddress(addressIndex);
    const selectedAddr = addressList[addressIndex];
    if (selectedAddr) {
      setSelectedAddressId(selectedAddr._id);

      toast.loading('Loading shipping options...', { id: 'shipping-load' });

      try {
        await fetchShippingMethods(selectedAddr._id, totalPrice);
        toast.dismiss('shipping-load');
      } catch (error) {
        toast.dismiss('shipping-load');
        console.error('Error in address selection:', error);
      }
    }
  };

  // Fetch shipping methods when address changes
  const fetchShippingMethods = async (addressId, orderValue) => {
    try {
      setShippingLoading(true);
      setShippingMethods([]);
      setSelectedShippingMethod(null);
      setShippingCost(0);

      const cartItems = isLoggedIn ? cartItemsList : guestCart;

      if (!cartItems || cartItems.length === 0) {
        throw new Error('No items in cart');
      }

      // DEBUG: Verify orderValue
      console.log('💰 Order Value received:', orderValue);
      if (!orderValue || orderValue === 0) {
        console.warn('⚠️ Warning: orderValue is 0 or undefined!');
      }

      const itemsForShipping = cartItems.map((item) => {
        if (isLoggedIn && item.productId) {
          // Logged in user - use populated productId
          return {
            productId: item.productId._id,
            quantity: item.quantity,
            category: item.productId.category?._id || item.productId.category,
            weight: item.productId.weight || 1,
            name: item.productId.name,
            priceOption: item.priceOption || 'regular',
            selectedPrice: item.selectedPrice || item.productId.price,
          };
        } else {
          // Guest user - use direct product data
          return {
            productId: item.productId || item._id,
            quantity: item.quantity,
            category: item.category?._id || item.category,
            weight: item.weight || 1,
            name: item.name,
            priceOption: item.priceOption || 'regular',
            selectedPrice: item.price,
          };
        }
      });

      const totalWeight = itemsForShipping.reduce((total, item) => {
        const weight = item.weight || 1;
        return total + weight * item.quantity;
      }, 0);

      console.log('Fetching shipping for:', {
        addressId,
        items: itemsForShipping,
        itemCount: itemsForShipping.length,
        orderValue: orderValue,
        totalWeight,
      });

      const response = await Axios({
        url: '/api/shipping/calculate-checkout',
        method: 'post',
        data: {
          addressId,
          items: itemsForShipping,
          orderValue: orderValue,
          totalWeight,
        },
      });

      if (response.data.success) {
        const methods = response.data.data.methods || [];
        setShippingMethods(methods);

        console.log(`Received ${methods.length} shipping methods`);

        if (methods.length > 0) {
          // Auto-select: prefer free shipping, then cheapest
          const freeMethod = methods.find((m) => m.cost === 0);
          const cheapestMethod = methods.reduce((prev, current) =>
            prev.cost < current.cost ? prev : current
          );

          const selectedMethod = freeMethod || cheapestMethod;
          setSelectedShippingMethod(selectedMethod);
          setShippingCost(selectedMethod.cost || 0);

          toast.success(
            `${methods.length} shipping option${
              methods.length > 1 ? 's' : ''
            } available`
          );
        } else {
          toast.error('No shipping methods available for your location');
        }
      }
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
      toast.error(
        error.response?.data?.message || 'Failed to load shipping methods'
      );
      setShippingMethods([]);
      setSelectedShippingMethod(null);
      setShippingCost(0);
    } finally {
      setShippingLoading(false);
    }
  };

  // Handle shipping method selection
  const handleShippingMethodSelect = (method) => {
    setSelectedShippingMethod(method);
    setShippingCost(method.cost || 0);
  };

  // Handle new address creation
  const handleAddressSubmit = async (addressData) => {
    try {
      const response = await Axios({
        ...SummaryApi.createAddress,
        data: addressData,
      });

      if (response.data.success) {
        toast.success('Address saved successfully');
        fetchAddress();
        setShowAddressForm(false);

        // Auto-select the new address
        const newAddressId = response.data.data._id;
        setSelectedAddressId(newAddressId);
        await fetchShippingMethods(newAddressId);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  // Handle address editing
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  // Handle address update
  const handleAddressUpdate = async (addressData) => {
    try {
      const response = await Axios({
        ...SummaryApi.updateAddress,
        data: {
          ...addressData,
          _id: editingAddress._id,
        },
      });

      if (response.data.success) {
        toast.success('Address updated successfully');
        fetchAddress();
        setShowAddressForm(false);
        setEditingAddress(null);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  // Prepare order items helper function
  const prepareOrderItems = () => {
    return currentCartItems.map((item) => {
      if (isLoggedIn && item.productId) {
        return {
          productId: item.productId._id,
          quantity: item.quantity,
          priceOption: item.priceOption || 'regular',
          selectedPrice: item.selectedPrice || item.productId.price,
        };
      } else {
        return {
          productId: item.productId || item._id,
          quantity: item.quantity,
          priceOption: item.priceOption || 'regular',
          selectedPrice: item.price,
        };
      }
    });
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

    if (!validateCheckout()) return;

    try {
      setLoading(true);

      const bankDetails = {
        bankName: import.meta.env.VITE_BANK_NAME || 'ZENITH BANK PLC',
        accountName:
          import.meta.env.VITE_BANK_ACCOUNT_NAME || 'I-COFFEE VENTURES',
        accountNumber: import.meta.env.VITE_BANK_ACCOUNT_NUMBER || '1310523997',
        sortCode: import.meta.env.VITE_BANK_SORT_CODE || '057150042',
        reference: `ICOFFEE-${Date.now()}-${user._id}`,
      };

      const orderItems = prepareOrderItems();

      const response = await Axios({
        ...SummaryApi.directBankTransferOrder,
        data: {
          list_items: orderItems,
          addressId: selectedAddressId,
          subTotalAmt: totalPrice,
          totalAmt: finalTotal,
          shippingCost: shippingCost,
          shippingMethodId: selectedShippingMethod._id,
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
            totalAmount: finalTotal,
            shippingCost: shippingCost,
            shippingMethod: selectedShippingMethod,
          },
        });
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  // Validate checkout form
  const validateCheckout = () => {
    if (!selectedShippingMethod) {
      toast.error('Please select a shipping method');
      return false;
    }

    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return false;
    }

    if (!agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return false;
    }

    return true;
  };

  // Handle Online Payment (Paystack or Stripe)
  const handleOnlinePayment = async () => {
    if (!isLoggedIn) {
      toast.error('Please login to complete your order');
      setShowAuthModal(true);
      return;
    }

    if (!validateCheckout()) return;

    try {
      setLoading(true);
      toast.loading('Processing payment...', { id: 'payment-processing' });

      const paymentMethod = getPaymentMethod();

      if (paymentMethod === 'stripe') {
        await handleStripePayment();
      } else {
        await handlePaystackPayment();
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
      toast.dismiss('payment-processing');
    }
  };

  const handleStripePayment = async () => {
    try {
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

      if (!stripePublicKey) {
        throw new Error('Stripe configuration missing');
      }

      const stripePromise = await loadStripe(stripePublicKey);
      const orderItems = prepareOrderItems();
      const convertedSubTotal = convertPrice(totalPrice, selectedCurrency);
      const convertedShipping = convertPrice(shippingCost, selectedCurrency);
      const convertedTotal = convertPrice(finalTotal, selectedCurrency);
      const exchangeRate = exchangeRates[selectedCurrency] || 1;

      console.log('💰 Sending to Stripe:', {
        currency: selectedCurrency,
        originalNGN: {
          subtotal: totalPrice,
          shipping: shippingCost,
          total: finalTotal,
        },
        converted: {
          subtotal: convertedSubTotal,
          shipping: convertedShipping,
          total: convertedTotal,
        },
        exchangeRate: exchangeRate,
      });

      const response = await Axios({
        ...SummaryApi.payment_url,
        data: {
          list_items: orderItems,
          addressId: selectedAddressId,

          // ✅ Send CONVERTED amounts (what Stripe will charge)
          subTotalAmt: convertedSubTotal,
          totalAmt: convertedTotal,
          shippingCost: convertedShipping,

          // ✅ Send ORIGINAL NGN amounts for record-keeping
          originalAmounts: {
            subTotalAmt: totalPrice,
            shippingCost: shippingCost,
            totalAmt: finalTotal,
          },

          // ✅ Send exchange rate info for admin records
          exchangeRateInfo: {
            rate: exchangeRate,
            fromCurrency: 'NGN',
            toCurrency: selectedCurrency,
            rateSource: 'manual',
            appliedAt: new Date().toISOString(),
          },

          shippingMethodId: selectedShippingMethod._id,
          currency: selectedCurrency, // Target currency
          paymentMethod: 'stripe',
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        await stripePromise.redirectToCheckout({
          sessionId: responseData.id,
        });

        fetchCartItem();
        fetchOrder();
      }
    } catch (error) {
      console.error('Stripe payment error:', error);
      throw error;
    }
  };

  const handlePaystackPayment = async () => {
    try {
      const orderItems = prepareOrderItems();

      // ✅ For Paystack, everything is already in NGN
      const response = await Axios({
        ...SummaryApi.paystackPaymentController,
        data: {
          list_items: orderItems,
          addressId: selectedAddressId,
          subTotalAmt: totalPrice, // Already in NGN
          totalAmt: finalTotal,
          shippingCost: shippingCost,

          // ✅ For NGN, exchange rate is 1:1
          exchangeRateInfo: {
            rate: 1,
            fromCurrency: 'NGN',
            toCurrency: 'NGN',
            rateSource: 'manual',
            appliedAt: new Date().toISOString(),
          },

          shippingMethodId: selectedShippingMethod._id,
          currency: 'NGN',
          paymentMethod: 'paystack',
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        window.location.href = responseData.paymentUrl;
        fetchCartItem();
        fetchOrder();
      }
    } catch (error) {
      console.error('Paystack payment error:', error);
      throw error;
    }
  };

  // Auto-fetch shipping methods when logged in user selects existing address
  useEffect(() => {
    if (isLoggedIn && addressList.length > 0 && addressList[selectAddress]) {
      const selectedAddr = addressList[selectAddress];
      if (currentCartItems.length > 0 && totalPrice > 0) {
        fetchShippingMethods(selectedAddr._id, totalPrice);
      }
      setSelectedAddressId(selectedAddr._id);
    }
  }, [
    isLoggedIn,
    addressList,
    selectAddress,
    currentCartItems.length,
    totalPrice,
  ]);

  // Check if form is valid for proceeding
  const canProceed =
    currentCartItems.length > 0 &&
    selectedAddressId &&
    selectedShippingMethod &&
    agreeToTerms;

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
                      ✓ Paystack payment available (Cards, Bank Transfer)
                    </p>
                    <p className="text-blue-600">
                      ✓ Direct Bank Transfer available
                    </p>
                  </div>
                ) : (
                  <p className="text-blue-600">
                    ✓ Stripe payment available (International cards)
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            {isLoggedIn && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-blue-600" />
                    Delivery Address
                  </h3>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <FaPlus size={14} />
                    Add New Address
                  </button>
                </div>

                {addressList.length > 0 ? (
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
                            onChange={(e) =>
                              handleAddressSelect(parseInt(e.target.value))
                            }
                            name="address"
                            checked={selectAddress === index}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-800">
                                {address.address_line}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleEditAddress(address);
                                }}
                                className="text-blue-600 hover:text-blue-700 p-1"
                                title="Edit address"
                              >
                                <FaEdit size={14} />
                              </button>
                            </div>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state}, {address.country}{' '}
                              - {address.postal_code}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.mobile}
                            </p>
                            {address.is_primary && (
                              <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full mt-1">
                                Primary Address
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaMapMarkerAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">No addresses found</p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FaPlus size={14} />
                      Add Your First Address
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Shipping Method Selector */}
            {selectedAddressId && (
              <ShippingMethodSelector
                selectedAddress={addressList[selectAddress]}
                cartItems={currentCartItems}
                orderValue={totalPrice}
                onMethodSelect={handleShippingMethodSelect}
                selectedMethodId={selectedShippingMethod?._id}
                loading={shippingLoading}
                methods={shippingMethods}
              />
            )}
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
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-medium">
                    {totalQty} item{totalQty > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Shipping</span>
                  <span
                    className={`font-medium ${
                      shippingCost === 0 ? 'text-green-600' : 'text-gray-900'
                    }`}
                  >
                    {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                  </span>
                </div>

                {selectedShippingMethod && (
                  <div className="text-xs text-gray-500">
                    {selectedShippingMethod.name}
                  </div>
                )}

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
                      {formatPrice(finalTotal)}
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
                        ? 'Pay with Paystack'
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
                      : !selectedAddressId
                      ? 'Please select a delivery address'
                      : !selectedShippingMethod
                      ? 'Please select a shipping method'
                      : !agreeToTerms
                      ? 'Please agree to the terms and conditions'
                      : 'Please complete all required fields'}
                  </p>
                </div>
              )}

              {/* Terms and Conditions */}
              {isLoggedIn && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label
                      htmlFor="agreeToTerms"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FaShieldAlt className="text-blue-600" />
                        <span className="font-medium text-gray-800">
                          Terms and Conditions
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        I agree to the{' '}
                        <Link
                          to="/terms-and-conditions"
                          target="_blank"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          Terms and Conditions
                        </Link>
                        ,{' '}
                        <Link
                          to="/privacy-policy"
                          target="_blank"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          Privacy Policy
                        </Link>
                        , and{' '}
                        <Link
                          to="/refund-policy"
                          target="_blank"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          Refund Policy
                        </Link>
                      </p>
                    </label>
                  </div>
                  {/* {!agreeToTerms &&
                    selectedAddressId &&
                    selectedShippingMethod && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                        <FaInfoCircle className="text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-yellow-800">
                          Please agree to the terms and conditions to proceed
                          with your order
                        </p>
                      </div>
                    )} */}
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
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      <AddressFormModal
        isOpen={showAddressForm}
        onClose={() => {
          setShowAddressForm(false);
          setEditingAddress(null);
        }}
        onSubmit={editingAddress ? handleAddressUpdate : handleAddressSubmit}
        initialData={editingAddress}
        loading={loading}
      />

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
