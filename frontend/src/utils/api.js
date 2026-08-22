import axios from "axios";

// Central axios instance — every mentor page imports this instead of
// calling axios directly, so the base URL and auth header only live in one place.
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
