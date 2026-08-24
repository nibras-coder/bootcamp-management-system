import axios from "axios";

// In development this uses Vite's `/api` proxy.  In production set
// VITE_API_URL to the public backend URL, including the `/api` path.
const baseURL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

const API = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
