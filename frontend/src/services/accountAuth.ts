import { API, getApiErrorMessage } from "./http";

export type AccountUser = {
  name: string;
  email: string;
  phone: string;
  rut: string;
  address: string;
};

type AccountSession = {
  token: string;
  user: AccountUser;
};

type AuthResponse = AccountSession;

export const ACCOUNT_SESSION_KEY = "my-favorite-rug-account-session";
export const ACCOUNT_AUTH_EVENT = "my-favorite-rug-account-auth";

function notifyAuthChanged() {
  window.dispatchEvent(new Event(ACCOUNT_AUTH_EVENT));
}

function readSession(): AccountSession | null {
  const rawSession = window.localStorage.getItem(ACCOUNT_SESSION_KEY);

  if (!rawSession) return null;

  try {
    const parsed = JSON.parse(rawSession);

    if (parsed?.token && parsed?.user) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

function saveSession(session: AccountSession) {
  window.localStorage.setItem(ACCOUNT_SESSION_KEY, JSON.stringify(session));
  notifyAuthChanged();
}

function authHeaders() {
  const token = getAccountToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getAccountUser(): AccountUser | null {
  return readSession()?.user ?? null;
}

export function getAccountToken(): string | null {
  return readSession()?.token ?? null;
}

export async function loginAccount(email: string, password: string) {
  try {
    const response = await API.post<AuthResponse>("/auth/login", { email, password });
    saveSession(response.data);
    return response.data.user;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo iniciar sesion."), { cause: error });
  }
}

type RegisterAccountInput = {
  name: string;
  email: string;
  password: string;
  phone: string;
  rut: string;
  address: string;
};

export async function registerAccount(input: RegisterAccountInput) {
  try {
    const response = await API.post<AuthResponse>("/auth/register", {
      name: input.name,
      email: input.email,
      password: input.password,
      phone: input.phone,
      rut: input.rut,
      address: input.address,
    });
    saveSession(response.data);
    return response.data.user;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo crear la cuenta."), { cause: error });
  }
}

export async function requestPasswordReset(email: string) {
  try {
    await API.post("/auth/password-reset/request", { email });
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo enviar el token de recuperacion."), { cause: error });
  }
}

export async function confirmPasswordReset(email: string, token: string, password: string) {
  try {
    await API.post("/auth/password-reset/confirm", { email, token, password });
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo restaurar la contrasena."), { cause: error });
  }
}

export async function refreshAccountUser() {
  const token = getAccountToken();

  if (!token) return null;

  try {
    const response = await API.get<AccountUser>("/auth/me", { headers: authHeaders() });
    saveSession({ token, user: response.data });
    return response.data;
  } catch {
    logoutAccount();
    return null;
  }
}

type UpdateAccountUserInput = Pick<AccountUser, "name" | "phone" | "address">;

export async function updateAccountUser(nextUser: UpdateAccountUserInput) {
  const session = readSession();

  if (!session) {
    throw new Error("Sesion invalida.");
  }

  try {
    const response = await API.patch<AccountUser>("/auth/me", {
      name: nextUser.name,
      phone: nextUser.phone,
      address: nextUser.address,
    }, { headers: authHeaders() });
    saveSession({ token: session.token, user: response.data });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo actualizar la cuenta."), { cause: error });
  }
}

export async function logoutAccount() {
  try {
    await API.post("/auth/logout", null, { headers: authHeaders() });
  } finally {
    window.localStorage.removeItem(ACCOUNT_SESSION_KEY);
    notifyAuthChanged();
  }
}
