import React, { useState } from 'react';
import {
  Facebook,
  Twitter,
  Instagram,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from 'lucide-react';

const PreFooter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle subscription logic here
    alert(`Thank you for subscribing with ${email}!`);
    setEmail('');
  };

  return (
    <div className="bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap">
          {/* Newsletter Subscription */}
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Stay Updated
            </h3>
            <p className="text-gray-600 mb-4">
              Subscribe to our newsletter for exclusive offers and coffee tips
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="px-4 py-2 rounded-md border border-gray-300 flex-grow"
                required
              />
              <button
                type="submit"
                className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-md transition flex items-center justify-center"
              >
                Subscribe <ArrowRight size={16} className="ml-2" />
              </button>
            </form>
          </div>

          {/* Product Categories */}
          <div className="w-full md:w-1/2">
            <img src="../assets/web_mix.webp" alt="img coffee mix" />
          </div>
        </div>
      </div>
    </div>
  );
};

const FooterAccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-700 py-3 md:border-none">
      <div
        className="flex justify-between items-center cursor-pointer md:cursor-default"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="md:hidden">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      <div className={`mt-4 md:block ${isOpen ? 'block' : 'hidden'}`}>
        {children}
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <>
      <PreFooter />
      <footer className="bg-secondary-200 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap">
            {/* Company Info */}
            <div className="w-full md:w-1/4 mb-8 md:mb-0">
              <h3 className="text-xl font-bold mb-4">
                Italian Coffee Ventures
              </h3>
              <p className="mb-4">
                Premium coffee products and accessories for coffee enthusiasts
                and professionals.
              </p>
              <div className="flex space-x-4 mb-4">
                <Facebook
                  size={24}
                  className="cursor-pointer hover:text-amber-300"
                />
                <Twitter
                  size={24}
                  className="cursor-pointer hover:text-amber-300"
                />
                <Instagram
                  size={24}
                  className="cursor-pointer hover:text-amber-300"
                />
              </div>
            </div>

            {/* Quick Links */}
            <div className="w-full md:w-1/4 mb-8 md:mb-0">
              <FooterAccordionItem title="Quick Links">
                <ul>
                  <li className="mb-2 hover:text-amber-300 cursor-pointer">
                    About Us
                  </li>
                  <li className="mb-2 hover:text-amber-300 cursor-pointer">
                    Our Story
                  </li>
                  <li className="mb-2 hover:text-amber-300 cursor-pointer">
                    Blog
                  </li>
                  <li className="mb-2 hover:text-amber-300 cursor-pointer">
                    Careers
                  </li>
                  <li className="hover:text-amber-300 cursor-pointer">
                    Partner With Us
                  </li>
                </ul>
              </FooterAccordionItem>
            </div>

            {/* Customer Service */}
            <div className="w-full md:w-1/4 mb-8 md:mb-0">
              <FooterAccordionItem title="Customer Service">
                <ul>
                  <li className="mb-2 hover:text-amber-300 cursor-pointer">
                    Contact Us
                  </li>
                  <li className="mb-2 hover:text-amber-300 cursor-pointer">
                    FAQ
                  </li>
                  <li className="mb-2 hover:text-amber-300 cursor-pointer">
                    Shipping Policy
                  </li>
                  <li className="mb-2 hover:text-amber-300 cursor-pointer">
                    Returns & Refunds
                  </li>
                  <li className="hover:text-amber-300 cursor-pointer">
                    Terms & Conditions
                  </li>
                </ul>
              </FooterAccordionItem>
            </div>

            {/* Contact Information */}
            <div className="w-full md:w-1/4">
              <FooterAccordionItem title="Contact Us">
                <ul>
                  <li className="mb-3 flex items-start">
                    <MapPin size={20} className="mr-2 mt-1 flex-shrink-0" />
                    <span>123 Coffee Avenue, Lagos, Nigeria</span>
                  </li>
                  <li className="mb-3 flex items-center">
                    <Phone size={20} className="mr-2 flex-shrink-0" />
                    <span>+234 123 456 7890</span>
                  </li>
                  <li className="flex items-center">
                    <Mail size={20} className="mr-2 flex-shrink-0" />
                    <a
                      href="mailto:customercare@italiancoffee.ng"
                      className="decoration-none"
                    >
                      customercare@italiancoffee.ng
                    </a>
                  </li>
                </ul>
              </FooterAccordionItem>
            </div>
          </div>

          {/* Copyright and Payment Methods */}
          <div className="mt-12 pt-6 border-t border-amber-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm mb-4 md:mb-0">
                © 2025 Italian Coffee Ventures. All rights reserved.
              </div>
              <div className="flex items-center">
                <span className="mr-2 text-sm">Payment Methods:</span>
                <div className="flex space-x-2">
                  {/* Payment method icons - using placeholders */}
                  <div className="bg-white rounded-md h-6 w-10"></div>
                  <div className="bg-white rounded-md h-6 w-10"></div>
                  <div className="bg-white rounded-md h-6 w-10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
