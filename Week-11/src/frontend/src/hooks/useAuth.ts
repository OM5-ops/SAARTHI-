import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useCallback } from "react";

export interface AuthState {
  isAuthenticated: boolean;
  isInitializing: boolean;
  principal: string | null;
  login: () => void;
  logout: () => void;
}

export function useAuth(): AuthState {
  const { identity, login, clear, isAuthenticated, isInitializing } =
    useInternetIdentity();

  const handleLogout = useCallback(() => {
    clear();
  }, [clear]);

  return {
    isAuthenticated,
    isInitializing,
    principal: identity?.getPrincipal().toText() ?? null,
    login,
    logout: handleLogout,
  };
}
