import axios from "axios";

// This will use the environment variable VITE_API_BASE_URL if it exists, 
// otherwise it falls back to your local server for development.
const rawBaseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
// Trim trailing slash if it exists
const sanitizedBaseURL = rawBaseURL.replace(/\/$/, "");
const api = axios.create({
  baseURL: sanitizedBaseURL.endsWith("/api") ? sanitizedBaseURL : `${sanitizedBaseURL}/api`,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;