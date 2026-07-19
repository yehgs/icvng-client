// client/src/pages/OurStory.jsx
import React from 'react';
import {
  FaCoffee,
  FaMapMarkerAlt,
  FaHeart,
  FaUsers,
  FaRocket,
  FaStar,
  FaHandshake,
  FaAward,
  FaLightbulb,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSitePage } from '../hooks/useSitePage';

const TIMELINE_ICONS = { lightbulb: FaLightbulb, rocket: FaRocket, star: FaStar, users: FaUsers, award: FaAward };
const PRINCIPLE_ICONS = { coffee: FaCoffee, handshake: FaHandshake, heart: FaHeart };

const DEFAULT_TIMELINE = [
  { year: 'The Beginning', title: 'A Vision Born in Lagos', description: 'In the bustling city of Lagos, Nigeria, passionate entrepreneurs identified a gap in the coffee industry - the need for a platform connecting suppliers, buyers, and enthusiasts.', iconKey: 'lightbulb' },
  { year: 'The Launch', title: 'I-Coffee Platform Goes Live', description: 'Our revolutionary trading platform emerged with a clear mission: to create a one-stop-shop for all things coffee with user-friendly features and competitive pricing.', iconKey: 'rocket' },
  { year: 'First Success', title: 'Princess Finds Her Beans', description: 'Princess, a young coffee shop owner, discovered I-Coffee while searching for high-quality Arabica beans. She connected with suppliers, and her coffee shop sales soared.', iconKey: 'star' },
  { year: 'Growing Community', title: 'Word Spreads Across Nigeria', description: "As success stories multiplied, I-Coffee's community grew. Suppliers showcased premium beans while buyers discovered new flavors and expanded their businesses.", iconKey: 'users' },
  { year: 'Today', title: "Nigeria's Coffee Trading Hub", description: "I-Coffee became Nigeria's go-to coffee trading platform, fostering growth, connections, and a thriving coffee culture with innovative features and unwavering quality.", iconKey: 'award' },
];

const DEFAULT_PRINCIPLES = [
  { iconKey: 'coffee', title: 'Quality Above All', description: 'Every product on our platform meets stringent quality standards.' },
  { iconKey: 'handshake', title: 'Building Connections', description: 'We unite suppliers and buyers in a seamless marketplace.' },
  { iconKey: 'heart', title: 'Customer Success', description: 'Your growth and satisfaction are the measures of our success.' },
];

const DEFAULTS = {
  heroTitle: 'Our Story',
  heroTagline: 'From Vision to Reality',
  heroSubtitle: "The journey of how I-Coffee became Nigeria's leading coffee trading platform",
  beginningTitle: 'It All Started in Lagos',
  beginningParagraphs: [
    "In the bustling city of Lagos, Nigeria, a revolutionary trading platform emerged, changing the way coffee enthusiasts and businesses connected. I-Coffee, a brainchild of passionate entrepreneurs, aimed to bridge the gap between coffee suppliers, buyers, and aficionados.",
    "The platform's visionary management team had a clear goal: to create a one-stop-shop for all things coffee, where users could seamlessly buy, sell, and trade coffee beans, machines, and accessories. With a user-friendly interface and robust features, I-Coffee quickly gained traction among Nigerian coffee lovers.",
  ],
  successStoryBadge: 'Success Story',
  successStoryTitle: "Princess's Coffee Shop Transformation",
  successStoryParagraphs: [
    'One day, Princess, a young coffee shop owner, stumbled upon I-Coffee while searching for high-quality Arabica beans. She was impressed by the platform\'s vast selection and competitive prices.',
    'She connected with a reputable supplier, negotiated a deal, and received her beans within days. The quality exceeded her expectations, and her coffee shop\'s sales soared.',
    'Princess became a loyal I-Coffee customer, and her success story inspired countless others to join our community.',
  ],
  successStoryImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop',
  timeline: DEFAULT_TIMELINE,
  impactTitle: 'Our Impact',
  impactSubtitle: "As word spread, I-Coffee's community grew exponentially",
  impactStats: [
    { iconKey: 'coffee', title: 'Premium Quality', text: 'Suppliers showcase their finest beans' },
    { iconKey: 'users', title: 'Growing Network', text: 'Buyers discover new flavors daily' },
    { iconKey: 'rocket', title: 'Business Growth', text: 'Partners expand their reach' },
  ],
  valueTitle: 'Creating Value for Your Products',
  valueSubtitle: 'Our slogan reflects our commitment',
  valueParagraphs: [
    'With our slogan "Creating Value for Your Products," I-Coffee continued to innovate, introducing features like coffee machine trading, educational resources, and enhanced supplier-buyer connections.',
    "The platform's impact on Nigeria's coffee industry was undeniable, fostering growth, meaningful connections, and a thriving coffee culture that extends from Lagos to every corner of the nation.",
  ],
  principles: DEFAULT_PRINCIPLES,
  closingTitle: 'The Journey Continues',
  closingParagraphs: [
    "Today, I-Coffee stands as Nigeria's premier coffee trading hub, but our story is far from over. We continue to innovate, expand, and create value for every member of our community.",
    "Whether you're a supplier looking to grow, a business seeking quality products, or a coffee enthusiast exploring new horizons, you're part of our story.",
  ],
};

const OurStory = () => {
  const { get } = useSitePage('our-story', DEFAULTS);
  const timeline = get('timeline', DEFAULT_TIMELINE);
  const principles = get('principles', DEFAULT_PRINCIPLES);
  const impactStats = get('impactStats', DEFAULTS.impactStats);
  const beginningParagraphs = get('beginningParagraphs', DEFAULTS.beginningParagraphs);
  const successStoryParagraphs = get('successStoryParagraphs', DEFAULTS.successStoryParagraphs);
  const valueParagraphs = get('valueParagraphs', DEFAULTS.valueParagraphs);
  const closingParagraphs = get('closingParagraphs', DEFAULTS.closingParagraphs);

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-secondary-100 to-secondary-200 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>
        </div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <FaCoffee className="text-6xl mx-auto mb-6 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{get('heroTitle', DEFAULTS.heroTitle)}</h1>
            <p className="text-xl md:text-2xl mb-4 text-amber-100">{get('heroTagline', DEFAULTS.heroTagline)}</p>
            <p className="text-lg text-amber-50">{get('heroSubtitle', DEFAULTS.heroSubtitle)}</p>
          </div>
        </div>
      </div>

      {/* The Beginning */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div className="flex items-center mb-6">
              <FaMapMarkerAlt className="text-4xl text-amber-600 mr-4" />
              <h2 className="text-3xl font-bold text-gray-800">{get('beginningTitle', DEFAULTS.beginningTitle)}</h2>
            </div>

            <div className="prose max-w-none text-gray-700 space-y-4">
              {beginningParagraphs.map((p, idx) => (
                <p key={idx} className="text-lg leading-relaxed">{p}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Princess's Story - Featured Customer Story */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src={get('successStoryImage', DEFAULTS.successStoryImage)}
                  alt="Coffee shop owner"
                  className="rounded-xl shadow-lg w-full"
                />
              </div>
              <div>
                <div className="inline-block bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  {get('successStoryBadge', DEFAULTS.successStoryBadge)}
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">{get('successStoryTitle', DEFAULTS.successStoryTitle)}</h2>
                <div className="space-y-4 text-gray-700">
                  {successStoryParagraphs.map((p, idx) => (
                    <p key={idx} className={`leading-relaxed ${idx === successStoryParagraphs.length - 1 ? 'font-semibold text-amber-700' : ''}`}>
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-gray-600">
              Key milestones in the I-Coffee story
            </p>
          </div>

          <div className="space-y-12">
            {timeline.map((item, index) => {
              const Icon = TIMELINE_ICONS[item.iconKey] || FaLightbulb;
              return (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row gap-8 items-start ${
                    index % 2 === 1 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  <div className="md:w-1/2">
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                      <div className="flex items-center mb-4">
                        <Icon className="text-3xl text-amber-500" />
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-amber-600 uppercase tracking-wide">
                            {item.year}
                          </div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {item.title}
                          </h3>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block md:w-1/2"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Impact Section */}
      <div className="bg-gradient-to-br from-secondary-100 to-secondary-200 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{get('impactTitle', DEFAULTS.impactTitle)}</h2>
            <p className="text-xl text-amber-100 mb-12">{get('impactSubtitle', DEFAULTS.impactSubtitle)}</p>

            <div className="grid md:grid-cols-3 gap-8">
              {impactStats.map((stat, idx) => {
                const Icon = PRINCIPLE_ICONS[stat.iconKey] || FaCoffee;
                return (
                  <div key={idx} className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                    <Icon className="text-5xl mx-auto mb-4" />
                    <div className="text-3xl font-bold mb-2">{stat.title}</div>
                    <p className="text-amber-100">{stat.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Creating Value */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-amber-50 to-blue-50 rounded-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{get('valueTitle', DEFAULTS.valueTitle)}</h2>
              <p className="text-xl text-gray-600">{get('valueSubtitle', DEFAULTS.valueSubtitle)}</p>
            </div>

            <div className="prose max-w-none text-gray-700 space-y-4">
              {valueParagraphs.map((p, idx) => (
                <p key={idx} className="text-lg leading-relaxed">{p}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Our Principles */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                What Drives Us
              </h2>
              <p className="text-lg text-gray-600">
                The principles that guide our every decision
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {principles.map((principle, index) => {
                const Icon = PRINCIPLE_ICONS[principle.iconKey] || FaCoffee;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition transform hover:-translate-y-2"
                  >
                    <div className="flex justify-center mb-4">
                      <Icon className="text-4xl text-amber-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      {principle.title}
                    </h3>
                    <p className="text-gray-600">{principle.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Looking Forward */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl p-8 md:p-12 text-center">
            <FaRocket className="text-5xl mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-6">{get('closingTitle', DEFAULTS.closingTitle)}</h2>
            {closingParagraphs.map((p, idx) => (
              <p key={idx} className={idx === 0 ? 'text-xl text-gray-300 mb-8' : 'text-lg text-gray-400 mb-8'}>
                {p}
              </p>
            ))}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/shop"
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition inline-flex items-center justify-center"
              >
                <FaCoffee className="mr-2" />
                Start Shopping
              </Link>
              <Link
                to="/partner-with-us"
                className="bg-white hover:bg-gray-100 text-gray-800 px-8 py-4 rounded-lg font-semibold text-lg transition inline-flex items-center justify-center"
              >
                <FaHandshake className="mr-2" />
                Join Our Network
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurStory;
