import axios from "axios";

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  timeout: 20000,
});

API.interceptors.request.use((config) => {
  const token = window.sessionStorage.getItem("my-favorite-rug-admin-session");

  if (token) {
    config.headers.set("X-Admin-Token", token);
  }

  return config;
});

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
}
