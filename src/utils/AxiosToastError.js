import toast from 'react-hot-toast';

// Track recently shown error messages to suppress duplicates within a short window
const recentErrors = new Map();
const DEDUP_WINDOW_MS = 2000;

const AxiosToastError = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong. Please try again.';

  // Don't show the same error toast more than once per 2 seconds
  const now = Date.now();
  if (recentErrors.has(message) && now - recentErrors.get(message) < DEDUP_WINDOW_MS) {
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
