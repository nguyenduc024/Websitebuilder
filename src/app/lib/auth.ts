const AUTH_STORAGE_KEY = "healthlink-authenticated";

const ADMIN_USERNAME = "nhom8";
const ADMIN_PASSWORD = "hub@1976";

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

export function login(username: string, password: string): boolean {
  const isValid = username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD;

  if (isValid) {
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
  }

  return isValid;
}

export function logout(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}