// client/src/components/Footer.jsx
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
import { Link } from 'react-router-dom';
import banner1 from '../assets/web-mix-small.png';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import payment from '../assets/payment.svg';
import foodHygieneRating from '../assets/food-hygiene-rating.webp';
import kosherFood from '../assets/kosher-food.webp';
import ifsFood from '../assets/ifs-food.webp';
import dnvglIso from '../assets/dnvgl-iso9001.webp';

const PreFooter = () => {
  const [email, setEmail] = useState('');
  const [footerBanner, setFooterBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast(`Thank you for subscribing with ${email}!`);
    setEmail('');
  };

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFooterBanner();
  }, []);

  const certifications = [
    { id: 1, src: foodHygieneRating, alt: 'Food Hygiene Rating 5 - Very Good' },
    { id: 2, src: kosherFood, alt: 'Kosher Food Certified' },
    { id: 3, src: ifsFood, alt: 'IFS Food Certified' },
    {
      id: 4,
      src: dnvglIso,
      alt: 'DNV-GL ISO 9001 Quality System Certification',
    },
  ];

  return (
    <div className="bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        {/* Certifications Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Left - Text Content */}
            <div className="w-full md:w-1/2">
              <h3 className="text-xl font-bold mb-2 text-gray-800">
                Quality Certified
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our products meet the highest international standards for food
                safety, quality, and hygiene. Certified by leading regulatory
                bodies worldwide.
              </p>
            </div>

            {/* Right - Certification Badges */}
            <div className="w-full md:w-1/2">
              <div className="grid grid-cols-4 gap-4">
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-gray-50 p-3 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <img
                      src={cert.src}
                      alt={cert.alt}
                      className="h-12 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter and Banner Section */}
        <div className="flex flex-wrap">
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
              <a
                href="https://www.facebook.com/Italiancoffeeonline/?ref=pages_you_manage"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-600 transition"
              >
                <Facebook size={24} />
              </a>
              <a
                href="https://twitter.com/italiancoffee_v"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-600 transition"
              >
                <Twitter size={24} />
              </a>
              <a
                href="https://www.instagram.com/italiancofeeventure/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-600 transition"
              >
                <Instagram size={24} />
              </a>
            </div>
          </div>

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
                Nigeria's first online coffee trading platform. Your one-stop
                solution for premium coffee products, machines, and accessories.
              </p>
              <div className="flex space-x-4 mb-4">
                <a
                  href="https://www.facebook.com/Italiancoffeeonline/?ref=pages_you_manage"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook
                    size={24}
                    className="cursor-pointer hover:text-amber-300 transition"
                  />
                </a>
                <a
                  href="https://twitter.com/italiancoffee_v"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter
                    size={24}
                    className="cursor-pointer hover:text-amber-300 transition"
                  />
                </a>
                <a
                  href="https://www.instagram.com/italiancofeeventure/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram
                    size={24}
                    className="cursor-pointer hover:text-amber-300 transition"
                  />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="w-full md:w-1/5 mb-8 md:mb-0">
              <FooterAccordionItem title="Quick Links">
                <ul>
                  <li className="mb-2">
                    <Link
                      to="/about-us"
                      className="hover:text-amber-300 cursor-pointer transition"
                    >
                      About Us
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/our-story"
                      className="hover:text-amber-300 cursor-pointer transition"
                    >
                      Our Story
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/shop"
                      className="hover:text-amber-300 cursor-pointer transition"
                    >
                      Shop
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/blogs"
                      className="hover:text-amber-300 cursor-pointer transition"
                    >
                      Blog
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/partner-with-us"
                      className="hover:text-amber-300 cursor-pointer transition"
                    >
                      Partner With Us
                    </Link>
                  </li>
                </ul>
              </FooterAccordionItem>
            </div>

            {/* Customer Service */}
            <div className="w-full md:w-1/5 mb-8 md:mb-0">
              <FooterAccordionItem title="Customer Service">
                <ul>
                  <li className="mb-2">
                    <Link
                      to="/contact-us"
                      className="hover:text-amber-300 cursor-pointer transition"
                    >
                      Contact Us
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/faq"
                      className="hover:text-amber-300 cursor-pointer transition"
                    >
                      FAQ
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/shipping-policy"
                      className="hover:text-amber-300 cursor-pointer transition"
                    >
                      Shipping Policy
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/return-policy"
                      className="hover:text-amber-300 cursor-pointer transition"
                    >
                      Returns & Refunds
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/terms-conditions"
                      className="hover:text-amber-300 cursor-pointer transition"
                    >
                      Terms & Conditions
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/privacy-policy"
                      className="hover:text-amber-300 cursor-pointer transition"
                    >
                      Privacy Policy
                    </Link>
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
                    <span>3 Kaffi Street, Alausa, Ikeja, Lagos, Nigeria</span>
                  </li>
                  <li className="mb-3 flex items-center">
                    <Phone size={20} className="mr-2 flex-shrink-0" />
                    <a
                      href="tel:+2348039827194"
                      className="hover:text-amber-300 transition"
                    >
                      +234 803 982 7194
                    </a>
                  </li>
                  <li className="flex items-center">
                    <Mail size={20} className="mr-2 flex-shrink-0" />
                    <a
                      href="mailto:customercare@i-coffee.ng"
                      className="hover:text-amber-300 transition"
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
                © {new Date().getFullYear()} I-Coffee.ng. All rights reserved.
              </div>
              <div className="flex flex-col items-center">
                <span className="mr-2 text-sm space-x-2">Payment Methods:</span>
                <div className="">
                  <img src={payment} alt="payment" className="h-10" />
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
