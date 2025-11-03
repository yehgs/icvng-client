// client/src/pages/ContactUs.jsx
import React from 'react';
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaFacebook,
  FaTwitter,
  FaInstagram,
} from 'react-icons/fa';
import ContactForm from '../components/Contactform';

const ContactUs = () => {
  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="text-3xl text-amber-600" />,
      title: 'Visit Us',
      details: ['3 Kaffi Street, Alausa', 'Ikeja, Lagos', 'Nigeria'],
    },
    {
      icon: <FaPhone className="text-3xl text-amber-600" />,
      title: 'Call Us',
      details: ['+234 803 982 7194'],
      link: 'tel:+2348039827194',
    },
    {
      icon: <FaEnvelope className="text-3xl text-amber-600" />,
      title: 'Email Us',
      details: ['customercare@i-coffee.ng',],
      link: 'mailto:customercare@i-coffee.ng',
    },
    {
      icon: <FaClock className="text-3xl text-amber-600" />,
      title: 'Business Hours',
      details: [
        'Monday - Friday: 8:00 AM - 6:00 PM',
        'Saturday: 9:00 AM - 4:00 PM',
        'Sunday: Closed',
      ],
    },
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary-100 to-secondary-200 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <FaEnvelope className="text-6xl mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-amber-100">
              We'd love to hear from you. Get in touch with our team!
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition"
            >
              <div className="flex justify-center mb-4">{info.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {info.title}
              </h3>
              <div className="text-gray-600 space-y-1">
                {info.details.map((detail, idx) =>
                  info.link && idx === 0 ? (
                    <a
                      key={idx}
                      href={info.link}
                      className="block hover:text-amber-600 transition"
                    >
                      {detail}
                    </a>
                  ) : (
                    <p key={idx} className="text-sm">
                      {detail}
                    </p>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - Map and Form */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Map Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Find Us Here
              </h2>
              <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.2858866938844!2d3.3541295!3d6.6067082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b923f5e2c6b89%3A0x6b8b9c5f7a3e2d4c!2sKaffi%20Street%2C%20Alausa%2C%20Ikeja%2C%20Lagos!5e0!3m2!1sen!2sng!4v1234567890"
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="I-Coffee Location"
                  ></iframe>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Getting Here
                    </h3>
                    <p className="text-gray-600 text-sm">
                      We are conveniently located in the heart of Ikeja, Lagos.
                      Easily accessible by public transportation and private
                      vehicles. Ample parking available.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Landmarks Nearby
                    </h3>
                    <ul className="text-gray-600 text-sm space-y-1">
                      <li>• Alausa Secretariat</li>
                      <li>• Lagos State Government Secretariat</li>
                      <li>• Ikeja City Mall</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Follow Us on Social Media
                </h3>
                <div className="flex space-x-6">
                  <a
                    href="https://www.facebook.com/Italiancoffeeonline/?ref=pages_you_manage"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 transition"
                  >
                    <FaFacebook className="text-3xl" />
                  </a>
                  <a
                    href="https://twitter.com/italiancoffee_v"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-400 transition"
                  >
                    <FaTwitter className="text-3xl" />
                  </a>
                  <a
                    href="https://www.instagram.com/italiancofeeventure/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-pink-600 transition"
                  >
                    <FaInstagram className="text-3xl" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Send Us a Message
              </h2>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <ContactForm formType="contact" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Teaser */}
      <div className="bg-amber-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Have Questions?
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Check out our FAQ page for quick answers to common questions
            </p>
            <a
              href="/faq"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              View FAQ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;