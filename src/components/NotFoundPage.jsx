import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Coffee, Search } from 'lucide-react';

/**
 * 404 Not Found Page
 * Displayed when a user navigates to a non-existent route
 */
const NotFoundPage = () => {
  // Go back to previous page
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4 py-7">
      <div className="max-w-md w-full text-center">
        {/* Coffee cup illustration */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-amber-800 rounded-b-full"></div>
            <div className="absolute -right-6 top-8 w-10 h-16 border-4 border-amber-800 rounded-r-full"></div>
            <div className="absolute top-36 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-amber-800 rounded"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="w-16 h-1 bg-white rounded-full opacity-30"></div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-7xl font-bold text-amber-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          Oops! The page you're looking for seems to have vanished like steam
          from a fresh coffee.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Go Back
          </button>
          <Link
            to="/"
            className="flex items-center justify-center px-6 py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-medium transition-colors"
          >
            <Home size={18} className="mr-2" />
            Home Page
          </Link>
        </div>

        {/* Additional Links */}
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <Link
            to="/shop"
            className="flex items-center text-amber-800 hover:text-amber-900 font-medium"
          >
            <Coffee size={16} className="mr-1" />
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
