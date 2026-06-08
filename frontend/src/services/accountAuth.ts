import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
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

type RegisterAccountInput = {
  name: string;
  email: string;
  password: string;
  phone: string;
  rut: string;
  address: string;
};

type UpdateAccountUserInput = Pick<AccountUser, "name" | "phone" | "address">;

type AccountAuthState = {
  token: string | null;
  user: AccountUser | null;
  login: (email: string, password: string) => Promise<AccountUser>;
  register: (input: RegisterAccountInput) => Promise<AccountUser>;
  refreshUser: () => Promise<AccountUser | null>;
  updateUser: (nextUser: UpdateAccountUserInput) => Promise<AccountUser>;
  logout: () => Promise<void>;
  clearSession: () => void;
};

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ACCOUNT_AUTH_EVENT));
  }
}

function setSession(set: (session: Partial<AccountAuthState>) => void, session: AccountSession) {
  set({ token: session.token, user: session.user });
  notifyAuthChanged();
}

function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getPersistStorage() {
  if (typeof window === "undefined") {
    return noopStorage;
  }

  return window.localStorage;
}

export const useAccountAuthStore = create<AccountAuthState>()(
  persist(
    (set, get): AccountAuthState => ({
      token: null,
      user: null,
      async login(email, password) {
        try {
          const response = await API.post<AuthResponse>("/auth/login", { email, password });
          setSession(set, response.data);
          return response.data.user;
        } catch (error) {
          throw new Error(getApiErrorMessage(error, "No se pudo iniciar sesion."), { cause: error });
        }
      },
      async register(input) {
        try {
          const response = await API.post<AuthResponse>("/auth/register", {
            name: input.name,
            email: input.email,
            password: input.password,
            phone: input.phone,
            rut: input.rut,
            address: input.address,
          });
          setSession(set, response.data);
          return response.data.user;
        } catch (error) {
          throw new Error(getApiErrorMessage(error, "No se pudo crear la cuenta."), { cause: error });
        }
      },
      async refreshUser() {
        const token = get().token;

        if (!token) return null;

        try {
          const response = await API.get<AccountUser>("/auth/me", { headers: authHeaders(token) });
          setSession(set, { token, user: response.data });
          return response.data;
        } catch {
          get().clearSession();
          return null;
        }
      },
      async updateUser(nextUser) {
        const token = get().token;

        if (!token) {
          throw new Error("Sesion invalida.");
        }

        try {
          const response = await API.patch<AccountUser>("/auth/me", {
            name: nextUser.name,
            phone: nextUser.phone,
            address: nextUser.address,
          }, { headers: authHeaders(token) });
          setSession(set, { token, user: response.data });
          return response.data;
        } catch (error) {
          throw new Error(getApiErrorMessage(error, "No se pudo actualizar la cuenta."), { cause: error });
        }
      },
      async logout() {
        const token = get().token;

        try {
          await API.post("/auth/logout", null, { headers: authHeaders(token) });
        } finally {
          get().clearSession();
        }
      },
      clearSession() {
        set({ token: null, user: null });
        notifyAuthChanged();
      },
    }),
    {
      name: ACCOUNT_SESSION_KEY,
      storage: createJSONStorage(getPersistStorage),
      version: 1,
      partialize: (state) => ({ token: state.token, user: state.user }),
      migrate: (persistedState) => {
        const persisted = persistedState as Partial<AccountSession> & {
          state?: Partial<AccountSession>;
        };

        if (persisted.state?.token && persisted.state.user) {
          return { token: persisted.state.token, user: persisted.state.user };
        }

        if (persisted.token && persisted.user) {
          return { token: persisted.token, user: persisted.user };
        }

        return { token: null, user: null };
      },
    },
  ),
);

export function getAccountUser(): AccountUser | null {
  return useAccountAuthStore.getState().user;
}

export function getAccountToken(): string | null {
  return useAccountAuthStore.getState().token;
}

export async function loginAccount(email: string, password: string) {
  return useAccountAuthStore.getState().login(email, password);
}

export async function registerAccount(input: RegisterAccountInput) {
  return useAccountAuthStore.getState().register(input);
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
  return useAccountAuthStore.getState().refreshUser();
}

export async function updateAccountUser(nextUser: UpdateAccountUserInput) {
  return useAccountAuthStore.getState().updateUser(nextUser);
}

export async function logoutAccount() {
  return useAccountAuthStore.getState().logout();
}
