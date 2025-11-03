// client/src/pages/FAQ.jsx
import React, { useState } from 'react';
import {
  FaQuestionCircle,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaShippingFast,
  FaCreditCard,
  FaUndo,
  FaBox,
  FaUserShield,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openQuestion, setOpenQuestion] = useState(null);

  const categories = [
    { id: 'all', name: 'All Questions', icon: <FaQuestionCircle /> },
    { id: 'ordering', name: 'Ordering', icon: <FaBox /> },
    { id: 'shipping', name: 'Shipping', icon: <FaShippingFast /> },
    { id: 'payment', name: 'Payment', icon: <FaCreditCard /> },
    { id: 'returns', name: 'Returns', icon: <FaUndo /> },
    { id: 'account', name: 'Account', icon: <FaUserShield /> },
  ];

  const faqs = [
    {
      category: 'ordering',
      question: 'How do I place an order on I-Coffee?',
      answer:
        'Browse our products, add items to your cart, and proceed to checkout. You can order as a guest or create an account for a faster checkout experience and order tracking.',
    },
    {
      category: 'ordering',
      question: 'Can I modify or cancel my order after placing it?',
      answer:
        'Orders can be modified or cancelled within 2 hours of placement. Contact our customer service immediately at customercare@i-coffee.ng or call +234 803 982 7194.',
    },
    {
      category: 'ordering',
      question: 'What payment methods do you accept?',
      answer:
        'We accept card payments (Visa, Mastercard), bank transfers, and online payment platforms. We also support multi-currency payments for international customers.',
    },
    {
      category: 'ordering',
      question: 'Do you have a minimum order quantity?',
      answer:
        'There is no minimum order quantity for regular customers. However, bulk orders may qualify for special discounts. Contact us for wholesale pricing.',
    },
    {
      category: 'shipping',
      question: 'Which areas do you deliver to?',
      answer:
        'We deliver to all 36 states in Nigeria including Abuja FCT. We also ship to select West African countries including Benin, Togo, and Cameroon.',
    },
    {
      category: 'shipping',
      question: 'How long does delivery take?',
      answer:
        'Standard delivery within Lagos takes 1-3 business days. Other states in Nigeria: 3-7 business days. International deliveries: 7-14 business days depending on location.',
    },
    {
      category: 'shipping',
      question: 'What are your shipping costs?',
      answer:
        'Shipping costs vary by location and order weight. Orders over ₦100,000 within Lagos qualify for free delivery. Check our Shipping Policy page for detailed rates.',
    },
    {
      category: 'shipping',
      question: 'How can I track my order?',
      answer:
        'After your order ships, you will receive a tracking number via email and SMS. You can track your order in real-time through your account dashboard or our tracking page.',
    },
    {
      category: 'shipping',
      question: 'What is your delivery success rate?',
      answer:
        'We maintain a 97% daily successful delivery rate. We have 5 dedicated vehicles and a reliable logistics network covering all of Nigeria.',
    },
    {
      category: 'payment',
      question: 'Is my payment information secure?',
      answer:
        'Yes, absolutely. We use industry-standard SSL encryption and secure payment gateways. We never store your complete card details on our servers.',
    },
    // {
    //   category: 'payment',
    //   question: 'Can I pay with Bitcoin?',
    //   answer:
    //     'Yes! We accept Bitcoin (BTC) payments for both local and international customers. Select BTC as your payment method during checkout.',
    // },
    {
      category: 'payment',
      question: 'Do you offer payment on delivery?',
      answer:
        'Payment on delivery is available for orders within Lagos and select locations. This option will be shown at checkout if available for your delivery address.',
    },
    {
      category: 'payment',
      question: 'Can I get an invoice for my purchase?',
      answer:
        'Yes, an invoice is automatically generated and sent to your email after purchase. You can also download invoices from your account dashboard.',
    },
    {
      category: 'returns',
      question: 'What is your return policy?',
      answer:
        'We accept returns within 7 days of purchase. Products must be in original condition with all packaging and accessories. A 20% restocking fee applies except for manufacturing defects. See our Return Policy page for full details.',
    },
    {
      category: 'returns',
      question: 'How do I initiate a return?',
      answer:
        'Contact customer service within 7 days of receiving your order. Provide your order number and reason for return. We will issue a Return Authorization Number and instructions.',
    },
    {
      category: 'returns',
      question: 'When will I receive my refund?',
      answer:
        'Refunds are processed within 5-10 business days after we receive and verify the returned product. Refunds are credited to your original payment method.',
    },
    {
      category: 'returns',
      question: 'Who pays for return shipping?',
      answer:
        'Customers are responsible for return shipping costs unless the return is due to our error or a defective product. We recommend using a trackable shipping service.',
    },
    {
      category: 'account',
      question: 'Do I need an account to shop?',
      answer:
        'No, you can checkout as a guest. However, creating an account allows you to track orders, save addresses, view order history, and enjoy a faster checkout experience.',
    },
    {
      category: 'account',
      question: 'How do I reset my password?',
      answer:
        'Click "Forgot Password" on the login page. Enter your email address and we will send you a password reset link. Follow the instructions in the email to set a new password.',
    },
    {
      category: 'account',
      question: 'Can I update my delivery address?',
      answer:
        'Yes, you can add, edit, or delete addresses in your account settings. You can also enter a different address during checkout.',
    },
    {
      category: 'account',
      question: 'How do I subscribe to your newsletter?',
      answer:
        'Enter your email in the newsletter subscription box at the bottom of any page. You will receive exclusive offers, coffee tips, and updates about new products.',
    },
    {
      category: 'ordering',
      question: 'What types of coffee products do you sell?',
      answer:
        'We offer a comprehensive range including coffee beans, capsules, ground coffee, instant coffee, coffee machines, accessories, syrups, cold brew makers, and even coffee-themed beauty products. We have 858+ products from 65+ local and international brands.',
    },
    {
      category: 'ordering',
      question: 'Do you offer wholesale or bulk pricing?',
      answer:
        'Yes! We offer competitive wholesale prices for bulk orders. Contact us at customercare@i-coffee.ng or call +234 803 982 7194 to discuss your requirements and pricing.',
    },
    {
      category: 'shipping',
      question: 'Can I schedule a delivery time?',
      answer:
        'While we cannot guarantee specific delivery times, you can add delivery instructions in your order notes. Our team will do their best to accommodate your preferences.',
    },
    {
      category: 'payment',
      question: 'Do you accept international credit cards?',
      answer:
        'Yes, we accept international credit and debit cards. We have a multi-currency payment platform to serve customers beyond Nigeria.',
    },
  ];

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory =
      activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary-100 to-secondary-200 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <FaQuestionCircle className="text-6xl mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-amber-100">
              Find answers to common questions about ordering, shipping,
              payments, and more
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <FaSearch className="absolute left-4 top-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-lg"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition ${
                  activeCategory === category.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-amber-50'
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ List */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FaQuestionCircle className="text-5xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No results found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or browse all questions
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition"
                  >
                    <span className="text-left font-semibold text-gray-800 pr-4">
                      {faq.question}
                    </span>
                    {openQuestion === index ? (
                      <FaChevronUp className="text-amber-600 flex-shrink-0" />
                    ) : (
                      <FaChevronDown className="text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {openQuestion === index && (
                    <div className="px-6 pb-4 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Still Have Questions */}
      <div className="bg-gradient-to-r from-green-700 to-green-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Still Have Questions?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Our customer service team is here to help
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact-us"
                className="bg-white hover:bg-gray-100 text-gray-800 px-8 py-3 rounded-lg font-semibold transition inline-flex items-center justify-center"
              >
                Contact Us
              </Link>
              <a
                href="tel:+2348039827194"
                className="bg-green-600 hover:bg-green-800 text-white px-8 py-3 rounded-lg font-semibold transition inline-flex items-center justify-center border-2 border-white"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Related Pages
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              to="/shipping-policy"
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition"
            >
              <FaShippingFast className="text-4xl text-amber-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800">Shipping Policy</h3>
            </Link>
            <Link
              to="/return-policy"
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition"
            >
              <FaUndo className="text-4xl text-amber-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800">Return Policy</h3>
            </Link>
            <Link
              to="/terms-conditions"
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition"
            >
              <FaUserShield className="text-4xl text-amber-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800">
                Terms & Conditions
              </h3>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;