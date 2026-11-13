// utils/seoCopy.js — fallback <title>/description for static storefront pages (CMS "Site Pages" SEO overrides these),
// plus the list of private/transactional paths that must be noindex. Mirrors server/controllers/seo.controller.js.

export const SEO_COUNTRY_ALTERNATES = [
  { code: "NG", domain: "i-coffee.ng", hreflang: "en-NG" },
  { code: "TG", domain: "i-coffee.tg", hreflang: "fr-TG" },
  { code: "BJ", domain: "i-coffee.bj", hreflang: "fr-BJ" },
  { code: "IT", domain: "i-coffee.it", hreflang: "it-IT" },
];

export const NOINDEX_PREFIXES = [
  "/dashboard", "/user", "/cart", "/checkout", "/login", "/register", "/verify-email", "/forgot-password",
  "/reset-password", "/verification-otp", "/auth/", "/success", "/cancel", "/order-success", "/payment/",
  "/bank-transfer-instructions", "/wishlist", "/compare", "/search", "/gift-cards/balance", "/gift-cards/paystack",
  "/gift-cards/stripe", "/gift-cards/cinetpay",
];

export const isNoIndexPath = (p = "") =>
  NOINDEX_PREFIXES.some((d) => p === d || p.startsWith(d.endsWith("/") ? d : `${d}/`));

/** path → CMS Site Page slug (null = no CMS page). */
export const staticSlug = (path) => (path === "/" || path === "" ? "site-index" : path.replace(/^\//, "").replace(/\//g, "-"));

export const STATIC_SEO = {
  en: {
    "/shop": ["Shop Coffee, Machines & Accessories", "Browse our full range of coffee beans, capsules, machines and accessories."],
    "/blogs": ["Coffee Stories & Insights", "Brewing guides, coffee culture and news from the I-Coffee team."],
    "/about-us": ["About Us", "Learn who we are and why we love coffee."],
    "/our-story": ["Our Story", "How I-Coffee began and what drives us."],
    "/contact-us": ["Contact Us", "Get in touch with the I-Coffee team."],
    "/faq": ["Frequently Asked Questions", "Answers about orders, delivery, payments and products."],
    "/partner-with-us": ["Partner With Us", "Become an I-Coffee partner."],
    "/book-barista-training": ["Barista Training", "Book professional barista training."],
    "/rent-coffee-machine": ["Rent a Coffee Machine", "Rent professional coffee machines for your business or event."],
    "/gift-cards/buy": ["Gift Cards", "Give the gift of great coffee with an I-Coffee gift card."],
    "/shipping-policy": ["Shipping Policy", "How we ship your order."],
    "/return-policy": ["Returns & Refunds", "Our returns and refunds policy."],
    "/terms-conditions": ["Terms & Conditions", "Terms of use for I-Coffee."],
    "/privacy-policy": ["Privacy Policy", "How we handle your personal data."],
  },
  fr: {
    "/shop": ["Boutique : café, machines et accessoires", "Parcourez notre gamme de grains, capsules, machines et accessoires."],
    "/blogs": ["Histoires et conseils café", "Guides de préparation, culture café et actualités de l'équipe I-Coffee."],
    "/about-us": ["À propos", "Découvrez qui nous sommes."],
    "/our-story": ["Notre histoire", "Comment I-Coffee est né."],
    "/contact-us": ["Contactez-nous", "Contactez l'équipe I-Coffee."],
    "/faq": ["Questions fréquentes", "Réponses sur les commandes, la livraison et les paiements."],
  },
  it: {
    "/shop": ["Negozio: caffè, macchine e accessori", "Scopri la nostra gamma di caffè in grani, capsule, macchine e accessori."],
    "/blogs": ["Storie e approfondimenti sul caffè", "Guide, cultura del caffè e novità dal team I-Coffee."],
    "/about-us": ["Chi siamo", "Scopri chi siamo."],
    "/our-story": ["La nostra storia", "Come è nata I-Coffee."],
    "/contact-us": ["Contattaci", "Contatta il team I-Coffee."],
    "/faq": ["Domande frequenti", "Risposte su ordini, consegna e pagamenti."],
  },
};

export const staticCopy = (lang, path) => STATIC_SEO[lang]?.[path] || STATIC_SEO.en[path] || null;
