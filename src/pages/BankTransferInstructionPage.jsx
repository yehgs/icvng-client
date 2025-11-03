// client/src/pages/BankTransferInstructionPage.jsx  sample pages
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  FaUniversity,
  FaCopy,
  FaCheck,
  FaInfoCircle,
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaFileInvoice,
  FaPrint,
  FaWhatsapp,
  FaHome,
  FaShoppingBag,
} from 'react-icons/fa';
import { useCurrency } from '../provider/GlobalProvider';
import toast from 'react-hot-toast';

const BankTransferInstructionsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [copiedField, setCopiedField] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  // Default bank details
  const defaultBankDetails = {
    bankName: 'ZENITH BANK',
    accountName: 'I-COFFEE VENTURES',
    accountNumber: '1310523997',
    sortCode: '057150042',
    reference: `ICOFFEE-${Date.now()}`,
  }; 

  useEffect(() => {
    // Get data from location state or sessionStorage
    const stateData = location.state;
    const sessionData = sessionStorage.getItem('bankTransferDetails');

    if (stateData) {
      setOrderDetails(stateData.orderDetails);
      setBankDetails(stateData.bankDetails);
      setTotalAmount(stateData.totalAmount);
    } else if (sessionData) {
      try {
        const parsedData = JSON.parse(sessionData);
        setBankDetails(parsedData);
      } catch (error) {
        console.error('Error parsing session data:', error);
        setBankDetails(defaultBankDetails);
      }
    } else {
      // Set default bank details if no data is available
      setBankDetails(defaultBankDetails);
    }
  }, [location.state]);

  const currentBankDetails = bankDetails || defaultBankDetails;

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard`);

      setTimeout(() => setCopiedField(''), 2000);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      setCopiedField(field);
      toast.success(`${field} copied to clipboard`);
      setTimeout(() => setCopiedField(''), 2000);
    }
  };

  const handlePrintInstructions = () => {
    window.print();
  };

  const shareOnWhatsApp = () => {
    const message = `I-Coffee Order Payment Details:
Bank: ${currentBankDetails.bankName}
Account: ${currentBankDetails.accountName}
Account Number: ${currentBankDetails.accountNumber}
Reference: ${currentBankDetails.reference}
Amount: ${totalAmount > 0 ? formatPrice(totalAmount) : 'See order details'}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-green-600 text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-lg text-gray-600">
              Complete your payment using bank transfer
            </p>
            {orderDetails && orderDetails.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Order ID: {orderDetails[0]?.orderId}
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary */}
              {totalAmount > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FaFileInvoice className="mr-3 text-blue-600" />
                    Payment Summary
                  </h2>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-700">
                        Total Amount to Transfer:
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Details Card */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FaUniversity className="mr-3 text-blue-600" />
                  Bank Account Details
                </h2>

                <div className="space-y-4">
                  {/* Bank Name */}
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Bank Name
                      </label>
                      <p className="text-lg font-semibold text-gray-800 mt-1">
                        {currentBankDetails.bankName}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          currentBankDetails.bankName,
                          'Bank Name'
                        )
                      }
                      className="ml-4 p-3 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Copy bank name"
                    >
                      {copiedField === 'Bank Name' ? (
                        <FaCheck className="text-green-600" />
                      ) : (
                        <FaCopy />
                      )}
                    </button>
                  </div>

                  {/* Account Name */}
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Account Name
                      </label>
                      <p className="text-lg font-semibold text-gray-800 mt-1">
                        {currentBankDetails.accountName}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          currentBankDetails.accountName,
                          'Account Name'
                        )
                      }
                      className="ml-4 p-3 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Copy account name"
                    >
                      {copiedField === 'Account Name' ? (
                        <FaCheck className="text-green-600" />
                      ) : (
                        <FaCopy />
                      )}
                    </button>
                  </div>

                  {/* Account Number */}
                  <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Account Number
                      </label>
                      <p className="text-2xl font-bold text-gray-800 mt-1 font-mono">
                        {currentBankDetails.accountNumber}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          currentBankDetails.accountNumber,
                          'Account Number'
                        )
                      }
                      className="ml-4 p-3 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Copy account number"
                    >
                      {copiedField === 'Account Number' ? (
                        <FaCheck className="text-green-600" />
                      ) : (
                        <FaCopy />
                      )}
                    </button>
                  </div>

                  {/* Sort Code */}
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Sort Code
                      </label>
                      <p className="text-lg font-semibold text-gray-800 mt-1 font-mono">
                        {currentBankDetails.sortCode}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          currentBankDetails.sortCode,
                          'Sort Code'
                        )
                      }
                      className="ml-4 p-3 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Copy sort code"
                    >
                      {copiedField === 'Sort Code' ? (
                        <FaCheck className="text-green-600" />
                      ) : (
                        <FaCopy />
                      )}
                    </button>
                  </div>

                  {/* Reference - Most Important */}
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <div className="flex-1">
                      <label className="text-sm font-bold text-red-700 uppercase tracking-wide flex items-center">
                        <FaExclamationTriangle className="mr-2" />
                        Payment Reference (REQUIRED)
                      </label>
                      <p className="text-xl font-bold text-red-800 mt-1 font-mono">
                        {currentBankDetails.reference}
                      </p>
                      <p className="text-xs text-red-600 mt-2">
                        ⚠️ You MUST include this reference in your transfer
                        description
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          currentBankDetails.reference,
                          'Reference'
                        )
                      }
                      className="ml-4 p-3 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                      title="Copy reference"
                    >
                      {copiedField === 'Reference' ? (
                        <FaCheck className="text-green-600" />
                      ) : (
                        <FaCopy />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Transfer Instructions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                  <FaInfoCircle className="mr-3" />
                  How to Complete Your Transfer
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        Access Your Banking App
                      </h4>
                      <p className="text-gray-600">
                        Log into your mobile banking app or visit your bank
                        branch
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        Select Transfer Option
                      </h4>
                      <p className="text-gray-600">
                        Choose "Transfer Funds" or "Send Money" option
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        Enter Account Details
                      </h4>
                      <p className="text-gray-600">
                        Input the bank account information exactly as shown
                        above
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-800">
                        Add Payment Reference
                      </h4>
                      <p className="text-red-600">
                        <strong>CRITICAL:</strong> Include reference{' '}
                        <code className="bg-red-100 px-2 py-1 rounded text-sm font-mono">
                          {currentBankDetails.reference}
                        </code>{' '}
                        in the transfer description/narration field
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      5
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        Transfer Exact Amount
                      </h4>
                      <p className="text-gray-600">
                        Send exactly{' '}
                        <strong className="text-green-600">
                          {totalAmount > 0
                            ? formatPrice(totalAmount)
                            : 'the amount shown in your order'}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      6
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        Save Your Receipt
                      </h4>
                      <p className="text-gray-600">
                        Keep your transfer confirmation for your records
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Processing Timeline */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaClock className="mr-2 text-green-600" />
                  What Happens Next?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Order Confirmed
                      </p>
                      <p className="text-xs text-gray-500">
                        Your order has been received
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-yellow-100 text-yellow-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Payment Verification
                      </p>
                      <p className="text-xs text-gray-500">
                        24-48 hours after transfer
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Order Processing
                      </p>
                      <p className="text-xs text-gray-500">
                        Items prepared for shipping
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      4
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Shipment & Delivery
                      </p>
                      <p className="text-xs text-gray-500">
                        According to delivery timeline
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Support */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Need Help?
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Our support team is here to help with your bank transfer or
                  any questions about your order.
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:+2348000000000"
                    className="flex items-center justify-center w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaPhone className="mr-2" />
                    <span className="font-medium">Call Support</span>
                  </a>
                  <a
                    href="mailto:support@i-coffee.ng"
                    className="flex items-center justify-center w-full px-4 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <FaEnvelope className="mr-2" />
                    <span className="font-medium">Email Support</span>
                  </a>
                  <button
                    onClick={shareOnWhatsApp}
                    className="flex items-center justify-center w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <FaWhatsapp className="mr-2" />
                    <span className="font-medium">Share on WhatsApp</span>
                  </button>
                  <button
                    onClick={handlePrintInstructions}
                    className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FaPrint className="mr-2" />
                    <span className="font-medium">Print Instructions</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link
                    to="/account/orders"
                    className="flex items-center justify-center w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <FaShoppingBag className="mr-2" />
                    View My Orders
                  </Link>
                  <Link
                    to="/shop"
                    className="flex items-center justify-center w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    <FaHome className="mr-2" />
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Bank Transfer Tips */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-3">💡 Quick Tips</h3>
                <ul className="text-sm space-y-2 text-purple-100">
                  <li>• Double-check account details before transferring</li>
                  <li>• Save this page for reference</li>
                  <li>• Contact us if transfer takes longer than expected</li>
                  <li>• Keep your receipt until order is delivered</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Important Notices */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                <FaInfoCircle className="mr-2" />
                Security Notice
              </h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>• Never share your banking credentials with anyone</li>
                <li>• Always verify account details before transferring</li>
                <li>• Keep your transfer receipt as proof of payment</li>
                <li>• Contact us immediately if you have concerns</li>
              </ul>
            </div>

            {/* Processing Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
                <FaExclamationTriangle className="mr-2" />
                Important Reminders
              </h4>
              <ul className="text-sm text-amber-700 space-y-2">
                <li>• Include the payment reference in your transfer</li>
                <li>• Transfer the exact amount shown</li>
                <li>• Orders without proper references may be delayed</li>
                <li>• Payment verification takes 24-48 hours</li>
              </ul>
            </div>
          </div>

          {/* Additional Banking Information */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Alternative Transfer Methods
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Mobile Banking
                </h4>
                <p className="text-sm text-gray-600">
                  Use your bank's mobile app for instant transfers
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <h4 className="font-semibold text-gray-800 mb-2">
                  USSD Banking
                </h4>
                <p className="text-sm text-gray-600">
                  Dial your bank's USSD code for quick transfers
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Bank Branch
                </h4>
                <p className="text-sm text-gray-600">
                  Visit any bank branch for direct transfers
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white text-center mt-8">
            <h3 className="text-xl font-bold mb-2">
              Thank You for Your Order!
            </h3>
            <p className="text-green-100 mb-4">
              We appreciate your business and look forward to serving you again.
            </p>
            <div className="flex justify-center space-x-4">
              <div className="text-center">
                <p className="font-semibold">Order Processing</p>
                <p className="text-sm text-green-100">24-48 hours</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">Customer Support</p>
                <p className="text-sm text-green-100">24/7 Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
          }

          .bg-gradient-to-br {
            background: white !important;
          }

          .shadow-lg {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }

          .rounded-xl {
            border-radius: 0.5rem !important;
          }

          .text-white {
            color: black !important;
          }

          .bg-gradient-to-r {
            background: #f3f4f6 !important;
            color: black !important;
          }

          button {
            display: none !important;
          }

          a[href^="tel"], a[href^="mailto"], a[href^="https://wa.me"]
          {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BankTransferInstructionsPage;
