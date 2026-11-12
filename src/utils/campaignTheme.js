/**
 * utils/campaignTheme.js
 *
 * Turns a campaign's validated theme (9 hex colours set by an admin) into the storefront's BRAND
 * tokens (primary-200/100, secondary-200/100, background-100, accent-100), so the seasonal look reaches
 * every page that uses the Tailwind brand colours — home, shop, product, cart, checkout, orders,
 * account — not only the campaign landing page.
 *
 * The admin can pick any colours, so every derived token is adjusted to keep text readable on the
 * surfaces the storefront actually puts it on (white cards and the page background). Dark palettes
 * (e.g. Black Friday) therefore colour the brand accents, headings, buttons, announcement bar and
 * hero bands, while the page body stays a light tint of the palette: product, cart and checkout
 * surfaces are white across ~100 components and must stay readable.
 *
 * Output values are space-separated RGB channels ("198 156 109") so Tailwind opacity modifiers
 * (bg-primary-200/50) keep working. Pure functions, no DOM access.
 */

const HEX = /^#[0-9a-f]{6}$/i;

export const DEFAULT_BRAND = Object.freeze({
  "primary-200": "#C69C6D", "primary-100": "#D9A87C", "secondary-200": "#4B2E2B",
  "secondary-100": "#6D4C41", "background-100": "#EDE0D4", "accent-100": "#9B2226",
});

export const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
export const rgbToHex = ([r, g, b]) => `#${[r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("")}`;
const channel = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
export const luminance = (hex) => { const [r, g, b] = hexToRgb(hex); return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b); };
export const contrast = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
export const mix = (a, b, w) => { const A = hexToRgb(a), B = hexToRgb(b); return rgbToHex(A.map((v, i) => v * (1 - w) + B[i] * w)); };

/** Darken `hex` toward black in small steps until it reaches `min` contrast against every colour in `against`. */
export function ensureContrast(hex, against, min) {
  let out = hex;
  for (let i = 0; i < 40 && against.some((bg) => contrast(out, bg) < min); i += 1) out = mix(out, "#000000", 0.08);
  return out;
}

const valid = (v, fallback) => (typeof v === "string" && HEX.test(v.trim()) ? v.trim() : fallback);

/** @returns {Record<string,string>|null} tokens as hex, or null when there is no usable theme. */
export function deriveBrandTokens(theme) {
  if (!theme || typeof theme !== "object") return null;
  const primary = valid(theme.primaryColor, null);
  if (!primary) return null; // no palette → keep the normal storefront
  const secondary = valid(theme.secondaryColor, DEFAULT_BRAND["secondary-200"]);
  const accent = valid(theme.accentColor, primary);
  const bgIn = valid(theme.backgroundColor, DEFAULT_BRAND["background-100"]);

  // Page background: the palette's own background when it is light, else a light tint of the primary.
  const bg = luminance(bgIn) >= 0.55 ? bgIn : mix(primary, "#FFFFFF", 0.9);
  const surfaces = ["#FFFFFF", bg];

  const secondary200 = ensureContrast(secondary, surfaces, 7);
  const secondary100 = ensureContrast(mix(secondary200, "#FFFFFF", 0.15), surfaces, 4.5);
  const primary200 = ensureContrast(primary, ["#FFFFFF"], 3);
  const primary100 = mix(primary200, "#FFFFFF", 0.25);
  const accent100 = ensureContrast(accent, ["#FFFFFF"], 4.5);
  return { "primary-200": primary200, "primary-100": primary100, "secondary-200": secondary200, "secondary-100": secondary100, "background-100": bg, "accent-100": accent100 };
}

/** CSS custom properties (RGB channels) for <html>. Empty object = leave the default brand untouched. */
export function brandCssVars(theme) {
  const t = deriveBrandTokens(theme);
  if (!t) return {};
  return Object.fromEntries(Object.entries(t).map(([k, hex]) => [`--brand-${k}`, hexToRgb(hex).join(" ")]));
}
