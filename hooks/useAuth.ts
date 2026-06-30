"use client";

import { useEffect, useState } from "react";

type LoggedInUser = {
  fullName?: string;
  full_name?: string;
  email?: string;
};

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: LoggedInUser | null;
};

function readAuthFromStorage(): { isAuthenticated: boolean; user: LoggedInUser | null } {
  const token = localStorage.getItem("access");
  const storedUser = localStorage.getItem("loggedInUser");

  if (!token || !storedUser) {
    return { isAuthenticated: false, user: null };
  }

  try {
    const parsedUser = JSON.parse(storedUser) as LoggedInUser;
    return { isAuthenticated: true, user: parsedUser };
  } catch {
    return { isAuthenticated: false, user: null };
  }
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    const { isAuthenticated, user } = readAuthFromStorage();
    setState({ isAuthenticated, isLoading: false, user });

    const handleStorageChange = () => {
      const { isAuthenticated, user } = readAuthFromStorage();
      setState({ isAuthenticated, isLoading: false, user });
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-changed", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-changed", handleStorageChange);
    };
  }, []);

  return state;
}