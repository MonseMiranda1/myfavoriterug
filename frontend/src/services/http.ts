import axios from "axios";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").trim().replace(/\/+$/, "");

export const API = axios.create({
  baseURL: apiBaseUrl,
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
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (!error.response) {
      return "No se pudo conectar con el backend. Revisa VITE_API_URL y la configuracion CORS.";
    }
  }

  return fallback;
}
