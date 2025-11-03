// client/src/pages/ShippingPolicy.jsx
import React from 'react';
import {
  FaTruck,
  FaShippingFast,
  FaClock,
  FaGlobeAfrica,
  FaBox,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPhone,
  FaEnvelope,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ShippingPolicy = () => {
  const shippingMethods = [
    {
      icon: <FaShippingFast className="text-4xl text-green-600" />,
      name: 'Standard Shipping',
      delivery: '3-7 business days (domestic)',
      intDelivery: '7-14 business days (international)',
      description: 'Reliable delivery at affordable rates',
    },
    {
      icon: <FaTruck className="text-4xl text-blue-600" />,
      name: 'Express Shipping',
      delivery: '1-3 business days (domestic)',
      intDelivery: '3-5 business days (international)',
      description: 'Faster delivery for urgent orders',
    },
  ];

  const deliveryZones = [
    {
      zone: 'Lagos State',
      time: '1-3 business days',
      freeShipping: '₦100,000+',
      color: 'green',
    },
    {
      zone: 'Other Nigerian States',
      time: '3-7 business days',
      freeShipping: 'N/A',
      color: 'blue',
    },
    {
      zone: 'West Africa (Benin, Togo, Cameroon)',
      time: '7-14 business days',
      freeShipping: 'N/A',
      color: 'purple',
    },
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-700 to-green-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <FaTruck className="text-6xl mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Shipping Policy
            </h1>
            <p className="text-xl text-green-100">
              Fast, reliable delivery across Nigeria and West Africa with a 97%
              success rate
            </p>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">97%</div>
              <div className="text-gray-600">Daily Success Rate</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">5</div>
              <div className="text-gray-600">Delivery Vehicles</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">36</div>
              <div className="text-gray-600">States Coverage</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">4</div>
              <div className="text-gray-600">Countries Served</div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Methods */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Shipping Methods
            </h2>
            <p className="text-lg text-gray-600">
              Choose the delivery option that works best for you
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {shippingMethods.map((method, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition"
              >
                <div className="flex justify-center mb-4">{method.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                  {method.name}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <FaClock className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-800">
                        Domestic Delivery
                      </div>
                      <div className="text-gray-600">{method.delivery}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaGlobeAfrica className="text-blue-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-800">
                        International Delivery
                      </div>
                      <div className="text-gray-600">{method.intDelivery}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic pt-2">
                    {method.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Zones */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Delivery Timeframes
              </h2>
              <p className="text-lg text-gray-600">
                Estimated delivery times by location
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {deliveryZones.map((zone, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-6 border-2 ${
                    zone.color === 'green'
                      ? 'border-green-200 bg-green-50'
                      : zone.color === 'blue'
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-purple-200 bg-purple-50'
                  }`}
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {zone.zone}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <FaClock className="text-gray-600 mr-2" />
                      <span className="text-gray-700">{zone.time}</span>
                    </div>
                    {zone.freeShipping !== 'N/A' && (
                      <div className="flex items-center">
                        <FaCheckCircle className="text-green-600 mr-2" />
                        <span className="text-gray-700">
                          Free shipping on {zone.freeShipping}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Processing & Packaging */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <FaBox className="text-4xl text-green-600 mr-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Order Processing & Packaging
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Processing Time
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Orders are typically processed within 1-5 business days,
                  depending on the supplier's location and product availability.
                  You will receive an email notification when your order has
                  been processed and shipped.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Careful Packaging
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  All products are carefully packaged to ensure safe delivery.
                  We use high-quality packaging materials to protect your coffee
                  products during transit, maintaining freshness and preventing
                  damage.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Tracking Information
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Suppliers will provide tracking information for all orders.
                  You can track your shipment in real-time through your account
                  dashboard or using the tracking link sent via email and SMS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Costs */}
      <div className="bg-green-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              Shipping Costs
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span>
                    Shipping costs vary depending on the shipping method,
                    package weight, and destination
                  </span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span>
                    <strong>Free Shipping:</strong> Available on orders over
                    ₦100,000 within Lagos State
                  </span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span>
                    Final shipping cost will be calculated at checkout based on
                    your location and cart contents
                  </span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span>
                    International shipping costs are calculated based on
                    destination country and package weight
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier & Customer Responsibilities */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Supplier Responsibilities */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Supplier Responsibilities
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span className="text-gray-700">
                    Fulfill orders promptly and accurately
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span className="text-gray-700">
                    Provide regular shipping updates to customers
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span className="text-gray-700">
                    Deliver orders within 24 hours to I-Coffee office
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span className="text-gray-700">
                    Ensure products have minimum 6 months validity
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span className="text-gray-700">
                    Package products securely for safe transport
                  </span>
                </li>
              </ul>
            </div>

            {/* Customer Responsibilities */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Customer Responsibilities
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-700">
                    Provide accurate shipping addresses and contact information
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-700">
                    Receive orders promptly at the specified address
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-700">
                    Inspect products for damage or defects upon delivery
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-700">
                    Report any issues within 24 hours of delivery
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-700">
                    Be available to receive the package or arrange alternative
                    delivery
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start mb-6">
              <FaExclamationTriangle className="text-4xl text-yellow-600 mr-4 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Important Information
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span>
                      Delivery times are estimates and may vary due to factors
                      beyond our control
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span>
                      We are not responsible for delays caused by incorrect
                      shipping addresses
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span>
                      International shipments may be subject to customs
                      regulations and duties
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span>
                      Products not supplied within 24 hours must be refunded by
                      supplier
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span>
                      Contact customer service immediately if you experience any
                      shipping issues
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Questions About Shipping?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Our customer service team is ready to assist you
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                <FaPhone className="text-3xl mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p className="text-gray-300">+234 803 982 7194</p>
              </div>

              <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                <FaEnvelope className="text-3xl mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Email Us</h3>
                <p className="text-gray-300">customercare@i-coffee.ng</p>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/faq"
                className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                View FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;