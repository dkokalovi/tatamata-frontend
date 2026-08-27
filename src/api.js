import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Slike sad zahtijevaju autorizaciju (vidi server/routes/uploads.js), pa <img> tag
// ne moze samo koristiti putanju iz baze direktno - <img> ne salje custom headere,
// pa se token mora priloziti kao query parametar u samom URL-u.
export function imageUrl(path) {
  if (!path) return "";
  const token = localStorage.getItem("token");
  return `${path}${token ? `?token=${encodeURIComponent(token)}` : ""}`;
}

export default api;
