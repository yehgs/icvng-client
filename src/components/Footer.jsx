import React, { useState, useEffect } from 'react';
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
import banner1 from '../assets/web-mix-small.png';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';

const PreFooter = () => {
  const [email, setEmail] = useState('');
  const [footerBanner, setFooterBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle subscription logic here
    toast(`Thank you for subscribing with ${email}!`);
    setEmail('');
  };

  // Fetch footer banner from API
  const fetchFooterBanner = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getActiveBanners,
        params: { position: 'footer' },
      });

      if (response.data.success && response.data.data.length > 0) {
        setFooterBanner(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching footer banner:', error);
      // Will fall back to default banner image
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFooterBanner();
  }, []);

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
                className="bg-secondary-100 hover:bg-amber-800 text-white px-4 py-2 rounded-md transition flex items-center justify-center"
              >
                Subscribe <ArrowRight size={16} className="ml-2" />
              </button>
            </form>
            <h3 className="text-xl font-bold mt-8 text-gray-800 md:block hidden">
              Follow Us
            </h3>
            <div className="flex gap-4 mt-4">
              <a href="https://www.facebook.com/Italiancoffeeonline/?ref=pages_you_manage">
                <Facebook size={24} />
              </a>
              <a href="https://twitter.com/italiancoffee_v">
                <Twitter size={24} />
              </a>
              <a href="https://www.instagram.com/italiancofeeventure/">
                <Instagram size={24} />
              </a>
            </div>
          </div>

          {/* Footer Banner or Default Image */}
          <div className="w-full md:w-1/2">
            {loading ? (
              <div className="bg-gray-200 animate-pulse h-48 rounded"></div>
            ) : footerBanner ? (
              footerBanner.link ? (
                <a href={footerBanner.link} className="block">
                  <img
                    src={footerBanner.image}
                    alt={footerBanner.title || 'Footer Banner'}
                    className="w-full h-auto rounded-lg hover:opacity-90 transition-opacity"
                  />
                </a>
              ) : (
                <img
                  src={footerBanner.image}
                  alt={footerBanner.title || 'Footer Banner'}
                  className="w-full h-auto rounded-lg"
                />
              )
            ) : (
              // Default banner when no footer banner is available
              <img
                src={banner1}
                alt="Coffee mix"
                className="w-full h-auto rounded-lg"
              />
            )}
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
            <div className="w-full md:w-2/5 mb-8 md:mb-0">
              <h3 className="text-xl font-bold mb-4">I-Coffee.ng</h3>
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
            <div className="w-full md:w-1/5 mb-8 md:mb-0">
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
            <div className="w-full md:w-1/5 mb-8 md:mb-0">
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
            <div className="w-full md:w-1/5">
              <FooterAccordionItem title="Contact Us">
                <ul>
                  <li className="mb-3 flex items-start">
                    <MapPin size={20} className="mr-2 mt-1 flex-shrink-0" />
                    <span>3 Kafi Street, Alausa, Ikeja, Lagos, Nigeria</span>
                  </li>
                  <li className="mb-3 flex items-center">
                    <Phone size={20} className="mr-2 flex-shrink-0" />
                    <a href="tel:08039827194" className="decoration-none">
                      08039827194
                    </a>
                  </li>
                  <li className="flex items-center">
                    <Mail size={20} className="mr-2 flex-shrink-0" />
                    <a
                      href="mailto:customercare@i-coffee.ng"
                      className="decoration-none"
                    >
                      customercare@i-coffee.ng
                    </a>
                  </li>
                </ul>
              </FooterAccordionItem>
            </div>
          </div>

          {/* Copyright and Payment Methods */}
          <div className="mt-12 pt-6 border-t border-secondary-100">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm mb-4 md:mb-0">
                © 2025 I-Coffee.ng. All rights reserved.
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
