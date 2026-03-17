const ADMIN_USER = "adminGate";
const ADMIN_PASS = "Gate2026";
const TOKEN_KEY = "gate01_admin_token";
const TOKEN_VALUE = "gate01_admin_session_active";

export function login(user: string, pass: string): boolean {
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    localStorage.setItem(TOKEN_KEY, TOKEN_VALUE);
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(TOKEN_KEY) === TOKEN_VALUE;
}
