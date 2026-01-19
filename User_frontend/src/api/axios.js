import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // 15 second timeout
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network error - no response from server
    if (!error.response) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        // Retry once for network errors
        try {
          return await api(originalRequest);
        } catch (retryError) {
          toast.error("Network error. Please check your connection.");
          return Promise.reject(retryError);
        }
      }
      toast.error("Unable to connect to server. Please try again.");
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const message = error.response?.data?.message;

    // Handle specific status codes
    switch (status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        if (!originalRequest.url?.includes("/login")) {
          localStorage.removeItem("userToken");
          localStorage.removeItem("user");
          toast.error("Session expired. Please login again.");

          // Delay redirect to show toast
          setTimeout(() => {
            window.location.href = "/login";
          }, 1000);
        }
        break;

      case 403:
        // Forbidden
        toast.error(message || "You don't have permission to perform this action.");
        break;

      case 404:
        // Not found - don't show toast for every 404, let component handle it
        console.warn("Resource not found:", originalRequest.url);
        break;

      case 429:
        // Too many requests
        toast.error("Too many requests. Please wait a moment and try again.");
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        toast.error(message || "Server error. Please try again later.");
        break;

      default:
        // Other errors - show message from backend if available
        if (message && !originalRequest._skipErrorToast) {
          toast.error(message);
        }
    }

    return Promise.reject(error);
  }
);

// Helper to skip automatic error toast for specific requests
export const skipErrorToast = (config) => {
  return { ...config, _skipErrorToast: true };
};

export default api;