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
import { useSitePage } from '../hooks/useSitePage';

const ICONS = { userCheck: FaUserCheck, handshake: FaHandshake, shield: FaShieldAlt, balance: FaBalanceScale };

const DEFAULT_SECTIONS = [
  { iconKey: 'userCheck', title: 'Account Terms', content: [
    'You must be at least 18 years old to use this platform',
    'You are responsible for maintaining the security of your account and password',
    'You are responsible for all activities that occur under your account',
    'You must provide accurate and complete information when creating an account',
    'We reserve the right to refuse service or terminate accounts at our discretion',
  ]},
  { iconKey: 'handshake', title: 'Use of Platform', content: [
    'You may use our platform only for lawful purposes',
    'You agree not to use the platform for any fraudulent or illegal activity',
    'You will not interfere with or disrupt the platform or servers',
    'You will not attempt to gain unauthorized access to any part of the platform',
    'You agree to comply with all applicable laws and regulations',
  ]},
  { iconKey: 'shield', title: 'Product Information', content: [
    'We strive to provide accurate product descriptions and images',
    'Product availability and prices are subject to change without notice',
    'We do not guarantee that product descriptions are error-free',
    'Colors and specifications may vary slightly from images shown',
    'All products are supplied by registered suppliers on our platform',
  ]},
  { iconKey: 'balance', title: 'Pricing & Payment', content: [
    'All prices are listed in Nigerian Naira (₦) unless otherwise stated',
    'Prices include applicable taxes unless specified otherwise',
    'We reserve the right to change prices at any time',
    'Payment must be received before order processing begins',
    'We accept multiple payment methods including cards, bank transfer, and Bitcoin',
  ]},
];

// The nine "Detailed Terms" blocks were previously nine separate hardcoded
// <div>s. Folding them into one array — same as `sections` above — is what
// makes them CRUD-editable without a schema change per clause; a country
// can add, remove, or reword a clause (e.g. governing law, currency) here.
const DEFAULT_DETAILED_SECTIONS = [
  { title: 'Orders and Transactions', paragraphs: [
    '<strong>Order Placement:</strong> When you place an order, you are making an offer to purchase products from our registered suppliers. We reserve the right to refuse or cancel any order for any reason.',
    '<strong>Order Confirmation:</strong> Once your order is placed and payment is confirmed, you will receive an order confirmation via email. This constitutes acceptance of your order.',
    '<strong>Commission Structure:</strong> I-Coffee operates on a commission basis, charging suppliers a 10% handling fee on all orders processed through the platform.',
    '<strong>Business-to-Consumer Only:</strong> Our platform is restricted to business-to-final customer sales. Business-to-business arrangements are not permitted without prior authorization.',
  ]},
  { title: 'Shipping and Delivery', paragraphs: [
    'Delivery is subject to our Shipping Policy. Delivery times are estimates and may vary. We are not liable for delays caused by circumstances beyond our control.',
    '<strong>Free Delivery:</strong> Orders with a monetary value of ₦100,000 and above within Lagos are delivered to customers at no transportation cost.',
    '<strong>Coverage:</strong> We deliver to all 36 states in Nigeria including Abuja FCT, and to select countries in West Africa (Benin, Togo, and Cameroon).',
  ]},
  { title: 'Returns and Refunds', paragraphs: [
    'Returns and refunds are subject to our Return Policy. Products must be returned within 7 days of purchase in original condition.',
    '<strong>Restocking Fee:</strong> A 20% handling charge per unit and transportation costs will be deducted from refunds, except in cases of manufacturing defects or supplier error.',
    '<strong>Expired Products:</strong> Expired products must not be delivered to customers. If received, contact us immediately for a full refund.',
  ]},
  { title: 'Supplier Obligations', intro: 'Suppliers registered on our platform must:', list: [
    'Maintain high moral, ethical, and credibility standards',
    'Ensure all products meet the platform\'s quality standards',
    'Deliver orders within 24 hours to I-Coffee office',
    'Provide products with minimum 6 months validity period',
    'Supply products according to specifications as advertised',
    'Inform platform of stock changes and price updates',
    'Not contact customers directly without authorization',
    'Refund orders not supplied within 24 hours',
  ]},
  { title: 'Platform Obligations', intro: 'I-Coffee commits to:', list: [
    'Review supplier products within 10 days of submission',
    'Post approved products online within 15 days',
    'Process payments to suppliers within 24 hours of receipt',
    'Provide media design specifications for product listings',
    'Advertise supplier products on the platform',
    'Communicate issues and concerns promptly',
    'Maintain platform security and functionality',
  ]},
  { title: 'Intellectual Property', paragraphs: [
    'All content on the Platform, including text, graphics, logos, images, and software, is the property of I-Coffee or its suppliers and is protected by intellectual property laws.',
    'Suppliers authorize I-Coffee to use their logos, brands, and product images for advertisements in the online marketing system including social media platforms.',
    'You may not reproduce, distribute, modify, or create derivative works from any content without express written permission.',
  ]},
  { title: 'Limitation of Liability', paragraphs: [
    'To the maximum extent permitted by law, I-Coffee shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.',
    'We do not guarantee uninterrupted or error-free operation of the Platform. The Platform is provided "as is" without warranties of any kind.',
    '<strong>Force Majeure:</strong> Neither party shall be liable for failure or delay in performing obligations due to circumstances beyond reasonable control, including natural disasters, wars, government actions, or supply chain disruptions.',
  ]},
  { title: 'Dispute Resolution', paragraphs: [
    'Any disputes arising from these Terms or your use of the Platform shall be resolved through good faith negotiations.',
    'If disputes cannot be resolved through negotiation, they shall be subject to the dispute resolution process in accordance with the laws of the Federal Republic of Nigeria.',
    '<strong>Governing Law:</strong> These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.',
  ]},
  { title: 'Termination', paragraphs: [
    'We reserve the right to suspend or terminate your access to the Platform at any time, with or without notice, for any reason, including violation of these Terms.',
    "Supplier agreements may be terminated by either party with 15 days' written notice. Contracts are renewable annually unless notification is provided 30 days prior to expiration.",
  ]},
  { title: 'Changes to Terms', paragraphs: [
    'We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the Platform.',
    'Your continued use of the Platform after changes constitutes acceptance of the modified Terms. We encourage you to review these Terms periodically.',
  ]},
];

const DEFAULTS = {
  lastUpdated: 'Last Updated: November 2025',
  introTitle: 'Welcome to I-Coffee',
  introParagraphs: [
    'These Terms and Conditions ("Terms") govern your access to and use of the I-Coffee platform, website, and services (collectively, the "Platform"). By accessing or using our Platform, you agree to be bound by these Terms.',
    "I-Coffee operates as Nigeria's first online coffee trading platform, connecting coffee suppliers with customers across Nigeria and West Africa. Our platform facilitates transactions between registered suppliers and end customers.",
  ],
  introAgreementNotice: 'If you do not agree to these Terms, please do not use our Platform.',
  sections: DEFAULT_SECTIONS,
  detailedSections: DEFAULT_DETAILED_SECTIONS,
  noticeTitle: 'Important Notice',
  noticeParagraphs: [
    'These Terms constitute a legally binding agreement between you and I-Coffee. By using our Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms.',
    'If you have questions about these Terms, please contact us before using the Platform.',
  ],
};

// Renders a small subset of inline HTML (just <strong>) that editors may
// use for emphasis — CMS text stays plain strings everywhere else.
const RichLine = ({ text }) => <span dangerouslySetInnerHTML={{ __html: text }} />;

const TermsConditions = () => {
  const { get } = useSitePage('terms-conditions', DEFAULTS);
  const sections = get('sections', DEFAULT_SECTIONS);
  const detailedSections = get('detailedSections', DEFAULT_DETAILED_SECTIONS);
  const introParagraphs = get('introParagraphs', DEFAULTS.introParagraphs);
  const noticeParagraphs = get('noticeParagraphs', DEFAULTS.noticeParagraphs);

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
            <p className="text-sm text-gray-400 mt-4">{get('lastUpdated', DEFAULTS.lastUpdated)}</p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{get('introTitle', DEFAULTS.introTitle)}</h2>
            <div className="prose max-w-none text-gray-700 space-y-4">
              {introParagraphs.map((p, idx) => <p key={idx}>{p}</p>)}
              <p className="font-semibold text-gray-900">{get('introAgreementNotice', DEFAULTS.introAgreementNotice)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((section, index) => {
              const Icon = ICONS[section.iconKey] || FaUserCheck;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition"
                >
                  <div className="flex items-center mb-6">
                    <Icon className="text-3xl text-amber-600" />
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
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Terms */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {detailedSections.map((section, idx) => (
              <div key={idx}>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{section.title}</h2>
                <div className="prose max-w-none text-gray-700 space-y-3">
                  {section.paragraphs && section.paragraphs.map((p, i) => (
                    <p key={i}><RichLine text={p} /></p>
                  ))}
                  {section.intro && <p>{section.intro}</p>}
                  {section.list && (
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      {section.list.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            ))}
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
                <h3 className="text-xl font-bold text-gray-800 mb-3">{get('noticeTitle', DEFAULTS.noticeTitle)}</h3>
                {noticeParagraphs.map((p, idx) => (
                  <p key={idx} className={idx < noticeParagraphs.length - 1 ? 'text-gray-700 mb-3' : 'text-gray-700'}>{p}</p>
                ))}
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
