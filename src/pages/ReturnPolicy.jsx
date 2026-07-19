// client/src/pages/ReturnPolicy.jsx
import React from 'react';
import {
  FaUndo,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaMoneyBillWave,
  FaTruck,
  FaShieldAlt,
  FaBox,
  FaPhone,
  FaEnvelope,
  FaInfoCircle,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSitePage } from '../hooks/useSitePage';

const ICONS = { clock: FaClock, box: FaBox, shield: FaShieldAlt, money: FaMoneyBillWave };

const DEFAULT_RETURN_CONDITIONS = [
  { iconKey: 'clock', title: '7-Day Return Window', description: 'Customers must return products within 7 days from the date of purchase.' },
  { iconKey: 'box', title: 'Original Condition', description: 'Products must be returned in their original condition, unopened and unused with all original packaging.' },
  { iconKey: 'shield', title: 'Proof of Purchase', description: 'Original receipt or proof of purchase must be provided with the return.' },
  { iconKey: 'money', title: 'Restocking Fee', description: 'A 20% handling charge per unit and transportation costs will be deducted, except for manufacturing defects.' },
];

const DEFAULT_RETURN_PROCESS = [
  { step: '1', title: 'Contact Customer Service', description: 'Reach out to our support team within 7 days of purchase via phone or email.' },
  { step: '2', title: 'Return Authorization', description: 'Receive a Return Authorization Number and return instructions from our team.' },
  { step: '3', title: 'Package Your Item', description: 'Carefully package the product in its original condition with all accessories and documentation.' },
  { step: '4', title: 'Ship the Product', description: 'Send the package to the designated return address. Keep your tracking number.' },
  { step: '5', title: 'Verification', description: 'Our team will verify the returned product condition upon receipt.' },
  { step: '6', title: 'Refund Processing', description: 'Refund will be issued after verification, with applicable fees deducted.' },
];

const DEFAULT_NON_RETURNABLE = [
  'Products with broken seals or opened packaging', 'Used or damaged products due to customer handling',
  'Products without original packaging or accessories', 'Expired products purchased knowingly',
  'Custom or personalized coffee blends', 'Products beyond the 7-day return window',
];

const DEFAULT_ELIGIBLE_FULL_REFUND = [
  'Manufacturing defects discovered upon delivery', 'Products damaged during shipping',
  'Wrong items shipped by the supplier', 'Products significantly different from description',
  'Products with quality issues reported immediately',
];

const DEFAULTS = {
  heroTitle: 'Return & Refund Policy',
  heroSubtitle: 'Your satisfaction is our priority. Review our return policy to ensure a smooth experience.',
  supplierNoticeTitle: 'Important Notice for Suppliers',
  supplierNoticeText: 'Suppliers registered on I-Coffee platform should ensure they understand and comply with this refund policy to maintain a smooth and transparent transaction process with customers.',
  returnConditions: DEFAULT_RETURN_CONDITIONS,
  returnProcess: DEFAULT_RETURN_PROCESS,
  refundTimelineText: 'Refunds will be issued after verifying the returned product and deducting applicable fees. The refund process typically takes 5-10 business days after we receive and verify your return. The refund will be credited to your original payment method.',
  deductionHandlingFee: '20% of product cost per unit',
  deductionTransportCost: 'Actual shipping costs',
  deductionException: 'No deductions for manufacturing defects',
  eligibleForFullRefund: DEFAULT_ELIGIBLE_FULL_REFUND,
  nonReturnableItems: DEFAULT_NON_RETURNABLE,
  additionalInfo: [
    { label: 'Expired Products', text: 'Expired products must not be delivered to customers. If you receive an expired product, contact us immediately for a full refund.' },
    { label: 'Supplier Responsibility', text: 'Suppliers are responsible for the quality of products they deliver. Returns due to supplier errors will not incur handling fees for customers.' },
    { label: 'Return Shipping', text: 'Customers are responsible for return shipping costs unless the return is due to our error or product defect.' },
    { label: 'Exchange Policy', text: "We currently offer refunds only. If you'd like a different product, please place a new order after receiving your refund." },
  ],
  contactPhone: '+234 800 000 0000',
  contactPhoneHours: 'Mon-Fri: 9AM - 6PM',
  contactEmail: 'support@i-coffee.ng',
  contactEmailNote: 'Response within 24 hours',
};

const ReturnPolicy = () => {
  const { get } = useSitePage('return-policy', DEFAULTS);
  const returnConditions = get('returnConditions', DEFAULT_RETURN_CONDITIONS);
  const returnProcess = get('returnProcess', DEFAULT_RETURN_PROCESS);
  const nonReturnableItems = get('nonReturnableItems', DEFAULT_NON_RETURNABLE);
  const eligibleForFullRefund = get('eligibleForFullRefund', DEFAULT_ELIGIBLE_FULL_REFUND);
  const additionalInfo = get('additionalInfo', DEFAULTS.additionalInfo);

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary-100 to-secondary-200 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <FaUndo className="text-6xl mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{get('heroTitle', DEFAULTS.heroTitle)}</h1>
            <p className="text-xl text-amber-100">{get('heroSubtitle', DEFAULTS.heroSubtitle)}</p>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-yellow-600 text-2xl mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">{get('supplierNoticeTitle', DEFAULTS.supplierNoticeTitle)}</h3>
                <p className="text-yellow-700">{get('supplierNoticeText', DEFAULTS.supplierNoticeText)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Return Conditions */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Return Conditions
            </h2>
            <p className="text-lg text-gray-600">
              Please review these conditions before initiating a return
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {returnConditions.map((condition, index) => {
              const Icon = ICONS[condition.iconKey] || FaClock;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Icon className="text-3xl text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {condition.title}
                      </h3>
                      <p className="text-gray-600">{condition.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Return Process */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                How to Return a Product
              </h2>
              <p className="text-lg text-gray-600">
                Follow these simple steps for a hassle-free return
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {returnProcess.map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-100"
                >
                  <div className="bg-amber-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Refund Details */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <FaMoneyBillWave className="text-4xl text-green-600 mr-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Refund Processing
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Refund Timeline
                </h3>
                <p className="text-gray-600 leading-relaxed">{get('refundTimelineText', DEFAULTS.refundTimelineText)}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Deductions
                </h3>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      <span><strong>Handling Fee:</strong> {get('deductionHandlingFee', DEFAULTS.deductionHandlingFee)}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      <span><strong>Transportation Cost:</strong> {get('deductionTransportCost', DEFAULTS.deductionTransportCost)}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span><strong>Exception:</strong> {get('deductionException', DEFAULTS.deductionException)}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Eligible vs Non-Eligible */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-green-50 rounded-xl p-8 border-2 border-green-200">
                <div className="flex items-center mb-6">
                  <FaCheckCircle className="text-3xl text-green-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-800">
                    Full Refund Eligible
                  </h3>
                </div>
                <ul className="space-y-3">
                  {eligibleForFullRefund.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <FaCheckCircle className="text-green-600 mr-2 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 rounded-xl p-8 border-2 border-red-200">
                <div className="flex items-center mb-6">
                  <FaExclamationTriangle className="text-3xl text-red-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-800">
                    Non-Returnable Items
                  </h3>
                </div>
                <ul className="space-y-3">
                  {nonReturnableItems.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <FaExclamationTriangle className="text-red-600 mr-2 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8">
            <div className="flex items-center mb-6">
              <FaInfoCircle className="text-3xl text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">
                Important Information
              </h2>
            </div>

            <div className="space-y-4 text-gray-700">
              {additionalInfo.map((info, idx) => (
                <div key={idx} className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <p><strong>{info.label}:</strong> {info.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Need Help with a Return?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Our customer service team is here to assist you
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                <FaPhone className="text-3xl mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p className="text-gray-300">{get('contactPhone', DEFAULTS.contactPhone)}</p>
                <p className="text-sm text-gray-400 mt-2">{get('contactPhoneHours', DEFAULTS.contactPhoneHours)}</p>
              </div>

              <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                <FaEnvelope className="text-3xl mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Email Us</h3>
                <p className="text-gray-300">{get('contactEmail', DEFAULTS.contactEmail)}</p>
                <p className="text-sm text-gray-400 mt-2">{get('contactEmailNote', DEFAULTS.contactEmailNote)}</p>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/shop"
                className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Preview */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Still Have Questions?
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Check our FAQ page for more information about returns, shipping, and
            more
          </p>
          <Link
            to="/faq"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            View FAQ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
