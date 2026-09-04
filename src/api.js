import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const BACKEND_ROOT = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "")
  : "";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function imageUrl(path) {
  if (!path) return "";
  const token = localStorage.getItem("token");
  return `${BACKEND_ROOT}${path}${token ? `?token=${encodeURIComponent(token)}` : ""}`;
}

export default api;