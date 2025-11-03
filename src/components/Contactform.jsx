// client/src/components/ContactForm.jsx
import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaPaperPlane,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const ContactForm = ({ formType = 'contact' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    howDidYouHear: '',
    preferredContact: 'email',
    businessType: '',
    productCategories: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // EmailJS configuration
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId =
        formType === 'partner'
          ? import.meta.env.VITE_EMAILJS_PARTNER_TEMPLATE_ID
          : import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      // Prepare template parameters
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone,
        company: formData.company,
        subject: formData.subject || 'New Contact Form Submission',
        message: formData.message,
        how_did_you_hear: formData.howDidYouHear,
        preferred_contact: formData.preferredContact,
        business_type: formData.businessType,
        product_categories: formData.productCategories,
        form_type: formType,
        to_email: 'customercare@i-coffee.ng',
      };

      // Send email using EmailJS
      await emailjs.send(serviceId, templateId, templateParams, publicKey);

      toast.success(
        formType === 'partner'
          ? 'Thank you for your interest! Our team will contact you shortly.'
          : 'Message sent successfully! We will get back to you soon.'
      );

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        howDidYouHear: '',
        preferredContact: 'email',
        businessType: '',
        productCategories: '',
      });
    } catch (error) {
      console.error('EmailJS Error:', error);
      toast.error(
        'Failed to send message. Please try again or contact us directly.'
      );
    } finally {
      setLoading(false);
    }
  };

  const howDidYouHearOptions = [
    'Search Engine (Google, Bing, etc.)',
    'Social Media',
    'Friend or Colleague Referral',
    'Online Advertisement',
    'Blog or Article',
    'Trade Show or Event',
    'Email Newsletter',
    'Other',
  ];

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
      {formType === 'partner' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Business Type *
            </label>
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Select Type</option>
              <option value="roaster">Coffee Roaster</option>
              <option value="distributor">Distributor/Wholesaler</option>
              <option value="manufacturer">
                Coffee Machine Manufacturer
              </option>
              <option value="retailer">Retailer</option>
              <option value="importer">Importer</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Product Categories *
            </label>
            <input
              type="text"
              name="productCategories"
              value={formData.productCategories}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="e.g., Arabica Beans, Espresso Machines"
            />
          </div>
        </div>
      )}

      {/* Contact-specific subject field */}
      {formType === 'contact' && (
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
          <label className="flex items-center">
            <input
              type="radio"
              name="preferredContact"
              value="email"
              checked={formData.preferredContact === 'email'}
              onChange={handleChange}
              className="mr-2"
            />
            <span>Email</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="preferredContact"
              value="phone"
              checked={formData.preferredContact === 'phone'}
              onChange={handleChange}
              className="mr-2"
            />
            <span>Phone</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="preferredContact"
              value="whatsapp"
              checked={formData.preferredContact === 'whatsapp'}
              onChange={handleChange}
              className="mr-2"
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          placeholder={
            formType === 'partner'
              ? 'Tell us about your products, production capacity, and why you would like to partner with I-Coffee...'
              : 'Please provide details about your inquiry...'
          }
        ></textarea>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-4 rounded-lg transition flex items-center justify-center"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
        ) : (
          <>
            <FaPaperPlane className="mr-2" />
            {formType === 'partner' ? 'Submit Application' : 'Send Message'}
          </>
        )}
      </button>
    </form>
  );
};

export default ContactForm;