import React from 'react';
import { Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary-200 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap">
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-4">Italian Coffee Ventures</h3>
            <p>Your one-stop shop for all things coffee.</p>
          </div>
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul>
              <li className="mb-2 hover:text-gray-300 cursor-pointer">
                About Us
              </li>
              <li className="mb-2 hover:text-gray-300 cursor-pointer">
                Contact
              </li>
              <li className="mb-2 hover:text-gray-300 cursor-pointer">FAQ</li>
              <li className="hover:text-gray-300 cursor-pointer">
                Shipping Policy
              </li>
            </ul>
          </div>
          <div className="w-full md:w-1/3">
            <h3 className="text-lg font-bold mb-4">Stay Connected</h3>
            <div className="flex space-x-4">
              <Facebook size={24} className="cursor-pointer" />
              <Twitter size={24} className="cursor-pointer" />
              <Instagram size={24} className="cursor-pointer" />
            </div>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-700 text-sm text-center">
          © 2025 BrewHaven. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
