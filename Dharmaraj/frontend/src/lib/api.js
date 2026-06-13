import axios from "axios";

// 1. Point directly to your local FastAPI backend server (port 8000)
const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000") + "/api";
// Remove the mandatory "/api" append so endpoints point to straight paths like /auth/login
export const API = BACKEND_URL; 

const ACCESS_TOKEN_STORAGE_KEY = "dharmaraj_access_token";

const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
};

export const setAccessToken = (token) => {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  }
};

export const getAccessToken = () => getStoredToken();

export const clearAccessToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
};

export const apiClient = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAccessToken();
    }
    return Promise.reject(error);
  }
);

export const inr = (n) => "₹" + (n || 0).toLocaleString("en-IN");

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}