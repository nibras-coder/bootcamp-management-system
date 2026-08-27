import axios from "axios";

let baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
baseURL = baseURL.replace(/\/$/, "");
if (!baseURL.endsWith("/api")) {
  baseURL += "/api";
}

const API = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
