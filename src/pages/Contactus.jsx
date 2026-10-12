// client/src/pages/ContactUs.jsx
import React from "react";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaFacebook,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";
import ContactForm from "../components/Contactform";
import { useSitePage } from "../hooks/useSitePage";
import { useSocialLinks } from "../hooks/useSocialLinks";
import { useTranslation } from "../hooks/useTranslation";

// The page's original copy — Nigeria-authored, since NG was the only market
// in mind when this page was built. Kept here as the fallback so the page
// renders identically until/unless the admin CMS (SitePage, slug:
// "contact-us") has content for the visiting country/language.
const DEFAULTS = {
  heroTitle: "Contact Us",
  heroSubtitle: "We'd love to hear from you. Get in touch with our team!",
  address: ["3 Kaffi Street, Alausa", "Ikeja, Lagos", "Nigeria"],
  phone: "+234 805 242 3935",
  phoneHref: "tel:+2348052423935",
  email: "customercare@i-coffee.ng",
  businessHours: [
    "Monday - Friday: 8:00 AM - 6:00 PM",
    "Saturday: 9:00 AM - 4:00 PM",
    "Sunday: Closed",
  ],
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.2858866938844!2d3.3541295!3d6.6067082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b923f5e2c6b89%3A0x6b8b9c5f7a3e2d4c!2sKaffi%20Street%2C%20Alausa%2C%20Ikeja%2C%20Lagos!5e0!3m2!1sen!2sng!4v1234567890",
  gettingHere:
    "We are conveniently located in the heart of Ikeja, Lagos. Easily accessible by public transportation and private vehicles. Ample parking available.",
  landmarks: ["Alausa Secretariat", "Lagos State Government Secretariat", "Ikeja City Mall"],
  facebookUrl: "https://www.facebook.com/Italiancoffeeonline/?ref=pages_you_manage",
  twitterUrl: "https://twitter.com/italiancoffee_v",
  instagramUrl: "https://www.instagram.com/italiancofeeventure/",
  faqTeaserTitle: "Have Questions?",
  faqTeaserText: "Check out our FAQ page for quick answers to common questions",
};

// CMS content key → UI-translation key used when the CMS copy is untranslated.
const CMS_TEXT_KEYS = {
  heroTitle: "contactPage.heroTitle",
  heroSubtitle: "contactPage.heroSubtitle",
  faqTeaserTitle: "contactPage.faqTeaserTitle",
  faqTeaserText: "contactPage.faqTeaserText",
};

const ContactUs = () => {
  const { t, language } = useTranslation();
  const { get: getCms } = useSitePage("contact-us", DEFAULTS);
  const social = useSocialLinks();

  // CMS copy wins when an editor wrote/translated it. If the value is still
  // the untouched English default (or the CMS has only an untranslated
  // English copy for this key), fall back to the UI-translation key so the
  // text follows the visitor's language and stays editable on the
  // "UI Copy Translations" admin page.
  const get = (key, fallback) => {
    const v = getCms(key, fallback);
    const tKey = CMS_TEXT_KEYS[key];
    if (tKey && language !== "en" && v === DEFAULTS[key]) return t(tKey);
    return v;
  };

  // Business-hours lines are free text from the CMS ("Monday - Friday: …").
  // When the CMS copy is still English, translate the day names / "Closed".
  const localizeHours = (line) => {
    if (language === "en" || typeof line !== "string") return line;
    return line
      .replace(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/g, (d) => t(`contactPage.day${d}`))
      .replace(/\bClosed\b/g, () => t("contactPage.closed"));
  };

  const address = get("address", DEFAULTS.address);
  const businessHours = [].concat(get("businessHours", DEFAULTS.businessHours)).map(localizeHours);
  const landmarks = get("landmarks", DEFAULTS.landmarks);
  const phone = get("phone", DEFAULTS.phone);
  const phoneHref = get("phoneHref", `tel:${String(phone).replace(/\s+/g, "")}`);
  const email = get("email", DEFAULTS.email);

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="text-3xl text-amber-600" />,
      title: t("contactPage.visitUs"),
      details: Array.isArray(address) ? address : [address],
    },
    {
      icon: <FaPhone className="text-3xl text-amber-600" />,
      title: t("contactPage.callUs"),
      details: [phone],
      link: phoneHref,
    },
    {
      icon: <FaEnvelope className="text-3xl text-amber-600" />,
      title: t("contactPage.emailUs"),
      details: [email],
      link: `mailto:${email}`,
    },
    {
      icon: <FaClock className="text-3xl text-amber-600" />,
      title: t("contactPage.businessHours"),
      details: Array.isArray(businessHours) ? businessHours : [businessHours],
    },
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary-100 to-secondary-200 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <FaEnvelope className="text-6xl mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{get("heroTitle", DEFAULTS.heroTitle)}</h1>
            <p className="text-xl text-amber-100">{get("heroSubtitle", DEFAULTS.heroSubtitle)}</p>
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
                  ),
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
                {t("contactPage.findUsHere")}
              </h2>
              <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                  <iframe
                    src={get("mapEmbedUrl", DEFAULTS.mapEmbedUrl)}
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={t("contactPage.mapTitle")}
                  ></iframe>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {t("contactPage.gettingHere")}
                    </h3>
                    <p className="text-gray-600 text-sm">{get("gettingHere", DEFAULTS.gettingHere)}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {t("contactPage.landmarksNearby")}
                    </h3>
                    <ul className="text-gray-600 text-sm space-y-1">
                      {landmarks.map((lm, idx) => (
                        <li key={idx}>• {lm}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {t("contactPage.followUs")}
                </h3>
                <div className="flex space-x-6">
                  <a
                    href={get("facebookUrl", social.facebook)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 transition"
                  >
                    <FaFacebook className="text-3xl" />
                  </a>
                  <a
                    href={get("twitterUrl", social.twitter)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-400 transition"
                  >
                    <FaTwitter className="text-3xl" />
                  </a>
                  <a
                    href={get("instagramUrl", social.instagram)}
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
                {t("contactPage.sendMessage")}
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
              {get("faqTeaserTitle", DEFAULTS.faqTeaserTitle)}
            </h2>
            <p className="text-lg text-gray-600 mb-6">{get("faqTeaserText", DEFAULTS.faqTeaserText)}</p>
            <a
              href="/faq"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              {t("contactPage.viewFaq")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
