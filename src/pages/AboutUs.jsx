// client/src/pages/AboutUs.jsx
import React from 'react';
import {
  FaCoffee,
  FaHandshake,
  FaUsers,
  FaGlobeAfrica,
  FaHeart,
  FaAward,
  FaLightbulb,
  FaRocket,
  FaStar,
  FaShieldAlt,
  FaLeaf,
  FaTruck,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  const values = [
    {
      icon: <FaHeart className="text-5xl text-amber-600" />,
      title: 'Quality First',
      description:
        'We ensure every product meets the highest quality standards for our customers.',
    },
    {
      icon: <FaHandshake className="text-5xl text-amber-600" />,
      title: 'Trust & Integrity',
      description:
        'Building lasting relationships through transparency and ethical practices.',
    },
    {
      icon: <FaLightbulb className="text-5xl text-amber-600" />,
      title: 'Innovation',
      description:
        'Continuously improving our platform to serve you better with cutting-edge technology.',
    },
    {
      icon: <FaUsers className="text-5xl text-amber-600" />,
      title: 'Community',
      description:
        'Fostering a vibrant coffee community connecting suppliers and enthusiasts.',
    },
  ];

  const achievements = [
    {
      icon: <FaUsers className="text-4xl text-amber-600" />,
      number: '797+',
      label: 'Regular Customers',
    },
    {
      icon: <FaCoffee className="text-4xl text-amber-600" />,
      number: '858+',
      label: 'Coffee Products',
    },
    {
      icon: <FaHandshake className="text-4xl text-amber-600" />,
      number: '65+',
      label: 'Local & International Brands',
    },
    {
      icon: <FaGlobeAfrica className="text-4xl text-amber-600" />,
      number: '36+',
      label: 'States Presence (Including FCT)',
    },
  ];

  const whyChooseUs = [
    {
      icon: <FaAward className="text-3xl text-amber-600" />,
      title: 'Premium Quality',
      description:
        'Only the finest coffee products from trusted suppliers make it to our platform.',
    },
    {
      icon: <FaTruck className="text-3xl text-amber-600" />,
      title: 'Fast Delivery',
      description:
        'Multiple delivery options to ensure you get your coffee when you need it.',
    },
    {
      icon: <FaShieldAlt className="text-3xl text-amber-600" />,
      title: 'Secure Shopping',
      description:
        'Safe and secure payment methods with buyer protection guarantee.',
    },
    {
      icon: <FaLeaf className="text-3xl text-amber-600" />,
      title: 'Sustainability',
      description:
        'Supporting sustainable and ethical coffee sourcing practices.',
    },
    {
      icon: <FaStar className="text-3xl text-amber-600" />,
      title: 'Customer Support',
      description:
        '24/7 dedicated support team ready to assist with your queries.',
    },
    {
      icon: <FaRocket className="text-3xl text-amber-600" />,
      title: 'Easy to Use',
      description:
        'User-friendly platform designed for seamless coffee shopping experience.',
    },
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary-100 to-secondary-200 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <FaCoffee className="text-6xl mx-auto mb-6 animate-bounce" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About I-Coffee
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-amber-100">
              Nigeria's Leading Coffee Trading Platform
            </p>
            <p className="text-lg text-amber-50">
              Creating Value for Your Products Since Our Inception
            </p>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Our Mission
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            To revolutionize the coffee industry in Nigeria by creating a
            seamless platform that connects coffee suppliers, businesses, and
            enthusiasts, while ensuring quality, transparency, and mutual
            growth.
          </p>
          <div className="bg-gradient-to-r from-amber-50 to-blue-50 rounded-xl p-8 border-l-4 border-amber-600">
            <p className="text-lg text-gray-700 italic">
              "Creating Value for Your Products" - We bridge the gap between
              coffee suppliers, buyers, and aficionados, fostering a thriving
              coffee culture across Nigeria.
            </p>
          </div>
        </div>
      </div>

      {/* Who We Are */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Who We Are
              </h2>
              <p className="text-lg text-gray-600">
                A passionate team dedicated to the coffee industry
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop"
                  alt="Coffee beans"
                  className="rounded-xl shadow-lg w-full h-auto"
                />
              </div>
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  I-Coffee is Nigeria's first online coffee trading platform - a
                  revolutionary marketplace that emerged with a vision to transform
                  how coffee enthusiasts and businesses connect. We are your
                  one-stop solution for all coffee needs in Nigeria.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Strategically located in Ikeja, Lagos, our delivery office
                  serves as the hub for our extensive logistics distribution
                  network that covers all of Nigeria. With presence in 36 states
                  including Abuja FCT, we ensure your coffee reaches you wherever
                  you are.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Our structured international management team and 35+ dedicated
                  staff members work tirelessly to provide you with the best
                  coffee experience. We maintain a 97% daily successful delivery
                  rate with 5 vehicles dedicated to ensuring your orders arrive
                  promptly and in perfect condition.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Beyond Nigeria, we've expanded our reach to serve customers in
                  Benin, Togo, and Cameroon, making I-Coffee a truly West African
                  coffee destination.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Our Core Values
          </h2>
          <p className="text-lg text-gray-600">
            The principles that guide everything we do
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition transform hover:-translate-y-2"
            >
              <div className="flex justify-center mb-4">{value.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {value.title}
              </h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-gradient-to-r from-secondary-100 to-secondary-200 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Impact
            </h2>
            <p className="text-lg text-amber-100">
              Numbers that reflect our growth and commitment
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {achievement.icon}
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {achievement.number}
                </div>
                <div className="text-amber-100">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Why Choose I-Coffee?
          </h2>
          <p className="text-lg text-gray-600">
            What makes us Nigeria's preferred coffee marketplace
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {whyChooseUs.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Commitment */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-amber-50 to-blue-50 rounded-xl p-8 md:p-12">
              <div className="text-center mb-8">
                <FaLeaf className="text-5xl text-amber-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Our Commitment to You
                </h2>
              </div>

              <div className="space-y-6 text-gray-700">
                <p className="leading-relaxed">
                  At I-Coffee, we're committed to maintaining the highest
                  standards of quality and service. Every product on our
                  platform is carefully vetted to ensure authenticity and
                  excellence.
                </p>
                <p className="leading-relaxed">
                  We work closely with our supplier partners to guarantee that
                  you receive only genuine, fresh products. Our platform
                  facilitates transparent transactions, timely deliveries, and
                  responsive customer support.
                </p>
                <p className="leading-relaxed">
                  Whether you're a coffee shop owner looking for bulk supplies,
                  a business seeking quality machines, or an individual
                  enthusiast exploring new flavors, I-Coffee is your trusted
                  partner in the coffee journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-secondary-100 to-secondary-200 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join the I-Coffee Community
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Whether you're a supplier looking to expand your reach or a coffee
              lover seeking quality products, we're here for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/shop"
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition inline-flex items-center justify-center"
              >
                <FaCoffee className="mr-2" />
                Shop Now
              </Link>
              <Link
                to="/partner-with-us"
                className="bg-white hover:bg-gray-100 text-gray-800 px-8 py-4 rounded-lg font-semibold text-lg transition inline-flex items-center justify-center"
              >
                <FaHandshake className="mr-2" />
                Become a Partner
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;