export type AccountUser = {
  name: string;
  email: string;
  phone: string;
  rut: string;
  address: string;
};

export const ACCOUNT_SESSION_KEY = "my-favorite-rug-account-session";
export const ACCOUNT_AUTH_EVENT = "my-favorite-rug-account-auth";

const defaultUser: AccountUser = {
  name: "miussette alfaro silva",
  email: "miussette.alfaro@gmail.com",
  phone: "+56929631899",
  rut: "180651039",
  address: "kkkk, kkkk, kkkk - kkkk",
};

function notifyAuthChanged() {
  window.dispatchEvent(new Event(ACCOUNT_AUTH_EVENT));
}

export function getAccountUser(): AccountUser | null {
  const rawSession = window.localStorage.getItem(ACCOUNT_SESSION_KEY);

  if (!rawSession) return null;

  try {
    const parsed = JSON.parse(rawSession);
    return { ...defaultUser, ...parsed };
  } catch {
    return null;
  }
}

export function loginAccount(email: string) {
  const user = {
    ...defaultUser,
    email,
    name: email.trim().toLowerCase() === defaultUser.email ? defaultUser.name : email.split("@")[0],
  };

  window.localStorage.setItem(ACCOUNT_SESSION_KEY, JSON.stringify(user));
  notifyAuthChanged();
  return user;
}

export function updateAccountUser(nextUser: AccountUser) {
  window.localStorage.setItem(ACCOUNT_SESSION_KEY, JSON.stringify(nextUser));
  notifyAuthChanged();
  return nextUser;
}

export function logoutAccount() {
  window.localStorage.removeItem(ACCOUNT_SESSION_KEY);
  notifyAuthChanged();
}
