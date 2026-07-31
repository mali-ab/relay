import axios from "axios";
import type { AxiosInstance } from "axios";

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || "/api";
const normalizedBaseURL = rawBaseURL.endsWith("/api")
  ? rawBaseURL
  : `${rawBaseURL.replace(/\/$/, "")}/api`;

const api: AxiosInstance = axios.create({
  baseURL: normalizedBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;

      const bodyMethods = new Set(["post", "put", "patch", "delete"]);
      if (config.method && bodyMethods.has(config.method.toLowerCase())) {
        if (config.data) {
          config.data.token = token;
        } else {
          config.data = { token };
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login"; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;