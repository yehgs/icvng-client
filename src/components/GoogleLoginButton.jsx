/**
 * client/src/components/GoogleLoginButton.jsx
 *
 * A button that starts the Google OAuth flow.
 * Works on all country domains — the server handles the domain routing.
 *
 * Usage:
 *   <GoogleLoginButton redirect="/checkout" />
 */

import React from "react";
import { FcGoogle } from "react-icons/fc";
import { useCountry } from "../context/CountryContext.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function GoogleLoginButton({ redirect = "/", className = "" }) {
  const { t } = useCountry();

  const handleGoogleLogin = () => {
    const params = new URLSearchParams({
      domain:   window.location.origin,
      redirect: redirect || window.location.pathname,
    });
    window.location.href = `${API_BASE}/api/auth/google?${params}`;
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className={`flex items-center justify-center gap-2 w-full border border-gray-300
                  rounded-lg py-2.5 px-4 text-sm font-medium text-gray-700
                  hover:bg-gray-50 transition-colors duration-150 bg-white
                  focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-500
                  ${className}`}
    >
      <FcGoogle className="w-5 h-5" />
      <span>{t("auth.continueWithGoogle")}</span>
    </button>
  );
}
