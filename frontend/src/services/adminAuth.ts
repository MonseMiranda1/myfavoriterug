import { API, getApiErrorMessage } from "./http";

const ADMIN_SESSION_KEY = "my-favorite-rug-admin-session";

export function getAdminToken() {
  return window.sessionStorage.getItem(ADMIN_SESSION_KEY);
}

export function isAdminLoggedIn() {
  return Boolean(getAdminToken());
}

export async function loginAdmin(username: string, password: string) {
  try {
    const response = await API.post<{ token: string }>("/admin/login", { username, password });
    window.sessionStorage.setItem(ADMIN_SESSION_KEY, response.data.token);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Usuario o password incorrecto."), { cause: error });
  }
}

export async function logoutAdmin() {
  const token = getAdminToken();
  window.sessionStorage.removeItem(ADMIN_SESSION_KEY);

  if (token) {
    await API.post("/admin/logout", null, { headers: { "X-Admin-Token": token } }).catch(() => undefined);
  }
}
