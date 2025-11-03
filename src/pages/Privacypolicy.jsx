// client/src/pages/PrivacyPolicy.jsx
import React from 'react';
import {
  FaShieldAlt,
  FaLock,
  FaUserShield,
  FaDatabase,
  FaCookie,
  FaEnvelope,
  FaCheckCircle,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  const dataTypes = [
    {
      icon: <FaUserShield className="text-3xl text-amber-600" />,
      title: 'Personal Information',
      items: [
        'Name and contact details',
        'Email address',
        'Phone number',
        'Delivery address',
        'Company information (if applicable)',
      ],
    },
    {
      icon: <FaDatabase className="text-3xl text-amber-600" />,
      title: 'Transaction Data',
      items: [
        'Order history',
        'Payment information',
        'Purchase preferences',
        'Communication records',
        'Account activity',
      ],
    },
    {
      icon: <FaCookie className="text-3xl text-amber-600" />,
      title: 'Technical Data',
      items: [
        'IP address',
        'Browser type and version',
        'Device information',
        'Cookies and usage data',
        'Location data',
      ],
    },
  ];

  const securityMeasures = [
    'SSL encryption for data transmission',
    'Secure payment gateways',
    'Regular security audits',
    'Access controls and authentication',
    'Data backup and recovery systems',
    'Employee training on data protection',
  ];

  const yourRights = [
    {
      title: 'Access',
      description: 'Request a copy of your personal data',
    },
    {
      title: 'Correction',
      description: 'Update or correct inaccurate information',
    },
    {
      title: 'Deletion',
      description: 'Request deletion of your personal data',
    },
    {
      title: 'Portability',
      description: 'Receive your data in a structured format',
    },
    {
      title: 'Object',
      description: 'Object to processing of your data',
    },
    {
      title: 'Withdraw Consent',
      description: 'Withdraw consent for data processing',
    },
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary-100 to-secondary-100 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <FaShieldAlt className="text-6xl mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-blue-100">
              Your privacy is important to us. Learn how we collect, use, and
              protect your information.
            </p>
            <p className="text-sm text-blue-200 mt-4">
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
              Our Commitment to Your Privacy
            </h2>
            <div className="prose max-w-none text-gray-700 space-y-4">
              <p>
                At I-Coffee, we are committed to protecting your privacy and
                ensuring the security of your personal information. This Privacy
                Policy explains how we collect, use, disclose, and safeguard your
                information when you use our platform.
              </p>
              <p>
                By using I-Coffee, you consent to the data practices described in
                this policy. If you do not agree with this policy, please do not
                use our platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What We Collect */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Information We Collect
            </h2>
            <p className="text-lg text-gray-600">
              We collect information to provide better services to our users
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {dataTypes.map((type, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition"
              >
                <div className="flex justify-center mb-4">{type.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                  {type.title}
                </h3>
                <ul className="space-y-2">
                  {type.items.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <FaCheckCircle className="text-green-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How We Use Information */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              How We Use Your Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-600">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Order Processing
                </h3>
                <p className="text-gray-700">
                  Process and fulfill your orders, manage payments, and provide
                  customer support.
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-600">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Communication
                </h3>
                <p className="text-gray-700">
                  Send order confirmations, shipping updates, and respond to your
                  inquiries.
                </p>
              </div>

              <div className="bg-purple-50 rounded-xl p-6 border-l-4 border-purple-600">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Platform Improvement
                </h3>
                <p className="text-gray-700">
                  Analyze usage patterns to improve our services, features, and
                  user experience.
                </p>
              </div>

              <div className="bg-orange-50 rounded-xl p-6 border-l-4 border-orange-600">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Marketing
                </h3>
                <p className="text-gray-700">
                  Send promotional offers, newsletters, and updates (with your
                  consent).
                </p>
              </div>

              <div className="bg-red-50 rounded-xl p-6 border-l-4 border-red-600">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Security & Fraud Prevention
                </h3>
                <p className="text-gray-700">
                  Detect and prevent fraudulent activities, protect against
                  security threats.
                </p>
              </div>

              <div className="bg-indigo-50 rounded-xl p-6 border-l-4 border-indigo-600">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Legal Compliance
                </h3>
                <p className="text-gray-700">
                  Comply with legal obligations and enforce our terms and policies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Measures */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 md:p-12">
            <div className="flex items-center mb-6">
              <FaLock className="text-4xl text-amber-600 mr-4" />
              <h2 className="text-3xl font-bold text-gray-800">
                How We Protect Your Data
              </h2>
            </div>
            <p className="text-gray-700 mb-6">
              We implement industry-standard security measures to protect your
              personal information:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {securityMeasures.map((measure, index) => (
                <div key={index} className="flex items-start">
                  <FaShieldAlt className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{measure}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-600 mt-6 text-sm italic">
              While we strive to protect your information, no method of
              transmission over the internet is 100% secure. We cannot guarantee
              absolute security.
            </p>
          </div>
        </div>
      </div>

      {/* Information Sharing */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              How We Share Your Information
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    With Suppliers
                  </h3>
                  <p className="text-gray-700">
                    We share necessary information with suppliers to fulfill your
                    orders, including delivery address and contact details.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    With Service Providers
                  </h3>
                  <p className="text-gray-700">
                    We work with third-party service providers for payment
                    processing, delivery, and analytics. These providers are
                    contractually obligated to protect your information.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    For Legal Reasons
                  </h3>
                  <p className="text-gray-700">
                    We may disclose information when required by law, to protect
                    our rights, or in response to legal processes.
                  </p>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-gray-800 font-semibold">
                    We do not sell your personal information to third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Your Rights */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Your Privacy Rights
            </h2>
            <p className="text-lg text-gray-600">
              You have control over your personal information
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {yourRights.map((right, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition"
              >
                <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUserShield className="text-2xl text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {right.title}
                </h3>
                <p className="text-gray-600 text-sm">{right.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-700 mb-4">
              To exercise any of these rights, please contact us at:
            </p>
            <a
              href="mailto:customercare@i-coffee.ng"
              className="text-amber-600 hover:text-amber-700 font-semibold"
            >
              customercare@i-coffee.ng
            </a>
          </div>
        </div>
      </div>

      {/* Cookies */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <FaCookie className="text-4xl text-amber-600 mr-4" />
              <h2 className="text-3xl font-bold text-gray-800">
                Cookies and Tracking
              </h2>
            </div>
            <div className="prose max-w-none text-gray-700 space-y-4">
              <p>
                We use cookies and similar tracking technologies to enhance your
                experience on our platform. Cookies are small files stored on your
                device that help us:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Remember your preferences and settings</li>
                <li>Keep you logged into your account</li>
                <li>Analyze how you use our platform</li>
                <li>Provide personalized content and recommendations</li>
                <li>Improve platform performance and security</li>
              </ul>
              <p>
                You can control cookies through your browser settings. However,
                disabling cookies may affect your ability to use certain features
                of our platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Retention */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Data Retention
            </h2>
            <div className="prose max-w-none text-gray-700 space-y-4">
              <p>
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Fulfill the purposes outlined in this Privacy Policy</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain business records</li>
              </ul>
              <p>
                When we no longer need your information, we will securely delete
                or anonymize it in accordance with applicable laws.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Children's Privacy */}
      <div className="bg-yellow-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Children's Privacy
            </h2>
            <p className="text-gray-700">
              Our platform is not intended for children under 18 years of age. We
              do not knowingly collect personal information from children. If you
              believe we have collected information from a child, please contact
              us immediately.
            </p>
          </div>
        </div>
      </div>

      {/* International Transfers */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              International Data Transfers
            </h2>
            <p className="text-gray-700 mb-4">
              Your information may be transferred to and processed in countries
              other than your country of residence. We ensure appropriate
              safeguards are in place to protect your information in accordance
              with this Privacy Policy.
            </p>
            <p className="text-gray-700">
              By using our platform, you consent to the transfer of your
              information to Nigeria and other countries where we operate.
            </p>
          </div>
        </div>
      </div>

      {/* Updates to Policy */}
      <div className="bg-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Updates to This Policy
            </h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. Changes will be
              posted on this page with an updated "Last Updated" date. We
              encourage you to review this policy periodically. Your continued use
              of our platform after changes constitutes acceptance of the updated
              policy.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-secondary-100 to-secondary-200 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FaEnvelope className="text-5xl mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Questions About Privacy?</h2>
            <p className="text-xl text-green-100 mb-8">
              We're here to help with any privacy-related concerns
            </p>
            <div className="space-y-4">
              <p className="text-lg">
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:customercare@i-coffee.ng"
                  className="text-white hover:text-green-200 underline"
                >
                  customercare@i-coffee.ng
                </a>
              </p>
              <p className="text-lg">
                <strong>Phone:</strong>{' '}
                <a
                  href="tel:+2348039827194"
                  className="text-white hover:text-green-200 underline"
                >
                  +234 803 982 7194
                </a>
              </p>
              <p className="text-lg">
                <strong>Address:</strong> 3 Kaffi Street, Alausa, Ikeja, Lagos,
                Nigeria
              </p>
            </div>
            <div className="mt-8">
              <Link
                to="/contact-us"
                className="inline-block bg-white hover:bg-gray-100 text-gray-800 px-8 py-3 rounded-lg font-semibold transition"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related Pages */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Related Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              to="/terms-conditions"
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition"
            >
              <FaShieldAlt className="text-4xl text-amber-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800">Terms & Conditions</h3>
            </Link>
            <Link
              to="/faq"
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition"
            >
              <FaUserShield className="text-4xl text-amber-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800">FAQ</h3>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;