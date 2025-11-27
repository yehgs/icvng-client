// client/src/pages/BankTransferInstructionsPage.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Building2,
  Copy,
  Check,
  Info,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Printer,
  MessageCircle,
  Home,
  ShoppingBag,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { useCurrency } from '../provider/GlobalProvider';
import toast from 'react-hot-toast';

const BankTransferInstructionsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const user = useSelector((state) => state.user);

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
    reference: `ICOFFEE-${Date.now()}-${user._id}`,
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
      setBankDetails(defaultBankDetails);
    }
  }, [location.state]);

  const currentBankDetails = defaultBankDetails;

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied`);
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
      toast.success(`${field} copied`);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Confirmed
            </h1>
            <p className="text-gray-600">
              Complete your payment using bank transfer
            </p>
            {orderDetails && orderDetails.length > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  Order ID: {orderDetails[0]?.orderId}
                </span>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Summary */}
              {totalAmount > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="w-5 h-5 text-gray-700" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Payment Summary
                    </h2>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">
                        Total Amount:
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Details Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Building2 className="w-5 h-5 text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Bank Account Details
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* Bank Name */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">
                        Bank Name
                      </label>
                      <p className="text-base font-semibold text-gray-900">
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
                      className="ml-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy"
                    >
                      {copiedField === 'Bank Name' ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Account Name */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">
                        Account Name
                      </label>
                      <p className="text-base font-semibold text-gray-900">
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
                      className="ml-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy"
                    >
                      {copiedField === 'Account Name' ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Account Number */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-blue-700 uppercase mb-1 block">
                        Account Number
                      </label>
                      <p className="text-xl font-bold text-gray-900 font-mono">
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
                      className="ml-4 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Copy"
                    >
                      {copiedField === 'Account Number' ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Sort Code */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">
                        Sort Code
                      </label>
                      <p className="text-base font-semibold text-gray-900 font-mono">
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
                      className="ml-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy"
                    >
                      {copiedField === 'Sort Code' ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Reference - Important */}
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border-2 border-orange-300">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <label className="text-xs font-bold text-orange-700 uppercase">
                          Payment Reference (Required)
                        </label>
                      </div>
                      <p className="text-lg font-bold text-gray-900 font-mono mb-1">
                        {currentBankDetails.reference}
                      </p>
                      <p className="text-xs text-orange-700 flex items-start gap-1">
                        <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>
                          Include this reference in your transfer description
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          currentBankDetails.reference,
                          'Reference'
                        )
                      }
                      className="ml-4 p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-100 rounded-lg transition-colors"
                      title="Copy"
                    >
                      {copiedField === 'Reference' ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Transfer Instructions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    How to Complete Your Transfer
                  </h3>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: 'Access Your Banking App',
                      desc: 'Log into your mobile banking app or visit your bank',
                    },
                    {
                      step: 2,
                      title: 'Select Transfer Option',
                      desc: 'Choose "Transfer Funds" or "Send Money"',
                    },
                    {
                      step: 3,
                      title: 'Enter Account Details',
                      desc: 'Input the account information shown above',
                    },
                    {
                      step: 4,
                      title: 'Add Payment Reference',
                      desc: `Include reference: ${currentBankDetails.reference}`,
                      important: true,
                    },
                    {
                      step: 5,
                      title: 'Transfer Exact Amount',
                      desc: `Send exactly ${
                        totalAmount > 0
                          ? formatPrice(totalAmount)
                          : 'the order amount'
                      }`,
                    },
                    {
                      step: 6,
                      title: 'Save Your Receipt',
                      desc: 'Keep your transfer confirmation for records',
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
                          item.important
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.step}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Processing Timeline */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-gray-700" />
                  <h3 className="text-base font-semibold text-gray-900">
                    What Happens Next
                  </h3>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      icon: <CheckCircle2 className="w-4 h-4" />,
                      title: 'Order Confirmed',
                      desc: 'Your order received',
                      status: 'complete',
                    },
                    {
                      icon: <Clock className="w-4 h-4" />,
                      title: 'Payment Verification',
                      desc: '24-48 hours',
                      status: 'pending',
                    },
                    {
                      icon: <FileText className="w-4 h-4" />,
                      title: 'Order Processing',
                      desc: 'Items prepared',
                      status: 'upcoming',
                    },
                    {
                      icon: <ShoppingBag className="w-4 h-4" />,
                      title: 'Shipment & Delivery',
                      desc: 'Per delivery timeline',
                      status: 'upcoming',
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          item.status === 'complete'
                            ? 'bg-green-100 text-green-600'
                            : item.status === 'pending'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Support */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Need Help?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Contact us for any questions about your order or payment.
                </p>

                <div className="space-y-2">
                  <a
                    href="tel:08039827194"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    <Phone className="w-4 h-4" />
                    Call Support
                  </a>
                  <a
                    href="mailto:customercare@i-coffee.ng"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    Email Support
                  </a>
                  <button
                    onClick={shareOnWhatsApp}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Share on WhatsApp
                  </button>
                  <button
                    onClick={handlePrintInstructions}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium no-print"
                  >
                    <Printer className="w-4 h-4" />
                    Print Instructions
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Link
                    to="/dashboard/myorders"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    View My Orders
                  </Link>
                  <Link
                    to="/shop"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <Home className="w-4 h-4" />
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gray-900 rounded-lg p-6 text-white">
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Quick Tips
                </h3>
                <ul className="text-sm space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Double-check account details before transferring
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Save this page for reference</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Contact us if transfer takes longer than expected
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Keep your receipt until order is delivered</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Important Notices */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-blue-700" />
                <h4 className="font-semibold text-blue-900">Security Notice</h4>
              </div>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Never share your banking credentials with anyone</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Always verify account details before transferring</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Keep your transfer receipt as proof of payment</span>
                </li>
              </ul>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-orange-700" />
                <h4 className="font-semibold text-orange-900">
                  Important Reminders
                </h4>
              </div>
              <ul className="text-sm text-orange-800 space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Include the payment reference in your transfer</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Transfer the exact amount shown</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Payment verification takes 24-48 hours</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Alternative Methods */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Alternative Transfer Methods
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-lg mb-3 border border-gray-200">
                  <Phone className="w-6 h-6 text-gray-700" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                  Mobile Banking
                </h4>
                <p className="text-xs text-gray-600">
                  Use your bank's mobile app for instant transfers
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-lg mb-3 border border-gray-200">
                  <MessageCircle className="w-6 h-6 text-gray-700" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                  USSD Banking
                </h4>
                <p className="text-xs text-gray-600">
                  Dial your bank's USSD code for quick transfers
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-lg mb-3 border border-gray-200">
                  <Building2 className="w-6 h-6 text-gray-700" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                  Bank Branch
                </h4>
                <p className="text-xs text-gray-600">
                  Visit any bank branch for direct transfers
                </p>
              </div>
            </div>
          </div>

          {/* Thank You Message */}
          <div className="bg-gray-900 rounded-lg p-6 text-white text-center mt-8">
            <h3 className="text-xl font-bold mb-2">
              Thank You for Your Order!
            </h3>
            <p className="text-gray-300 mb-4 text-sm">
              We appreciate your business and look forward to serving you.
            </p>
            <div className="flex justify-center gap-8">
              <div>
                <p className="font-semibold text-sm">Order Processing</p>
                <p className="text-xs text-gray-400">24-48 hours</p>
              </div>
              <div>
                <p className="font-semibold text-sm">Customer Support</p>
                <p className="text-xs text-gray-400">24/7 Available</p>
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
          .bg-gray-50 {
            background: white !important;
          }
          .shadow-sm {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
          button,
          a[href^='tel'],
          a[href^='mailto'],
          a[href^='https://wa.me']
          {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BankTransferInstructionsPage;
