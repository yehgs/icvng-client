// client/src/components/TestimonialsSection.jsx
import React, { useEffect, useState } from "react";
import { Quote, Star, Truck, ShieldCheck, Coffee } from "lucide-react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useCountry } from "../context/CountryContext";

/**
 * Content-managed per country (Admin -> Content -> Home Content ->
 * Testimonials) instead of a hardcoded, Nigeria-only list -- falls back to
 * this generic set (kept as a sane default/reference shape) if a market
 * hasn't added its own testimonials yet, and to HQ's (Nigeria's) real ones
 * server-side if the visited market has none at all.
 */
const FALLBACK_TESTIMONIALS = [
  {
    _id: "fallback-1",
    customerName: "Fatima Tariq",
    customerLocation: "Lagos",
    rating: 5,
    quote:
      "Ordered a Lavazza machine on a Tuesday and it was at my door by Thursday. Faster than I expected for Lagos traffic, and it arrived perfectly packaged.",
    badge: "Fast delivery",
    icon: "truck",
  },
  {
    _id: "fallback-2",
    customerName: "Mia Schneider",
    customerLocation: "Abuja",
    rating: 5,
    quote:
      "I was nervous paying online for the first time, but everything about i-Coffee felt legitimate -- order updates, real tracking, and support that actually replied.",
    badge: "Trusted & secure",
    icon: "shield",
  },
  {
    _id: "fallback-3",
    customerName: "Luca Francesco",
    customerLocation: "Port Harcourt",
    rating: 5,
    quote:
      "The coffee beans are always fresh and the roast dates are printed right on the bag. You can tell they don't let stock sit around.",
    badge: "Genuine quality",
    icon: "star",
  },
];

const ICONS = { truck: Truck, shield: ShieldCheck, star: Coffee };

const initials = (name) =>
  (name || "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const StarRow = ({ rating }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`w-4 h-4 ${n <= rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
      />
    ))}
  </div>
);

const TestimonialCard = ({ testimonial }) => {
  const Icon = ICONS[testimonial.icon] || ShieldCheck;
  return (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 flex flex-col relative">
      <Quote className="absolute top-5 right-5 w-8 h-8 text-amber-100" />

      <StarRow rating={testimonial.rating} />

      <p className="mt-4 text-gray-600 text-sm leading-relaxed flex-grow">
        "{testimonial.quote}"
      </p>

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          {testimonial.customerInitials || initials(testimonial.customerName)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">
            {testimonial.customerName}
          </p>
          <p className="text-xs text-gray-400">{testimonial.customerLocation}</p>
        </div>
        {testimonial.badge && (
          <div className="ml-auto flex items-center gap-1 text-amber-700 text-xs font-medium bg-amber-50 px-2 py-1 rounded-full">
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{testimonial.badge}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  const { t } = useCountry();
  const [testimonials, setTestimonials] = useState(null); // null = loading

  useEffect(() => {
    (async () => {
      try {
        const res = await Axios({
          ...SummaryApi.getHomeContentBlocks,
          params: { type: "testimonial" },
        });
        if (res.data?.success) setTestimonials(res.data.data || []);
        else setTestimonials([]);
      } catch {
        setTestimonials([]);
      }
    })();
  }, []);

  const items = testimonials && testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS;

  return (
    <section className="py-12 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <Quote className="w-8 h-8 text-amber-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              {t("homeSections.testimonialsHeading")}
            </h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {t("homeSections.testimonialsSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((testimonial) => (
            <TestimonialCard key={testimonial._id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
