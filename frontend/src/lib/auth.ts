const TOKEN_KEY = "ds_token";
const USER_EMAIL_KEY = "ds_email";
const USER_ROLE_KEY = "ds_role";

export type AuthUser = {
  email: string;
  role: string;
};

export const authStore = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setAuth(token: string, email: string, role: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_EMAIL_KEY, email);
    localStorage.setItem(USER_ROLE_KEY, role);
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
  },
  getUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const email = localStorage.getItem(USER_EMAIL_KEY);
    const role = localStorage.getItem(USER_ROLE_KEY);
    if (!email || !role) return null;
    return { email, role };
  },
};
