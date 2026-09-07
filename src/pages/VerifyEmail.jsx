import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { verifyEmailWithCode } from "@yehgs/icvng-core/auth";

// This page did not exist before — the emailed verification link
// (${domain}/verify-email?code=${userId}, see
// server/controllers/user.controller.js) had no route/page consuming it
// at all, so clicking it landed on the 404 page and left the account
// unverified with no way to complete the flow. verifyEmailWithCode is the
// same function the mobile app's deep-link handler uses, so both
// platforms confirm a code the identical way.
const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const [status, setStatus] = useState("checking"); // 'checking' | 'success' | 'error'
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await verifyEmailWithCode({
        apiClient: Axios,
        endpoints: SummaryApi,
        code,
      });
      if (cancelled) return;
      if (result.success) {
        setStatus("success");
        setMessage(
          result.alreadyVerified
            ? "Your email was already verified."
            : "Your email is now verified.",
        );
      } else {
        setStatus("error");
        setMessage(result.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-white rounded-lg shadow-sm border p-8">
        {status === "checking" && (
          <>
            <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Verifying your email…</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-4" />
            <h1 className="text-lg font-semibold mb-2">Email verified</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-green-700 text-white rounded-md px-6 py-2 font-medium hover:bg-green-800"
            >
              Go to login
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-10 h-10 text-red-600 mx-auto mb-4" />
            <h1 className="text-lg font-semibold mb-2">Verification failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/register"
              className="inline-block bg-green-700 text-white rounded-md px-6 py-2 font-medium hover:bg-green-800"
            >
              Back to registration
            </Link>
          </>
        )}
      </div>
    </section>
  );
};

export default VerifyEmail;
