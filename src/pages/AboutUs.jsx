// client/src/pages/AboutUs.jsx
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useSitePage } from '../hooks/useSitePage';
import {
  FaCoffee,
  FaHandshake,
  FaUsers,
  FaGlobeAfrica,
  FaHeart,
  FaAward,
  FaLightbulb,
  FaRocket,
  FaStar,
  FaShieldAlt,
  FaLeaf,
  FaTruck,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ICONS = {
  heart: FaHeart, handshake: FaHandshake, lightbulb: FaLightbulb, users: FaUsers,
  award: FaAward, coffee: FaCoffee, globe: FaGlobeAfrica, shield: FaShieldAlt,
  leaf: FaLeaf, truck: FaTruck, star: FaStar, rocket: FaRocket,
};

// The original copy mixed the language-only i18n system (`t('about.*')`,
// still used below for values/achievements/whyChooseUs labels) with plain
// hardcoded English for the rest. Facts like "797+ customers", "36 states",
// "Ikeja, Lagos" and "Benin, Togo, Cameroon" are Nigeria-specific business
// facts (not just language) and now live in the SitePage CMS (slug:
// "about-us") so a Togo/Italy editor can correct or replace them per market.
const DEFAULTS = {
  heroTitle: 'About I-Coffee',
  heroTagline: "Nigeria's Leading Coffee Trading Platform",
  heroSubtitle: 'Creating Value for Your Products Since Our Inception',
  missionText:
    'To revolutionize the coffee industry in Nigeria by creating a seamless platform that connects coffee suppliers, businesses, and enthusiasts, while ensuring quality, transparency, and mutual growth.',
  missionQuote:
    '"Creating Value for Your Products" - We bridge the gap between coffee suppliers, buyers, and aficionados, fostering a thriving coffee culture across Nigeria.',
  whoWeAreSubtitle: 'A passionate team dedicated to the coffee industry',
  whoWeAreImage: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop',
  whoWeAreParagraphs: [
    "I-Coffee is Nigeria's first online coffee trading platform - a revolutionary marketplace that emerged with a vision to transform how coffee enthusiasts and businesses connect. We are your one-stop solution for all coffee needs in Nigeria.",
    'Strategically located in Ikeja, Lagos, our delivery office serves as the hub for our extensive logistics distribution network that covers all of Nigeria. With presence in 36 states including Abuja FCT, we ensure your coffee reaches you wherever you are.',
    'Our structured international management team and 35+ dedicated staff members work tirelessly to provide you with the best coffee experience. We maintain a 97% daily successful delivery rate with 5 vehicles dedicated to ensuring your orders arrive promptly and in perfect condition.',
    "Beyond Nigeria, we've expanded our reach to serve customers in Benin, Togo, and Cameroon, making I-Coffee a truly West African coffee destination.",
  ],
  achievements: [
    { iconKey: 'users', number: '797+', labelKey: 'statCustomers' },
    { iconKey: 'coffee', number: '858+', labelKey: 'statProducts' },
    { iconKey: 'handshake', number: '65+', labelKey: 'statBrands' },
    { iconKey: 'globe', number: '36+', labelKey: 'statStates' },
  ],
  commitmentParagraphs: [
    "At I-Coffee, we're committed to maintaining the highest standards of quality and service. Every product on our platform is carefully vetted to ensure authenticity and excellence.",
    'We work closely with our supplier partners to guarantee that you receive only genuine, fresh products. Our platform facilitates transparent transactions, timely deliveries, and responsive customer support.',
    "Whether you're a coffee shop owner looking for bulk supplies, a business seeking quality machines, or an individual enthusiast exploring new flavors, I-Coffee is your trusted partner in the coffee journey.",
  ],
  ctaTitle: 'Join the I-Coffee Community',
  ctaText: "Whether you're a supplier looking to expand your reach or a coffee lover seeking quality products, we're here for you.",
};

const AboutUs = () => {
  const { t } = useTranslation();
  const { get } = useSitePage('about-us', DEFAULTS);

  const values = [
    { iconKey: 'heart', title: t('about.valuesQualityTitle'), description: t('about.valuesQualityDesc') },
    { iconKey: 'handshake', title: t('about.valuesTrustTitle'), description: t('about.valuesTrustDesc') },
    { iconKey: 'lightbulb', title: t('about.valuesInnovationTitle'), description: t('about.valuesInnovationDesc') },
    { iconKey: 'users', title: t('about.valuesCommunityTitle'), description: t('about.valuesCommunityDesc') },
  ];

  const achievements = get('achievements', DEFAULTS.achievements).map((a) => ({
    ...a,
    label: a.label || t(`about.${a.labelKey}`),
  }));

  const whyChooseUs = [
    { iconKey: 'award', title: t('about.featPremiumTitle'), description: t('about.featPremiumDesc') },
    { iconKey: 'truck', title: t('about.featDeliveryTitle'), description: t('about.featDeliveryDesc') },
    { iconKey: 'shield', title: t('about.featSecureTitle'), description: t('about.featSecureDesc') },
    { iconKey: 'leaf', title: t('about.featSustainTitle'), description: t('about.featSustainDesc') },
    { iconKey: 'star', title: t('about.featSupportTitle'), description: '24/7 dedicated support team ready to assist with your queries.' },
    { iconKey: 'rocket', title: t('about.featEasyTitle'), description: t('about.featEasyDesc') },
  ];

  const whoWeAreParagraphs = get('whoWeAreParagraphs', DEFAULTS.whoWeAreParagraphs);
  const commitmentParagraphs = get('commitmentParagraphs', DEFAULTS.commitmentParagraphs);

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary-100 to-secondary-200 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <FaCoffee className="text-6xl mx-auto mb-6 animate-bounce" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{get('heroTitle', DEFAULTS.heroTitle)}</h1>
            <p className="text-xl md:text-2xl mb-4 text-amber-100">{get('heroTagline', DEFAULTS.heroTagline)}</p>
            <p className="text-lg text-amber-50">{get('heroSubtitle', DEFAULTS.heroSubtitle)}</p>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            {t('about.missionTitle')}
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">{get('missionText', DEFAULTS.missionText)}</p>
          <div className="bg-gradient-to-r from-amber-50 to-blue-50 rounded-xl p-8 border-l-4 border-amber-600">
            <p className="text-lg text-gray-700 italic">{get('missionQuote', DEFAULTS.missionQuote)}</p>
          </div>
        </div>
      </div>

      {/* Who We Are */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {t('about.whoWeAreTitle')}
              </h2>
              <p className="text-lg text-gray-600">{get('whoWeAreSubtitle', DEFAULTS.whoWeAreSubtitle)}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src={get('whoWeAreImage', DEFAULTS.whoWeAreImage)}
                  alt="Coffee beans"
                  className="rounded-xl shadow-lg w-full h-auto"
                />
              </div>
              <div className="space-y-6">
                {whoWeAreParagraphs.map((p, idx) => (
                  <p key={idx} className="text-gray-700 leading-relaxed">{p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Our Core Values
          </h2>
          <p className="text-lg text-gray-600">
            The principles that guide everything we do
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {values.map((value, index) => {
            const Icon = ICONS[value.iconKey] || FaHeart;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition transform hover:-translate-y-2"
              >
                <div className="flex justify-center mb-4">
                  <Icon className="text-5xl text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-gradient-to-r from-secondary-100 to-secondary-200 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Impact
            </h2>
            <p className="text-lg text-amber-100">
              Numbers that reflect our growth and commitment
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {achievements.map((achievement, index) => {
              const Icon = ICONS[achievement.iconKey] || FaUsers;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <Icon className="text-4xl text-amber-600" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold mb-2">
                    {achievement.number}
                  </div>
                  <div className="text-amber-100">{achievement.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {t('about.whyChooseTitle')}
          </h2>
          <p className="text-lg text-gray-600">
            What makes us Nigeria's preferred coffee marketplace
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {whyChooseUs.map((item, index) => {
            const Icon = ICONS[item.iconKey] || FaAward;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Icon className="text-3xl text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Our Commitment */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-amber-50 to-blue-50 rounded-xl p-8 md:p-12">
              <div className="text-center mb-8">
                <FaLeaf className="text-5xl text-amber-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Our Commitment to You
                </h2>
              </div>

              <div className="space-y-6 text-gray-700">
                {commitmentParagraphs.map((p, idx) => (
                  <p key={idx} className="leading-relaxed">{p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-secondary-100 to-secondary-200 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{get('ctaTitle', DEFAULTS.ctaTitle)}</h2>
            <p className="text-xl text-gray-300 mb-8">{get('ctaText', DEFAULTS.ctaText)}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/shop"
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition inline-flex items-center justify-center"
              >
                <FaCoffee className="mr-2" />
                Shop Now
              </Link>
              <Link
                to="/partner-with-us"
                className="bg-white hover:bg-gray-100 text-gray-800 px-8 py-4 rounded-lg font-semibold text-lg transition inline-flex items-center justify-center"
              >
                <FaHandshake className="mr-2" />
                Become a Partner
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
