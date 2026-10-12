import { apiRequest, clearToken, setToken } from "./client";

export interface AuthSession {
  token: string;
  principal: string;
  role: "admin" | "user" | "guest";
}

export async function login(
  principal: string,
  password?: string,
): Promise<AuthSession> {
  const session = await apiRequest<AuthSession>("/api/auth/login", {
    method: "POST",
    body: { principal, email: principal, password: password ?? "" },
  });
  setToken(session.token);
  return session;
}

export async function register(
  email: string,
  password: string,
  companyName: string,
  fullName?: string,
): Promise<AuthSession> {
  const session = await apiRequest<AuthSession>("/api/auth/register", {
    method: "POST",
    body: { email, password, companyName, fullName: fullName ?? companyName },
  });
  setToken(session.token);
  return session;
}

export async function logout(): Promise<void> {
  clearToken();
  try {
    await apiRequest<void>("/api/auth/logout", { method: "POST" });
  } catch {
    // best-effort server logout
  }
}

export function getSession(): Promise<AuthSession> {
  return apiRequest<AuthSession>("/api/auth/session");
}
