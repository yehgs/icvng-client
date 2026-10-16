// client/src/utils/sendBookingEmail.js
// Frontend-only delivery via EmailJS. One email per recipient (so every
// address gets its own copy); succeeds if at least one delivery succeeds.
import emailjs from "@emailjs/browser";
import { getRecipients } from "../config/bookingServices";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_BOOKING_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const isEmailConfigured = () => Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

export async function sendBookingEmail({ subject, fields, replyTo, fromName }) {
  if (!isEmailConfigured()) throw new Error("EMAIL_NOT_CONFIGURED");

  // Plain-text body so the EmailJS template only needs {{details}}
  const details = fields.map(({ label, value }) => `${label}: ${value || "-"}`).join("\n");

  const recipients = getRecipients();
  const results = await Promise.allSettled(
    recipients.map((to) =>
      emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        { to_email: to, subject, details, reply_to: replyTo, from_name: fromName },
        { publicKey: PUBLIC_KEY },
      ),
    ),
  );

  const ok = results.filter((r) => r.status === "fulfilled").length;
  if (ok === 0) throw new Error("EMAIL_SEND_FAILED");
  return { sent: ok, total: recipients.length };
}
