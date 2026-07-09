// client/src/components/TestimonialsSection.jsx
import React from "react";
import { Quote, Star, Truck, ShieldCheck, Coffee } from "lucide-react";

/**
 * Static testimonials section for the bottom of the homepage.
 * Follows the same visual language as BlogSection (gradient background,
 * centered header with icon, white rounded cards with hover lift) so it
 * reads as part of the same page rather than a bolted-on block.
 *
 * If/when real reviews are collected (e.g. a Testimonial model + admin CRUD),
 * swap the TESTIMONIALS constant below for an API fetch — the markup below
 * doesn't need to change, same pattern BlogSection uses for its fallback data.
 */
const TESTIMONIALS = [
  {
    id: 1,
    name: "Fatima Tariq",
    location: "Lagos",
    rating: 5,
    quote:
      "Ordered a Lavazza machine on a Tuesday and it was at my door by Thursday. Faster than I expected for Lagos traffic, and it arrived perfectly packaged.",
    highlight: "Fast delivery",
    icon: Truck,
  },
  {
    id: 2,
    name: "Mia Schneider",
    location: "Abuja",
    rating: 5,
    quote:
      "I was nervous paying online for the first time, but everything about i-Coffee felt legitimate — order updates, real tracking, and support that actually replied.",
    highlight: "Trusted & secure",
    icon: ShieldCheck,
  },
  {
    id: 3,
    name: "Luca Francesco",
    location: "Port Harcourt",
    rating: 5,
    quote:
      "The coffee beans are always fresh and the roast dates are printed right on the bag. You can tell they don't let stock sit around.",
    highlight: "Genuine quality",
    icon: Coffee,
  },
  {
    id: 4,
    name: "Tunde Bakare",
    location: "Ibadan",
    rating: 5,
    quote:
      "My capsule machine had a small issue after two weeks and their team sorted a replacement without any back and forth. That's rare these days.",
    highlight: "Great support",
    icon: ShieldCheck,
  },
  {
    id: 5,
    name: "Olivia Marie",
    location: "Kano",
    rating: 4,
    quote:
      "Delivery to Kano usually takes a bit longer for special orders, but they kept me updated the whole way and it arrived exactly when promised.",
    highlight: "Reliable delivery",
    icon: Truck,
  },
  {
    id: 6,
    name: "Emeka Nwosu",
    location: "Enugu",
    rating: 5,
    quote:
      "Been ordering monthly for almost a year now. Prices are honest, nothing hidden at checkout, and the site is genuinely easy to use.",
    highlight: "Honest pricing",
    icon: ShieldCheck,
  },
];

const initials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const StarRow = ({ rating }) => (
  <div
    className="flex items-center gap-0.5"
    aria-label={`${rating} out of 5 stars`}
  >
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`w-4 h-4 ${
          n <= rating
            ? "fill-amber-400 text-amber-400"
            : "fill-gray-200 text-gray-200"
        }`}
      />
    ))}
  </div>
);

const TestimonialCard = ({ testimonial }) => {
  const Icon = testimonial.icon;
  return (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 flex flex-col relative">
      <Quote className="absolute top-5 right-5 w-8 h-8 text-amber-100" />

      <StarRow rating={testimonial.rating} />

      <p className="mt-4 text-gray-600 text-sm leading-relaxed flex-grow">
        "{testimonial.quote}"
      </p>

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          {initials(testimonial.name)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">
            {testimonial.name}
          </p>
          <p className="text-xs text-gray-400">{testimonial.location}</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-amber-700 text-xs font-medium bg-amber-50 px-2 py-1 rounded-full">
          <Icon className="w-3 h-3" />
          <span className="hidden sm:inline">{testimonial.highlight}</span>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  return (
    <section className="py-12 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <Quote className="w-8 h-8 text-amber-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              What Our Customers Say
            </h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Thousands of coffee lovers across Nigeria trust us for fast
            delivery, genuine products, and support that shows up when it
            matters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
