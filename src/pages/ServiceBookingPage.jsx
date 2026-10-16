// client/src/pages/ServiceBookingPage.jsx
// Shared registration + calendar booking page for the home-banner services.
import React, { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isBefore,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaEnvelope,
  FaPaperPlane,
  FaPhone,
  FaUser,
  FaWhatsapp,
} from "react-icons/fa";
import toast from "react-hot-toast";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import {
  CLOSED_WEEKDAYS,
  CONTACT_MODES,
  MAX_BOOKING_DAYS_AHEAD,
  TIME_SLOTS,
} from "../config/bookingServices";
import { sendBookingRequest } from "../utils/sendBookingRequest";

const inputCls =
  "w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200";
const labelCls = "block text-secondary-200 font-medium mb-2";
const COOLDOWN_MS = 60 * 1000;

const Calendar = ({ value, onChange }) => {
  const today = startOfDay(new Date());
  const maxDate = addDays(today, MAX_BOOKING_DAYS_AHEAD);
  const [month, setMonth] = useState(startOfMonth(value || today));

  const days = useMemo(() => {
    const first = startOfMonth(month);
    const lead = first.getDay();
    const total = endOfMonth(month).getDate();
    return [
      ...Array(lead).fill(null),
      ...Array.from({ length: total }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
    ];
  }, [month]);

  const disabled = (d) =>
    isBefore(d, today) || d > maxDate || CLOSED_WEEKDAYS.includes(d.getDay());

  return (
    <div className="border border-gray-300 rounded-lg bg-white p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          aria-label="Previous month"
          disabled={!isBefore(today, startOfMonth(month))}
          onClick={() => setMonth(subMonths(month, 1))}
          className="p-2 rounded hover:bg-background-100 disabled:opacity-30"
        >
          <FaChevronLeft />
        </button>
        <span className="font-semibold text-secondary-200">{format(month, "MMMM yyyy")}</span>
        <button
          type="button"
          aria-label="Next month"
          disabled={startOfMonth(addMonths(month, 1)) > maxDate}
          onClick={() => setMonth(addMonths(month, 1))}
          className="p-2 rounded hover:bg-background-100 disabled:opacity-30"
        >
          <FaChevronRight />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) =>
          d ? (
            <button
              key={i}
              type="button"
              disabled={disabled(d)}
              onClick={() => onChange(d)}
              className={`aspect-square rounded-full text-sm transition ${
                value && format(value, "yyyy-MM-dd") === format(d, "yyyy-MM-dd")
                  ? "bg-secondary-200 text-white font-semibold"
                  : "hover:bg-background-100 text-gray-800"
              } disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed`}
            >
              {d.getDate()}
            </button>
          ) : (
            <div key={i} />
          ),
        )}
      </div>
    </div>
  );
};

const ServiceBookingPage = ({ service }) => {
  const { width, height } = useWindowSize();
  const initialExtras = Object.fromEntries(
    service.extraFields.map((f) => [f.name, f.defaultValue ?? ""]),
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    whatsappSame: true,
    contactMode: "Phone call",
    timeSlot: "",
    honeypot: "",
    consent: false,
    ...initialExtras,
  });
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.title = service.pageTitle;
    window.scrollTo(0, 0);
  }, [service]);

  const set = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.honeypot) return; // bot
    if (!date) return toast.error("Please choose a date");
    if (!form.timeSlot) return toast.error("Please choose morning or afternoon");
    if (!form.consent) return toast.error("Please agree to be contacted");

    const last = Number(localStorage.getItem(`booking:${service.slug}`) || 0);
    if (Date.now() - last < COOLDOWN_MS) {
      return toast.error("Please wait a minute before submitting again");
    }

    const whatsapp = form.whatsappSame ? form.phone : form.whatsapp;

    try {
      setLoading(true);
      await sendBookingRequest({
        service: service.key,
        name: form.name,
        email: form.email,
        phone: form.phone,
        whatsapp,
        contactMode: form.contactMode,
        date: format(date, "yyyy-MM-dd"),
        timeSlot: form.timeSlot,
        honeypot: form.honeypot,
        extras: service.extraFields.map((f) => ({ label: f.label, value: form[f.name] })),
      });
      localStorage.setItem(`booking:${service.slug}`, String(Date.now()));
      setDone(true);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "We couldn't send your request. Please try again or call us.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="bg-background-100 min-h-[70vh] py-16 px-4">
        <Confetti width={width} height={height} recycle={false} numberOfPieces={400} gravity={0.3} />
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center space-y-5">
          <FaCheckCircle className="text-green-600 text-6xl mx-auto" />
          <h1 className="text-3xl font-bold text-secondary-200">{service.successTitle}</h1>
          <p className="text-gray-600">{service.successText}</p>
          <p className="text-gray-700">
            We'll reach you by <strong>{form.contactMode}</strong> on{" "}
            <strong>{date && format(date, "d MMM yyyy")}</strong> ({form.timeSlot.toLowerCase()}).
          </p>
          <a
            href="/"
            className="inline-block bg-secondary-200 hover:bg-secondary-100 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-100 min-h-screen">
      <div className="bg-gradient-to-r from-secondary-100 to-secondary-200 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16 text-center max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{service.heroTitle}</h1>
          <p className="text-lg text-amber-100">{service.heroSubtitle}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8 max-w-6xl">
        <aside className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white rounded-xl shadow p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-secondary-200 mb-4">What you get</h2>
            <ul className="space-y-3">
              {service.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-gray-700">
                  <FaCheckCircle className="text-primary-200 mt-1 flex-shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <form
          onSubmit={submit}
          className="lg:col-span-2 order-1 lg:order-2 bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6"
        >
          <h2 className="text-2xl font-bold text-secondary-200">{service.formTitle}</h2>

          {/* honeypot - hidden from humans */}
          <input
            type="text"
            name="honeypot"
            value={form.honeypot}
            onChange={set}
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Full name *</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-4 text-gray-400" />
                <input name="name" required value={form.name} onChange={set} className={`${inputCls} pl-10`} placeholder="Your full name" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Email address *</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-4 text-gray-400" />
                <input type="email" name="email" required value={form.email} onChange={set} className={`${inputCls} pl-10`} placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Phone number *</label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-4 text-gray-400" />
                <input type="tel" name="phone" required value={form.phone} onChange={set} className={`${inputCls} pl-10`} placeholder="+234 800 000 0000" />
              </div>
            </div>
            <div>
              <label className={labelCls}>WhatsApp number *</label>
              <div className="relative">
                <FaWhatsapp className="absolute left-3 top-4 text-gray-400" />
                <input
                  type="tel"
                  name="whatsapp"
                  required={!form.whatsappSame}
                  disabled={form.whatsappSame}
                  value={form.whatsappSame ? form.phone : form.whatsapp}
                  onChange={set}
                  className={`${inputCls} pl-10 disabled:bg-gray-100`}
                  placeholder="+234 800 000 0000"
                />
              </div>
              <label className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <input type="checkbox" name="whatsappSame" checked={form.whatsappSame} onChange={set} className="accent-secondary-200" />
                Same as phone number
              </label>
            </div>
          </div>

          <div>
            <label className={labelCls}>How should we reach you? *</label>
            <div className="flex flex-wrap gap-3">
              {CONTACT_MODES.map((m) => (
                <label
                  key={m.value}
                  className={`cursor-pointer px-4 py-2 rounded-lg border transition ${
                    form.contactMode === m.value
                      ? "bg-secondary-200 text-white border-secondary-200"
                      : "bg-white border-gray-300 hover:border-primary-200"
                  }`}
                >
                  <input type="radio" name="contactMode" value={m.value} checked={form.contactMode === m.value} onChange={set} className="sr-only" />
                  {m.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {service.extraFields
              .filter((f) => f.type !== "textarea")
              .map((f) => (
                <div key={f.name}>
                  <label className={labelCls}>
                    {f.label} {f.required && "*"}
                  </label>
                  {f.type === "select" ? (
                    <select name={f.name} required={f.required} value={form[f.name]} onChange={set} className={inputCls}>
                      <option value="">Select...</option>
                      {f.options.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input type={f.type} name={f.name} required={f.required} min={f.min} max={f.max} value={form[f.name]} onChange={set} className={inputCls} />
                  )}
                </div>
              ))}
          </div>

          <div>
            <label className={`${labelCls} flex items-center gap-2`}>
              <FaCalendarAlt className="text-primary-200" /> {service.dateLabel} *
            </label>
            <Calendar value={date} onChange={setDate} />
            {date && (
              <p className="mt-2 text-sm text-secondary-100">
                Selected: <strong>{format(date, "EEEE, d MMMM yyyy")}</strong>
              </p>
            )}
          </div>

          <div>
            <label className={labelCls}>Best time to reach you / start *</label>
            <div className="grid sm:grid-cols-2 gap-3">
              {TIME_SLOTS.map((s) => (
                <label
                  key={s.value}
                  className={`cursor-pointer p-4 rounded-lg border transition ${
                    form.timeSlot === s.value
                      ? "bg-secondary-200 text-white border-secondary-200"
                      : "bg-white border-gray-300 hover:border-primary-200"
                  }`}
                >
                  <input type="radio" name="timeSlot" value={s.value} checked={form.timeSlot === s.value} onChange={set} className="sr-only" />
                  <div className="font-semibold">{s.label}</div>
                  <div className="text-sm opacity-80">{s.hint}</div>
                </label>
              ))}
            </div>
          </div>

          {service.extraFields
            .filter((f) => f.type === "textarea")
            .map((f) => (
              <div key={f.name}>
                <label className={labelCls}>{f.label}</label>
                <textarea name={f.name} rows={3} value={form[f.name]} onChange={set} className={inputCls} />
              </div>
            ))}

          <label className="flex items-start gap-2 text-sm text-gray-600">
            <input type="checkbox" name="consent" checked={form.consent} onChange={set} className="mt-1 accent-secondary-200" />
            I agree to be contacted by I-Coffee about this request.
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-100 hover:opacity-90 disabled:opacity-60 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
          >
            <FaPaperPlane /> {loading ? "Sending..." : service.submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceBookingPage;
