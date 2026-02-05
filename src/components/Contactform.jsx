// client/src/components/ContactForm.jsx
import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaPaperPlane,
  FaCheckCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const ContactForm = ({ formType = "contact" }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
    howDidYouHear: "",
    preferredContact: "email",
    businessType: "",
    productCategories: [], // Changed to array for multi-select
  });

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  // Fetch categories on mount (for partner form)
  useEffect(() => {
    if (formType === "partner") {
      fetchCategories();
    }
  }, [formType]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await Axios({
        ...SummaryApi.getCategory,
      });

      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load product categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle multi-select for product categories
  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setFormData((prev) => ({
      ...prev,
      productCategories: selectedOptions,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await Axios({
        ...SummaryApi.sendContactForm,
        data: {
          ...formData,
          formType,
          // Convert array to comma-separated string for backend
          productCategories: formData.productCategories.join(", "),
        },
      });

      if (response.data.success) {
        // Show confetti
        setShowConfetti(true);

        // Show success message
        setShowSuccess(true);

        // Stop confetti after 5 seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);

        // Success toast
        toast.success(
          formType === "partner"
            ? "Partnership application submitted successfully!"
            : "Message sent successfully!",
        );
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      subject: "",
      message: "",
      howDidYouHear: "",
      preferredContact: "email",
      businessType: "",
      productCategories: [],
    });
    setShowSuccess(false);
  };

  const howDidYouHearOptions = [
    "Search Engine (Google, Bing, etc.)",
    "Social Media",
    "Friend or Colleague Referral",
    "Online Advertisement",
    "Blog or Article",
    "Trade Show or Event",
    "Email Newsletter",
    "Other",
  ];

  // Success State Component
  if (showSuccess) {
    return (
      <>
        {showConfetti && (
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
          />
        )}
        <div className="bg-white rounded-lg p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-green-100 rounded-full p-6">
              <FaCheckCircle className="text-green-600 text-6xl" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-800">
              {formType === "partner"
                ? "Application Submitted!"
                : "Message Sent!"}
            </h2>
            <p className="text-gray-600 text-lg">
              {formType === "partner"
                ? "Thank you for your interest in partnering with I-Coffee!"
                : "Thank you for contacting us!"}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
            <p className="text-gray-700">
              <strong>What happens next?</strong>
            </p>
            <ul className="text-left text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>
                  Our team will review your{" "}
                  {formType === "partner" ? "application" : "message"} within
                  24-48 hours
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>
                  We'll reach out via your preferred contact method:{" "}
                  <strong>{formData.preferredContact}</strong>
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>
                  {formType === "partner"
                    ? "A partnership specialist will discuss opportunities with you"
                    : "Our support team will address your inquiry"}
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-gray-600">
              We've sent a confirmation email to{" "}
              <strong className="text-gray-800">{formData.email}</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={resetForm}
                className="bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Submit Another{" "}
                {formType === "partner" ? "Application" : "Message"}
              </button>
              <a
                href="/"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Form Component
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Name Field */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Full Name *
          </label>
          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="John Doe"
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Email Address *
          </label>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="john@example.com"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Phone Field */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <FaPhone className="absolute left-3 top-3 text-gray-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="+234 XXX XXX XXXX"
            />
          </div>
        </div>

        {/* Company Field */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Company/Organization
          </label>
          <div className="relative">
            <FaBuilding className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Your Company Name"
            />
          </div>
        </div>
      </div>

      {/* Partner-specific fields */}
      {formType === "partner" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Business Type - NOW OPTIONAL */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Business Type <span className="text-gray-400">(Optional)</span>
            </label>
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Select Type</option>
              <option value="roaster">Coffee Roaster</option>
              <option value="distributor">Distributor/Wholesaler</option>
              <option value="manufacturer">Coffee Machine Manufacturer</option>
              <option value="retailer">Retailer</option>
              <option value="importer">Importer</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Product Categories - NOW MULTI-SELECT DROPDOWN */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Product Categories{" "}
              <span className="text-gray-400">
                (Optional - Select multiple)
              </span>
            </label>
            {loadingCategories ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-green-600"></div>
                <span className="ml-2 text-gray-600">
                  Loading categories...
                </span>
              </div>
            ) : (
              <select
                multiple
                name="productCategories"
                value={formData.productCategories}
                onChange={handleCategoryChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 h-32"
              >
                {categories.length === 0 ? (
                  <option disabled>No categories available</option>
                ) : (
                  categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Hold Ctrl (Windows) or Cmd (Mac) to select multiple categories
            </p>
          </div>
        </div>
      )}

      {/* Contact-specific subject field */}
      {formType === "contact" && (
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Subject *
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="How can we help you?"
          />
        </div>
      )}

      {/* How did you hear about us */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          How did you hear about us? *
        </label>
        <select
          name="howDidYouHear"
          value={formData.howDidYouHear}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          <option value="">Select an option</option>
          {howDidYouHearOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Preferred Contact Method */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          How would you like us to contact you? *
        </label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="preferredContact"
              value="email"
              checked={formData.preferredContact === "email"}
              onChange={handleChange}
              className="mr-2 w-4 h-4 text-green-600"
            />
            <span>Email</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="preferredContact"
              value="phone"
              checked={formData.preferredContact === "phone"}
              onChange={handleChange}
              className="mr-2 w-4 h-4 text-green-600"
            />
            <span>Phone</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="preferredContact"
              value="whatsapp"
              checked={formData.preferredContact === "whatsapp"}
              onChange={handleChange}
              className="mr-2 w-4 h-4 text-green-600"
            />
            <span>WhatsApp</span>
          </label>
        </div>
      </div>

      {/* Message Field */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Message *
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows="6"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
          placeholder={
            formType === "partner"
              ? "Tell us about your products, production capacity, and why you would like to partner with I-Coffee..."
              : "Please provide details about your inquiry..."
          }
        ></textarea>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition flex items-center justify-center"
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
            <span>Sending...</span>
          </div>
        ) : (
          <>
            <FaPaperPlane className="mr-2" />
            {formType === "partner" ? "Submit Application" : "Send Message"}
          </>
        )}
      </button>
    </form>
  );
};

export default ContactForm;
