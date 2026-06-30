/**
 * client/src/pages/GoogleAuthSuccess.jsx
 *
 * Landing page at /auth/google/success
 *
 * The server redirects here after successful Google OAuth with:
 *   ?accesstoken=...&refreshToken=...&userId=...&userName=...#/redirectPath
 *
 * This page:
 *   1. Reads tokens from query params
 *   2. Stores them in localStorage (same keys as normal login)
 *   3. Dispatches user details to Redux
 *   4. Navigates to the hash redirect path (or home)
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserDetails } from "../store/userSlice";
import fetchUserDetails from "../utils/fetchUserDetails";
import Loading from "../components/Loading";

export default function GoogleAuthSuccess() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const [error, setError] = useState(null);

  useEffect(() => {
    async function handleSuccess() {
      try {
        const params = new URLSearchParams(location.search);
        const hash   = location.hash?.replace("#", "") || "/";

        const accesstoken  = params.get("accesstoken");
        const refreshToken = params.get("refreshToken");
        const oauthError   = params.get("error");

        if (oauthError) {
          const messages = {
            google_access_denied: "Google sign-in was cancelled.",
            no_email:             "No email address was returned from Google.",
            server_error:         "Server error during sign-in. Please try again.",
          };
          setError(messages[oauthError] || "Google sign-in failed. Please try again.");
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        if (!accesstoken || !refreshToken) {
          setError("Authentication tokens missing. Please try again.");
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        // ── Store tokens (same keys the normal login uses) ─────────────────
        localStorage.setItem("accesstoken", accesstoken);
        localStorage.setItem("refreshToken", refreshToken);

        // ── Fetch and dispatch full user details ───────────────────────────
        try {
          const userDetails = await fetchUserDetails();
          if (userDetails?.data) {
            dispatch(setUserDetails(userDetails.data));
          }
        } catch (e) {
          console.warn("Could not fetch user details:", e.message);
        }

        // ── Navigate to intended destination ───────────────────────────────
        const redirectTo = hash?.startsWith("/") ? hash : "/";
        navigate(redirectTo, { replace: true });
      } catch (err) {
        console.error("GoogleAuthSuccess error:", err);
        setError("An unexpected error occurred. Please try logging in again.");
        setTimeout(() => navigate("/login"), 3000);
      }
    }

    handleSuccess();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-4xl">❌</div>
        <h2 className="text-xl font-semibold text-gray-800">Sign-in failed</h2>
        <p className="text-gray-500 max-w-sm">{error}</p>
        <p className="text-sm text-gray-400">Redirecting to login…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loading />
      <p className="text-gray-500 text-sm">Completing Google sign-in…</p>
    </div>
  );
}
