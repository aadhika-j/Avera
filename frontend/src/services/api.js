import axios from "axios";

const apiBase = import.meta.env.VITE_API_BASE;
if (!apiBase) {
  throw new Error("VITE_API_BASE is required");
}

const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
