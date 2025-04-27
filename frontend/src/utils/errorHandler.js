import { toast } from "react-hot-toast";

export const ERROR_MESSAGES = {
  DEFAULT: "Something went wrong. Please try again later.",
  NETWORK: "Network error. Please check your connection.",
  UNAUTHORIZED: "Please login to continue.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION: "Please check your input and try again.",
  SERVER: "Server error. Please try again later.",
};

export const handleError = (error, customMessage = "") => {
  // Prevent console errors in production
  if (process.env.NODE_ENV !== "development") {
    console.error = () => {};
    console.warn = () => {};
  }

  // Network errors
  if (!navigator.onLine) {
    toast.error(ERROR_MESSAGES.NETWORK);
    return;
  }

  // Axios/API errors
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || customMessage || ERROR_MESSAGES.DEFAULT;

    switch (status) {
      case 401:
        toast.error(ERROR_MESSAGES.UNAUTHORIZED);
        // Redirect to login if needed
        window.location.href = "/login";
        break;
      case 403:
        toast.error(ERROR_MESSAGES.FORBIDDEN);
        break;
      case 404:
        toast.error(ERROR_MESSAGES.NOT_FOUND);
        break;
      case 422:
        toast.error(ERROR_MESSAGES.VALIDATION);
        break;
      case 500:
        toast.error(ERROR_MESSAGES.SERVER);
        break;
      default:
        toast.error(message);
    }
    return;
  }

  // Generic errors
  toast.error(customMessage || ERROR_MESSAGES.DEFAULT);
};