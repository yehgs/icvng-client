// client/src/config/bookingServices.js
// Config for the two banner landing pages. Copy lives here (not in JSX) so
// adding a third service later = one new object + one route.

// 0 = Sunday ... 6 = Saturday
export const CLOSED_WEEKDAYS = [0];
export const MAX_BOOKING_DAYS_AHEAD = 90;

export const CONTACT_MODES = [
  { value: "Phone call", label: "Phone call" },
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Email", label: "Email" },
];

export const TIME_SLOTS = [
  { value: "Morning", label: "Morning", hint: "8:00 AM - 12:00 PM" },
  { value: "Afternoon", label: "Afternoon", hint: "12:00 PM - 5:00 PM" },
];

// extraFields types: select | text | number | textarea
export const SERVICES = {
  training: {
    key: "training",
    slug: "book-barista-training",
    emailSubject: "New Barista Training Registration",
    pageTitle: "Barista Training Registration | I-Coffee",
    heroTitle: "Barista Training",
    heroSubtitle:
      "Learn from one of the best baristas from the UAE. Hands-on espresso making, milk frothing, latte art and more.",
    highlights: [
      "Hands-on espresso and milk frothing",
      "Latte art fundamentals",
      "Coffee preparation techniques",
      "Taught by an experienced UAE barista",
    ],
    formTitle: "Register for Training",
    dateLabel: "Preferred training start date",
    submitLabel: "Register Now",
    successTitle: "Registration received",
    successText:
      "Thank you for registering. Our team will contact you to confirm your training date and details.",
    extraFields: [
      {
        name: "experience",
        label: "Experience level",
        type: "select",
        required: true,
        options: ["Complete beginner", "Some experience", "Working barista"],
      },
      {
        name: "participants",
        label: "Number of participants",
        type: "number",
        required: true,
        min: 1,
        max: 50,
        defaultValue: "1",
      },
      {
        name: "goal",
        label: "What do you want to achieve?",
        type: "select",
        required: false,
        options: [
          "Start a coffee business",
          "Improve my current skills",
          "Staff training",
          "Personal interest",
        ],
      },
      { name: "notes", label: "Anything else we should know?", type: "textarea", required: false },
    ],
  },
  rental: {
    key: "rental",
    slug: "rent-coffee-machine",
    emailSubject: "New Coffee Machine Rental Request",
    pageTitle: "Rent a Professional Coffee Machine | I-Coffee",
    heroTitle: "Rent a Professional Coffee Machine",
    heroSubtitle:
      "Flexible rental packages from ₦100,000 - ₦180,000 with professional barista setup and on-site technical support.",
    highlights: [
      "Flexible rental package",
      "Professional barista package",
      "On-site technical support",
      "Perfect coffee, every time",
    ],
    formTitle: "Book a Rental",
    dateLabel: "Preferred rental start date",
    submitLabel: "Request Booking",
    successTitle: "Booking request received",
    successText:
      "Thank you. Our team will contact you to confirm availability, pricing and delivery details.",
    extraFields: [
      {
        name: "useCase",
        label: "What is it for?",
        type: "select",
        required: true,
        options: ["Event / Party", "Office", "Cafe / Restaurant", "Pop-up / Exhibition", "Other"],
      },
      {
        name: "duration",
        label: "Rental duration",
        type: "select",
        required: true,
        options: ["1 day", "2-3 days", "1 week", "2 weeks", "1 month", "Longer"],
      },
      {
        name: "machines",
        label: "Number of machines",
        type: "number",
        required: true,
        min: 1,
        max: 20,
        defaultValue: "1",
      },
      {
        name: "baristaNeeded",
        label: "Need a barista with the machine?",
        type: "select",
        required: true,
        options: ["Yes", "No"],
      },
      { name: "location", label: "Delivery / event location", type: "text", required: true },
      { name: "notes", label: "Anything else we should know?", type: "textarea", required: false },
    ],
  },
};
