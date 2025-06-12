import { queryClient } from "./queryClient";

export function getSessionId(): string | null {
  return localStorage.getItem("sessionId");
}

export function setSessionId(sessionId: string): void {
  localStorage.setItem("sessionId", sessionId);
}

export function clearSession(): void {
  localStorage.removeItem("sessionId");
  queryClient.clear();
}

export function isAuthenticated(): boolean {
  return !!getSessionId();
}
