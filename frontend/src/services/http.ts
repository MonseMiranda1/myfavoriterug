import axios from "axios";

const rawApiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").trim().replace(/\/+$/, "");

function getApiBaseUrlIssue(baseUrl: string) {
  if (baseUrl.includes("*")) {
    return "VITE_API_URL debe apuntar al backend, no puede usar comodines como *.vercel.app.";
  }

  if (!/^https?:\/\//i.test(baseUrl)) {
    return "VITE_API_URL debe empezar con http:// o https://.";
  }

  try {
    const url = new URL(baseUrl);

    if (!url.pathname.endsWith("/api")) {
      return "VITE_API_URL debe terminar en /api, por ejemplo https://tu-backend.onrender.com/api.";
    }
  } catch {
    return "VITE_API_URL no es una URL valida.";
  }

  return "";
}

const apiBaseUrlIssue = getApiBaseUrlIssue(rawApiBaseUrl);

export const API = axios.create({
  baseURL: rawApiBaseUrl,
  timeout: 20000,
});

API.interceptors.request.use((config) => {
  if (apiBaseUrlIssue) {
    throw new Error(apiBaseUrlIssue);
  }

  const token = window.sessionStorage.getItem("my-favorite-rug-admin-session");

  if (token) {
    config.headers.set("X-Admin-Token", token);
  }

  return config;
});

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.startsWith("VITE_API_URL")) {
    return error.message;
  }

  if (axios.isAxiosError<{ message?: string }>(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (!error.response) {
      if (error.message.includes("Unsupported protocol")) {
        return "VITE_API_URL debe empezar con http:// o https:// y apuntar al backend con /api.";
      }

      return "No se pudo conectar con el backend. Revisa VITE_API_URL y la configuracion CORS.";
    }
  }

  return fallback;
}
