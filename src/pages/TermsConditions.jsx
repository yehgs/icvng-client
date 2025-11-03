// client/src/pages/TermsConditions.jsx
import React from 'react';
import {
  FaFileContract,
  FaShieldAlt,
  FaUserCheck,
  FaExclamationTriangle,
  FaBalanceScale,
  FaHandshake,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const TermsConditions = () => {
  const sections = [
    {
      icon: <FaUserCheck className="text-3xl text-amber-600" />,
      title: 'Account Terms',
      content: [
        'You must be at least 18 years old to use this platform',
        'You are responsible for maintaining the security of your account and password',
        'You are responsible for all activities that occur under your account',
        'You must provide accurate and complete information when creating an account',
        'We reserve the right to refuse service or terminate accounts at our discretion',
      ],
    },
    {
      icon: <FaHandshake className="text-3xl text-amber-600" />,
      title: 'Use of Platform',
      content: [
        'You may use our platform only for lawful purposes',
        'You agree not to use the platform for any fraudulent or illegal activity',
        'You will not interfere with or disrupt the platform or servers',
        'You will not attempt to gain unauthorized access to any part of the platform',
        'You agree to comply with all applicable laws and regulations',
      ],
    },
    {
      icon: <FaShieldAlt className="text-3xl text-amber-600" />,
      title: 'Product Information',
      content: [
        'We strive to provide accurate product descriptions and images',
        'Product availability and prices are subject to change without notice',
        'We do not guarantee that product descriptions are error-free',
        'Colors and specifications may vary slightly from images shown',
        'All products are supplied by registered suppliers on our platform',
      ],
    },
    {
      icon: <FaBalanceScale className="text-3xl text-amber-600" />,
      title: 'Pricing & Payment',
      content: [
        'All prices are listed in Nigerian Naira (₦) unless otherwise stated',
        'Prices include applicable taxes unless specified otherwise',
        'We reserve the right to change prices at any time',
        'Payment must be received before order processing begins',
        'We accept multiple payment methods including cards, bank transfer, and Bitcoin',
      ],
    },
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary-100 to-secondary-200 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <FaFileContract className="text-6xl mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Terms & Conditions
            </h1>
            <p className="text-xl text-gray-300">
              Please read these terms carefully before using our platform
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Last Updated: November 2025
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Welcome to I-Coffee
            </h2>
            <div className="prose max-w-none text-gray-700 space-y-4">
              <p>
                These Terms and Conditions ("Terms") govern your access to and
                use of the I-Coffee platform, website, and services (collectively,
                the "Platform"). By accessing or using our Platform, you agree to
                be bound by these Terms.
              </p>
              <p>
                I-Coffee operates as Nigeria's first online coffee trading
                platform, connecting coffee suppliers with customers across
                Nigeria and West Africa. Our platform facilitates transactions
                between registered suppliers and end customers.
              </p>
              <p className="font-semibold text-gray-900">
                If you do not agree to these Terms, please do not use our
                Platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((section, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition"
              >
                <div className="flex items-center mb-6">
                  {section.icon}
                  <h3 className="text-xl font-bold text-gray-800 ml-4">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Terms */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Orders and Transactions */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Orders and Transactions
              </h2>
              <div className="prose max-w-none text-gray-700 space-y-3">
                <p>
                  <strong>Order Placement:</strong> When you place an order, you
                  are making an offer to purchase products from our registered
                  suppliers. We reserve the right to refuse or cancel any order
                  for any reason.
                </p>
                <p>
                  <strong>Order Confirmation:</strong> Once your order is placed
                  and payment is confirmed, you will receive an order confirmation
                  via email. This constitutes acceptance of your order.
                </p>
                <p>
                  <strong>Commission Structure:</strong> I-Coffee operates on a
                  commission basis, charging suppliers a 10% handling fee on all
                  orders processed through the platform.
                </p>
                <p>
                  <strong>Business-to-Consumer Only:</strong> Our platform is
                  restricted to business-to-final customer sales. Business-to-business
                  arrangements are not permitted without prior authorization.
                </p>
              </div>
            </div>

            {/* Shipping and Delivery */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Shipping and Delivery
              </h2>
              <div className="prose max-w-none text-gray-700 space-y-3">
                <p>
                  Delivery is subject to our Shipping Policy. Delivery times are
                  estimates and may vary. We are not liable for delays caused by
                  circumstances beyond our control.
                </p>
                <p>
                  <strong>Free Delivery:</strong> Orders with a monetary value of
                  ₦100,000 and above within Lagos are delivered to customers at no
                  transportation cost.
                </p>
                <p>
                  <strong>Coverage:</strong> We deliver to all 36 states in Nigeria
                  including Abuja FCT, and to select countries in West Africa
                  (Benin, Togo, and Cameroon).
                </p>
              </div>
            </div>

            {/* Returns and Refunds */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Returns and Refunds
              </h2>
              <div className="prose max-w-none text-gray-700 space-y-3">
                <p>
                  Returns and refunds are subject to our Return Policy. Products
                  must be returned within 7 days of purchase in original condition.
                </p>
                <p>
                  <strong>Restocking Fee:</strong> A 20% handling charge per unit
                  and transportation costs will be deducted from refunds, except
                  in cases of manufacturing defects or supplier error.
                </p>
                <p>
                  <strong>Expired Products:</strong> Expired products must not be
                  delivered to customers. If received, contact us immediately for
                  a full refund.
                </p>
              </div>
            </div>

            {/* Supplier Obligations */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Supplier Obligations
              </h2>
              <div className="prose max-w-none text-gray-700 space-y-3">
                <p>
                  Suppliers registered on our platform must:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintain high moral, ethical, and credibility standards</li>
                  <li>Ensure all products meet the platform's quality standards</li>
                  <li>Deliver orders within 24 hours to I-Coffee office</li>
                  <li>Provide products with minimum 6 months validity period</li>
                  <li>Supply products according to specifications as advertised</li>
                  <li>Inform platform of stock changes and price updates</li>
                  <li>Not contact customers directly without authorization</li>
                  <li>Refund orders not supplied within 24 hours</li>
                </ul>
              </div>
            </div>

            {/* Platform Obligations */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Platform Obligations
              </h2>
              <div className="prose max-w-none text-gray-700 space-y-3">
                <p>I-Coffee commits to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Review supplier products within 10 days of submission</li>
                  <li>Post approved products online within 15 days</li>
                  <li>Process payments to suppliers within 24 hours of receipt</li>
                  <li>Provide media design specifications for product listings</li>
                  <li>Advertise supplier products on the platform</li>
                  <li>Communicate issues and concerns promptly</li>
                  <li>Maintain platform security and functionality</li>
                </ul>
              </div>
            </div>

            {/* Intellectual Property */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Intellectual Property
              </h2>
              <div className="prose max-w-none text-gray-700 space-y-3">
                <p>
                  All content on the Platform, including text, graphics, logos,
                  images, and software, is the property of I-Coffee or its
                  suppliers and is protected by intellectual property laws.
                </p>
                <p>
                  Suppliers authorize I-Coffee to use their logos, brands, and
                  product images for advertisements in the online marketing system
                  including social media platforms.
                </p>
                <p>
                  You may not reproduce, distribute, modify, or create derivative
                  works from any content without express written permission.
                </p>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Limitation of Liability
              </h2>
              <div className="prose max-w-none text-gray-700 space-y-3">
                <p>
                  To the maximum extent permitted by law, I-Coffee shall not be
                  liable for any indirect, incidental, special, consequential, or
                  punitive damages arising from your use of the Platform.
                </p>
                <p>
                  We do not guarantee uninterrupted or error-free operation of the
                  Platform. The Platform is provided "as is" without warranties of
                  any kind.
                </p>
                <p>
                  <strong>Force Majeure:</strong> Neither party shall be liable for
                  failure or delay in performing obligations due to circumstances
                  beyond reasonable control, including natural disasters, wars,
                  government actions, or supply chain disruptions.
                </p>
              </div>
            </div>

            {/* Dispute Resolution */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Dispute Resolution
              </h2>
              <div className="prose max-w-none text-gray-700 space-y-3">
                <p>
                  Any disputes arising from these Terms or your use of the Platform
                  shall be resolved through good faith negotiations.
                </p>
                <p>
                  If disputes cannot be resolved through negotiation, they shall be
                  subject to the dispute resolution process in accordance with the
                  laws of the Federal Republic of Nigeria.
                </p>
                <p>
                  <strong>Governing Law:</strong> These Terms shall be governed by
                  and construed in accordance with the laws of the Federal Republic
                  of Nigeria.
                </p>
              </div>
            </div>

            {/* Termination */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Termination
              </h2>
              <div className="prose max-w-none text-gray-700 space-y-3">
                <p>
                  We reserve the right to suspend or terminate your access to the
                  Platform at any time, with or without notice, for any reason,
                  including violation of these Terms.
                </p>
                <p>
                  Supplier agreements may be terminated by either party with 15
                  days' written notice. Contracts are renewable annually unless
                  notification is provided 30 days prior to expiration.
                </p>
              </div>
            </div>

            {/* Changes to Terms */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Changes to Terms
              </h2>
              <div className="prose max-w-none text-gray-700 space-y-3">
                <p>
                  We reserve the right to modify these Terms at any time. Changes
                  will be effective immediately upon posting to the Platform.
                </p>
                <p>
                  Your continued use of the Platform after changes constitutes
                  acceptance of the modified Terms. We encourage you to review
                  these Terms periodically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-3xl text-yellow-600 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Important Notice
                </h3>
                <p className="text-gray-700 mb-3">
                  These Terms constitute a legally binding agreement between you
                  and I-Coffee. By using our Platform, you acknowledge that you
                  have read, understood, and agree to be bound by these Terms.
                </p>
                <p className="text-gray-700">
                  If you have questions about these Terms, please contact us before
                  using the Platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-secondary-100 to-secondary-200 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Questions About Our Terms?</h2>
            <p className="text-xl text-amber-100 mb-8">
              Contact our team for clarification or assistance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact-us"
                className="bg-white hover:bg-gray-100 text-gray-800 px-8 py-3 rounded-lg font-semibold transition"
              >
                Contact Us
              </Link>
              <Link
                to="/faq"
                className="bg-amber-600 hover:bg-amber-800 text-white px-8 py-3 rounded-lg font-semibold transition border-2 border-white"
              >
                View FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related Pages */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Related Policies
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              to="/privacy-policy"
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition"
            >
              <FaShieldAlt className="text-4xl text-amber-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800">Privacy Policy</h3>
            </Link>
            <Link
              to="/return-policy"
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition"
            >
              <FaHandshake className="text-4xl text-amber-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800">Return Policy</h3>
            </Link>
            <Link
              to="/shipping-policy"
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition"
            >
              <FaBalanceScale className="text-4xl text-amber-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800">Shipping Policy</h3>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;