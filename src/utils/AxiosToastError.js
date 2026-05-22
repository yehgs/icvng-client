import toast from "react-hot-toast";

// Track recently shown error messages to suppress duplicates within a short window
const recentErrors = new Map();
const DEDUP_WINDOW_MS = 2000;

// Technical error patterns that should never be shown to end users
const TECHNICAL_ERROR_PATTERNS = [
  /buffering timed out/i,
  /MongooseError/i,
  /MongoError/i,
  /ECONNREFUSED/i,
  /ENOTFOUND/i,
  /network.*error/i,
  /timeout.*after/i,
  /aggregate.*timed/i,
  /find.*timed/i,
];

const isTechnicalError = (message) =>
  TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(message));

const AxiosToastError = (error) => {
  const rawMessage =
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again.";

  // Silently swallow technical DB/network errors — show a generic message instead
  const message = isTechnicalError(rawMessage)
    ? "Something went wrong. Please try again."
    : rawMessage;

  // Don't show the same error toast more than once per 2 seconds
  const now = Date.now();
  if (
    recentErrors.has(message) &&
    now - recentErrors.get(message) < DEDUP_WINDOW_MS
  ) {
    return;
  }
  recentErrors.set(message, now);

  // Clean up old entries
  for (const [key, timestamp] of recentErrors) {
    if (now - timestamp > DEDUP_WINDOW_MS * 2) recentErrors.delete(key);
  }

  toast.error(message);
};

export default AxiosToastError;
