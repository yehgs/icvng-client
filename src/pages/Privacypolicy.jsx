// client/src/pages/PrivacyPolicy.jsx
import React from "react";
import {
  FaShieldAlt,
  FaLock,
  FaUserShield,
  FaDatabase,
  FaCookie,
  FaEnvelope,
  FaCheckCircle,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSitePage } from "../hooks/useSitePage";

const ICONS = { userShield: FaUserShield, database: FaDatabase, cookie: FaCookie };

const DEFAULT_DATA_TYPES = [
  { iconKey: "userShield", title: "Personal Information", items: ["Name and contact details", "Email address", "Phone number", "Delivery address", "Company information (if applicable)"] },
  { iconKey: "database", title: "Transaction Data", items: ["Order history", "Payment information", "Purchase preferences", "Communication records", "Account activity"] },
  { iconKey: "cookie", title: "Technical Data", items: ["IP address", "Browser type and version", "Device information", "Cookies and usage data", "Location data"] },
];

const DEFAULT_SECURITY_MEASURES = [
  "SSL encryption for data transmission", "Secure payment gateways", "Regular security audits",
  "Access controls and authentication", "Data backup and recovery systems", "Employee training on data protection",
];

const DEFAULT_RIGHTS = [
  { title: "Access", description: "Request a copy of your personal data" },
  { title: "Correction", description: "Update or correct inaccurate information" },
  { title: "Deletion", description: "Request deletion of your personal data" },
  { title: "Portability", description: "Receive your data in a structured format" },
  { title: "Object", description: "Object to processing of your data" },
  { title: "Withdraw Consent", description: "Withdraw consent for data processing" },
];

const DEFAULT_USE_CARDS = [
  { title: "Order Processing", text: "Process and fulfill your orders, manage payments, and provide customer support.", color: "green" },
  { title: "Communication", text: "Send order confirmations, shipping updates, and respond to your inquiries.", color: "blue" },
  { title: "Platform Improvement", text: "Analyze usage patterns to improve our services, features, and user experience.", color: "purple" },
  { title: "Marketing", text: "Send promotional offers, newsletters, and updates (with your consent).", color: "orange" },
  { title: "Security & Fraud Prevention", text: "Detect and prevent fraudulent activities, protect against security threats.", color: "red" },
  { title: "Legal Compliance", text: "Comply with legal obligations and enforce our terms and policies.", color: "indigo" },
];

const DEFAULT_SHARING_SECTIONS = [
  { title: "With Suppliers", text: "We share necessary information with suppliers to fulfill your orders, including delivery address and contact details." },
  { title: "With Service Providers", text: "We work with third-party service providers for payment processing, delivery, and analytics. These providers are contractually obligated to protect your information." },
  { title: "For Legal Reasons", text: "We may disclose information when required by law, to protect our rights, or in response to legal processes." },
];

const DEFAULTS = {
  lastUpdated: "Last Updated: November 2025",
  introParagraphs: [
    "At I-Coffee, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.",
    "By using I-Coffee, you consent to the data practices described in this policy. If you do not agree with this policy, please do not use our platform.",
  ],
  dataTypes: DEFAULT_DATA_TYPES,
  useCards: DEFAULT_USE_CARDS,
  securityIntro: "We implement industry-standard security measures to protect your personal information:",
  securityMeasures: DEFAULT_SECURITY_MEASURES,
  securityDisclaimer: "While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.",
  sharingSections: DEFAULT_SHARING_SECTIONS,
  sharingNotice: "We do not sell your personal information to third parties.",
  yourRights: DEFAULT_RIGHTS,
  rightsContactEmail: "customercare@i-coffee.ng",
  cookiesIntro: "We use cookies and similar tracking technologies to enhance your experience on our platform. Cookies are small files stored on your device that help us:",
  cookiesList: ["Remember your preferences and settings", "Keep you logged into your account", "Analyze how you use our platform", "Provide personalized content and recommendations", "Improve platform performance and security"],
  cookiesOutro: "You can control cookies through your browser settings. However, disabling cookies may affect your ability to use certain features of our platform.",
  retentionIntro: "We retain your personal information for as long as necessary to:",
  retentionList: ["Fulfill the purposes outlined in this Privacy Policy", "Comply with legal obligations", "Resolve disputes and enforce agreements", "Maintain business records"],
  retentionOutro: "When we no longer need your information, we will securely delete or anonymize it in accordance with applicable laws.",
  childrenText: "Our platform is not intended for children under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.",
  transferParagraphs: [
    "Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.",
    "By using our platform, you consent to the transfer of your information to Nigeria and other countries where we operate.",
  ],
  updatesText: 'We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this policy periodically. Your continued use of our platform after changes constitutes acceptance of the updated policy.',
  contactEmail: "customercare@i-coffee.ng",
  contactPhone: "+234 805 242 3935",
  contactPhoneHref: "tel:+2348052423935",
  contactAddress: "3 Kaffi Street, Alausa, Ikeja, Lagos, Nigeria",
};

const CARD_COLOR = {
  green: "bg-green-50 border-green-600", blue: "bg-blue-50 border-blue-600", purple: "bg-purple-50 border-purple-600",
  orange: "bg-orange-50 border-orange-600", red: "bg-red-50 border-red-600", indigo: "bg-indigo-50 border-indigo-600",
};

const PrivacyPolicy = () => {
  const { get } = useSitePage("privacy-policy", DEFAULTS);
  const dataTypes = get("dataTypes", DEFAULT_DATA_TYPES);
  const useCards = get("useCards", DEFAULT_USE_CARDS);
  const securityMeasures = get("securityMeasures", DEFAULT_SECURITY_MEASURES);
  const sharingSections = get("sharingSections", DEFAULT_SHARING_SECTIONS);
  const yourRights = get("yourRights", DEFAULT_RIGHTS);
  const introParagraphs = get("introParagraphs", DEFAULTS.introParagraphs);
  const cookiesList = get("cookiesList", DEFAULTS.cookiesList);
  const retentionList = get("retentionList", DEFAULTS.retentionList);
  const transferParagraphs = get("transferParagraphs", DEFAULTS.transferParagraphs);

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary-100 to-secondary-100 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <FaShieldAlt className="text-6xl mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-xl text-blue-100">
              Your privacy is important to us. Learn how we collect, use, and
              protect your information.
            </p>
            <p className="text-sm text-blue-200 mt-4">{get("lastUpdated", DEFAULTS.lastUpdated)}</p>
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
              {introParagraphs.map((p, idx) => <p key={idx}>{p}</p>)}
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
            {dataTypes.map((type, index) => {
              const Icon = ICONS[type.iconKey] || FaUserShield;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition"
                >
                  <div className="flex justify-center mb-4">
                    <Icon className="text-3xl text-amber-600" />
                  </div>
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
              );
            })}
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
              {useCards.map((card, idx) => (
                <div key={idx} className={`rounded-xl p-6 border-l-4 ${CARD_COLOR[card.color] || CARD_COLOR.green}`}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">{card.title}</h3>
                  <p className="text-gray-700">{card.text}</p>
                </div>
              ))}
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
            <p className="text-gray-700 mb-6">{get("securityIntro", DEFAULTS.securityIntro)}</p>
            <div className="grid md:grid-cols-2 gap-4">
              {securityMeasures.map((measure, index) => (
                <div key={index} className="flex items-start">
                  <FaShieldAlt className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{measure}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-600 mt-6 text-sm italic">{get("securityDisclaimer", DEFAULTS.securityDisclaimer)}</p>
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
                {sharingSections.map((s, idx) => (
                  <div key={idx}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{s.title}</h3>
                    <p className="text-gray-700">{s.text}</p>
                  </div>
                ))}

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-gray-800 font-semibold">{get("sharingNotice", DEFAULTS.sharingNotice)}</p>
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
              href={`mailto:${get("rightsContactEmail", DEFAULTS.rightsContactEmail)}`}
              className="text-amber-600 hover:text-amber-700 font-semibold"
            >
              {get("rightsContactEmail", DEFAULTS.rightsContactEmail)}
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
              <p>{get("cookiesIntro", DEFAULTS.cookiesIntro)}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {cookiesList.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
              <p>{get("cookiesOutro", DEFAULTS.cookiesOutro)}</p>
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
              <p>{get("retentionIntro", DEFAULTS.retentionIntro)}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {retentionList.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
              <p>{get("retentionOutro", DEFAULTS.retentionOutro)}</p>
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
            <p className="text-gray-700">{get("childrenText", DEFAULTS.childrenText)}</p>
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
            {transferParagraphs.map((p, idx) => (
              <p key={idx} className={idx === 0 ? "text-gray-700 mb-4" : "text-gray-700"}>{p}</p>
            ))}
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
            <p className="text-gray-700">{get("updatesText", DEFAULTS.updatesText)}</p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-secondary-100 to-secondary-200 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FaEnvelope className="text-5xl mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Questions About Privacy?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              We're here to help with any privacy-related concerns
            </p>
            <div className="space-y-4">
              <p className="text-lg">
                <strong>Email:</strong>{" "}
                <a
                  href={`mailto:${get("contactEmail", DEFAULTS.contactEmail)}`}
                  className="text-white hover:text-green-200 underline"
                >
                  {get("contactEmail", DEFAULTS.contactEmail)}
                </a>
              </p>
              <p className="text-lg">
                <strong>Phone:</strong>{" "}
                <a
                  href={get("contactPhoneHref", DEFAULTS.contactPhoneHref)}
                  className="text-white hover:text-green-200 underline"
                >
                  {get("contactPhone", DEFAULTS.contactPhone)}
                </a>
              </p>
              <p className="text-lg">
                <strong>Address:</strong> {get("contactAddress", DEFAULTS.contactAddress)}
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
              <h3 className="font-semibold text-gray-800">
                Terms & Conditions
              </h3>
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
