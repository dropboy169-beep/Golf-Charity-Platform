import axios from "axios";

// This will use the environment variable VITE_API_BASE_URL if it exists, 
// otherwise it falls back to your local server for development.
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const api = axios.create({
  baseURL: baseURL.endsWith("/api") ? baseURL : `${baseURL}/api`,
});

export default api;