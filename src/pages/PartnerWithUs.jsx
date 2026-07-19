// client/src/pages/PartnerWithUs.jsx
import React, { useState } from "react";
import {
  FaHandshake,
  FaChartLine,
  FaShieldAlt,
  FaUsers,
  FaCheckCircle,
  FaCoffee,
  FaRocket,
  FaStore,
  FaMoneyBillWave,
  FaTruck,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaFileContract,
  FaLightbulb,
  FaArrowRight,
} from "react-icons/fa";
import ContactForm from "../components/Contactform";
import CustomerMarquee from "../components/CustomerMarquee";
import { useSitePage } from "../hooks/useSitePage";

const ICONS = { chartLine: FaChartLine, shield: FaShieldAlt, users: FaUsers, rocket: FaRocket, money: FaMoneyBillWave, truck: FaTruck };

const DEFAULT_BENEFITS = [
  { iconKey: "chartLine", title: "Grow Your Business", description: "Reach thousands of coffee enthusiasts across Nigeria and expand your market presence." },
  { iconKey: "shield", title: "Secure Platform", description: "Our platform ensures secure transactions and timely payments within 24 hours." },
  { iconKey: "users", title: "Wide Customer Base", description: "Connect with coffee shops, businesses, and individual coffee lovers nationwide." },
  { iconKey: "rocket", title: "Easy Setup", description: "Get your products online in just 15 days with our streamlined onboarding process." },
  { iconKey: "money", title: "Competitive Rates", description: "Only 10% handling fee with transparent pricing and no hidden costs." },
  { iconKey: "truck", title: "Logistics Support", description: "Free delivery for orders above ₦100,000 within Lagos State." },
];

const DEFAULT_KEY_FEATURES = [
  "Your products listed at your own online prices",
  "Payment within 24 hours of customer payment receipt",
  "Full control over your inventory and pricing",
  "Marketing support through our platform and social media",
  "No upfront costs or listing fees",
  "Dedicated account manager for support",
];

const DEFAULT_HOW_IT_WORKS = [
  { step: "1", title: "Submit Application", description: "Fill out the partnership form with your business details and product information." },
  { step: "2", title: "Review Process", description: "Our team reviews your products within 10 days and provides feedback." },
  { step: "3", title: "Agreement & Setup", description: "Sign the supplier agreement and upload your product catalog with images." },
  { step: "4", title: "Go Live", description: "Your products go live within 15 days and start reaching customers immediately." },
];

const DEFAULT_KEY_TERMS = [
  "10% handling fee on all orders (or agreed distributor price)",
  "Payment within 24 hours of customer payment",
  "Free delivery for orders above ₦100,000 within Lagos",
  "Products must have minimum 6 months validity",
  "Supplier delivers orders within 24 hours to I-Coffee office",
  "One-year renewable contract",
];

const DEFAULT_SUPPLIER_RESPONSIBILITIES = [
  "Ensure compliance with all applicable laws",
  "Maintain accurate records of products and supply",
  "Provide weekly updates of stock, prices, and quantities",
  "Inform platform of promotional sales and price changes",
  "Authorize platform to use logos and brands for marketing",
  "Supply products according to specifications as advertised",
];

const DEFAULT_PLATFORM_RESPONSIBILITIES = [
  "Provide media design specifications",
  "Review products within 10 days",
  "Post products online within 15 days",
  "Make timely payments and remittances",
  "Communicate issues and concerns",
];

const DEFAULTS = {
  heroTitle: "Partner With I-Coffee",
  heroTagline: "Join Nigeria's Leading Coffee Trading Platform",
  heroSubtitle: "Creating Value for Your Products - Connect with thousands of coffee enthusiasts and grow your business with us",
  benefits: DEFAULT_BENEFITS,
  keyFeatures: DEFAULT_KEY_FEATURES,
  howItWorks: DEFAULT_HOW_IT_WORKS,
  keyTerms: DEFAULT_KEY_TERMS,
  supplierResponsibilities: DEFAULT_SUPPLIER_RESPONSIBILITIES,
  platformResponsibilities: DEFAULT_PLATFORM_RESPONSIBILITIES,
  contactAddress: "3, Kaffi Street Alausa, Lagos State",
  contactPhone: "+234 805 242 3935",
  contactPhoneHref: "tel:+2348039827194",
  contactEmail: "partners@i-coffee.ng",
};

const PartnerWithUs = () => {
  const { get } = useSitePage("partner-with-us", DEFAULTS);
  const [showAgreement, setShowAgreement] = useState(false);

  const benefits = get("benefits", DEFAULT_BENEFITS);
  const keyFeatures = get("keyFeatures", DEFAULT_KEY_FEATURES);
  const howItWorks = get("howItWorks", DEFAULT_HOW_IT_WORKS);
  const keyTerms = get("keyTerms", DEFAULT_KEY_TERMS);
  const supplierResponsibilities = get("supplierResponsibilities", DEFAULT_SUPPLIER_RESPONSIBILITIES);
  const platformResponsibilities = get("platformResponsibilities", DEFAULT_PLATFORM_RESPONSIBILITIES);

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary-100 to-secondary-200 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <FaHandshake className="text-6xl mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{get("heroTitle", DEFAULTS.heroTitle)}</h1>
            <p className="text-xl md:text-2xl mb-8 text-amber-100">{get("heroTagline", DEFAULTS.heroTagline)}</p>
            <p className="text-lg mb-8 text-amber-50">{get("heroSubtitle", DEFAULTS.heroSubtitle)}</p>
            <button
              onClick={() =>
                document
                  .getElementById("application-form")
                  .scrollIntoView({ behavior: "smooth" })
              }
              className="bg-white text-amber-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-amber-50 transition inline-flex items-center"
            >
              Apply Now <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
        <CustomerMarquee />
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Why Partner With Us?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join a platform that's revolutionizing the coffee industry in
            Nigeria
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = ICONS[benefit.iconKey] || FaChartLine;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <div className="flex justify-center mb-4">
                  <Icon className="text-4xl text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-center">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple steps to start selling on I-Coffee
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="bg-amber-100 text-amber-700 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                  {index < howItWorks.length - 1 && (
                    <FaArrowRight className="text-amber-600 mx-auto mt-4 hidden lg:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-amber-50 to-blue-50 rounded-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            What You Get
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <FaCheckCircle className="text-amber-600 text-xl flex-shrink-0 mt-1" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Supplier Agreement Preview */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <FaFileContract className="text-5xl text-amber-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Supplier Agreement
              </h2>
              <p className="text-gray-600 mb-6">
                Our partnership is built on transparency and mutual benefit
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Key Terms
                </h3>
                <ul className="space-y-2 text-gray-600">
                  {keyTerms.map((term, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setShowAgreement(!showAgreement)}
                className="text-amber-600 hover:text-amber-700 font-medium flex items-center"
              >
                {showAgreement ? "Hide" : "View"} Full Agreement Details
                <FaArrowRight className="ml-2" />
              </button>

              {showAgreement && (
                <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-4 text-sm text-gray-700">
                  <div>
                    <h4 className="font-semibold mb-2">
                      Supplier Responsibilities:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      {supplierResponsibilities.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">
                      Platform Responsibilities:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      {platformResponsibilities.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div className="container mx-auto px-4 py-16" id="application-form">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Apply to Become a Supplier
            </h2>
            <p className="text-lg text-gray-600">
              Fill out the form below and our team will get back to you within
              48 hours
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <ContactForm formType="partner" />
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Have Questions?</h2>
            <p className="text-lg text-gray-300 mb-8">
              Our partnership team is here to help you get started
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <FaMapMarkerAlt className="text-3xl text-amber-400 mb-3" />
                <h3 className="font-semibold mb-2">Visit Us</h3>
                <p className="text-gray-300 text-sm hover:text-amber-400 duration-300">
                  {get("contactAddress", DEFAULTS.contactAddress)}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <FaPhone className="text-3xl text-amber-400 mb-3" />
                <h3 className="font-semibold mb-2">Call Us</h3>
                <a
                  href={get("contactPhoneHref", DEFAULTS.contactPhoneHref)}
                  className="text-gray-300 text-sm hover:text-amber-400 duration-300"
                >
                  {get("contactPhone", DEFAULTS.contactPhone)}
                </a>
              </div>

              <div className="flex flex-col items-center">
                <FaEnvelope className="text-3xl text-amber-400 mb-3" />
                <h3 className="font-semibold mb-2">Email Us</h3>
                <a
                  href={`mailto:${get("contactEmail", DEFAULTS.contactEmail)}`}
                  className="text-gray-300 text-sm hover:text-amber-400 duration-300"
                >
                  {get("contactEmail", DEFAULTS.contactEmail)}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerWithUs;
