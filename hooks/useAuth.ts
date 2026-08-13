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
function readAuthFromStorage(): {
  isAuthenticated: boolean;
  user: LoggedInUser | null;
} {
  const token = localStorage.getItem("access");
  const storedUser = localStorage.getItem("loggedInUser");

  const agentToken = localStorage.getItem("agent_access_token");
  const storedAgent = localStorage.getItem("agent");
  const agentRefreshToken = localStorage.getItem("agent_refresh_token");

  const hasRetail = !!token && !!storedUser;
  // An agent session exists if the access token is present, or if a
  // refresh token is still available (the client-side hook will
  // transparently refresh the access token).
  const hasAgent = (!!agentToken || !!agentRefreshToken) && !!storedAgent;

  if (!hasRetail && !hasAgent) {
    return {
      isAuthenticated: false,
      user: null,
    };
  }

  try {
    if (hasRetail && storedUser) {
      return {
        isAuthenticated: true,
        user: JSON.parse(storedUser),
      };
    }

    if (hasAgent && storedAgent) {
      return {
        isAuthenticated: true,
        user: JSON.parse(storedAgent),
      };
    }
  } catch (err) {
    console.error(err);
  }

  return {
    isAuthenticated: false,
    user: null,
  };
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