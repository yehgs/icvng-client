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
import { useTranslation } from "../hooks/useTranslation";

const ContactForm = ({ formType = "contact" }) => {
  const { t, language } = useTranslation();
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
      toast.error(t("contactForm.failedLoadCategories"));
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
          // Language the visitor is using — saved alongside the submission
          // so whoever triages it in the admin panel has that context.
          language,
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
            ? t("contactForm.partnerSubmitSuccess")
            : t("contactForm.contactSubmitSuccess"),
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
    t("contactForm.hearSearchEngine"),
    t("contactForm.hearSocialMedia"),
    t("contactForm.hearReferral"),
    t("contactForm.hearAd"),
    t("contactForm.hearBlog"),
    t("contactForm.hearTradeShow"),
    t("contactForm.hearNewsletter"),
    t("contactForm.hearOther"),
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
                ? t("contactForm.applicationSubmittedTitle")
                : t("contactForm.messageSentTitle")}
            </h2>
            <p className="text-gray-600 text-lg">
              {formType === "partner"
                ? t("contactForm.partnerThankYou")
                : t("contactForm.contactThankYou")}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
            <p className="text-gray-700">
              <strong>{t("contactForm.whatHappensNext")}</strong>
            </p>
            <ul className="text-left text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>
                  {t("contactForm.reviewWithin", {
                    type:
                      formType === "partner"
                        ? t("contactForm.applicationType")
                        : t("contactForm.messageType"),
                  })}
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>
                  {t("contactForm.reachOutVia")}{" "}
                  <strong>{formData.preferredContact}</strong>
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>
                  {formType === "partner"
                    ? t("contactForm.partnerSpecialistNote")
                    : t("contactForm.supportTeamNote")}
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-gray-600">
              {t("contactForm.confirmationSentTo")}{" "}
              <strong className="text-gray-800">{formData.email}</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={resetForm}
                className="bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                {t("contactForm.submitAnother")}{" "}
                {formType === "partner"
                  ? t("contactForm.applicationType")
                  : t("contactForm.messageType")}
              </button>
              <a
                href="/"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition"
              >
                {t("contactForm.backToHome")}
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
            {t("contactForm.fullName")} *
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
              placeholder={t("contactForm.fullNamePlaceholder")}
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            {t("contactForm.emailAddress")} *
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
              placeholder={t("contactForm.emailPlaceholder")}
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Phone Field */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            {t("contactForm.phoneNumber")} *
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
              placeholder={t("contactForm.phonePlaceholder")}
            />
          </div>
        </div>

        {/* Company Field */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            {t("contactForm.company")}
          </label>
          <div className="relative">
            <FaBuilding className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder={t("contactForm.companyPlaceholder")}
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
              {t("contactForm.businessType")}{" "}
              <span className="text-gray-400">{t("contactForm.optional")}</span>
            </label>
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">{t("contactForm.selectType")}</option>
              <option value="roaster">{t("contactForm.businessTypeRoaster")}</option>
              <option value="distributor">{t("contactForm.businessTypeDistributor")}</option>
              <option value="manufacturer">{t("contactForm.businessTypeManufacturer")}</option>
              <option value="retailer">{t("contactForm.businessTypeRetailer")}</option>
              <option value="importer">{t("contactForm.businessTypeImporter")}</option>
              <option value="other">{t("contactForm.businessTypeOther")}</option>
            </select>
          </div>

          {/* Product Categories - NOW MULTI-SELECT DROPDOWN */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              {t("contactForm.productCategories")}{" "}
              <span className="text-gray-400">
                {t("contactForm.optionalMultiSelect")}
              </span>
            </label>
            {loadingCategories ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-green-600"></div>
                <span className="ml-2 text-gray-600">
                  {t("contactForm.loadingCategories")}
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
                  <option disabled>{t("contactForm.noCategoriesAvailable")}</option>
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
              {t("contactForm.multiSelectHint")}
            </p>
          </div>
        </div>
      )}

      {/* Contact-specific subject field */}
      {formType === "contact" && (
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            {t("contactForm.subject")} *
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder={t("contactForm.subjectPlaceholder")}
          />
        </div>
      )}

      {/* How did you hear about us */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          {t("contactForm.howDidYouHear")} *
        </label>
        <select
          name="howDidYouHear"
          value={formData.howDidYouHear}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          <option value="">{t("contactForm.selectAnOption")}</option>
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
          {t("contactForm.preferredContactMethod")} *
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
            <span>{t("contactForm.contactByEmail")}</span>
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
            <span>{t("contactForm.contactByPhone")}</span>
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
            <span>{t("contactForm.contactByWhatsapp")}</span>
          </label>
        </div>
      </div>

      {/* Message Field */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          {t("contactForm.message")} *
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
              ? t("contactForm.messagePlaceholderPartner")
              : t("contactForm.messagePlaceholderContact")
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
            <span>{t("contactForm.sending")}</span>
          </div>
        ) : (
          <>
            <FaPaperPlane className="mr-2" />
            {formType === "partner"
              ? t("contactForm.submitApplication")
              : t("contactForm.sendMessage")}
          </>
        )}
      </button>
    </form>
  );
};

export default ContactForm;
