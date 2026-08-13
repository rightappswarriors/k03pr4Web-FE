"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getAgentAccessToken,
  getAgentRefreshToken,
  getAgentInfo,
  setAgentTokens,
  clearAgentAuth,
  isAgentTokenExpired,
  type AgentInfo,
} from "@/lib/agent-auth-storage";
import { refreshAccessToken } from "@/lib/agent-api-client";

/**
 * Hook that manages agent authentication state on the client.
 *
 * Startup flow:
 *   1. Read access + refresh tokens from localStorage.
 *   2. If the access token is still valid → authenticated immediately.
 *   3. If the access token is expired → attempt a silent refresh using the
 *      refresh token via the shared `refreshAccessToken()` (single-flight
 *      lock prevents concurrent refresh calls with agentFetch).
 *      While this is in-flight `isLoading` stays `true` so that protected
 *      pages can show a skeleton instead of firing API calls.
 *   4. If refresh fails or no tokens exist → `isAuthenticated = false`.
 *
 * This guarantees that **no protected page ever fires a data request before
 * authentication has been restored**.
 */
export function useAgentAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [agent, setAgent] = useState<AgentInfo | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const accessToken = getAgentAccessToken();
      const agentInfo = getAgentInfo();

      // No token at all — user is a guest.
      if (!accessToken || !agentInfo) {
        if (!cancelled) {
          setIsAuthenticated(false);
          setAgent(null);
          setIsLoading(false);
        }
        return;
      }

      // Access token still valid — we're good.
      if (!isAgentTokenExpired(accessToken)) {
        if (!cancelled) {
          setIsAuthenticated(true);
          setAgent(agentInfo);
          setIsLoading(false);
        }
        return;
      }

      // Access token expired — attempt silent refresh via the shared
      // refreshAccessToken function (which has a single-flight lock so
      // that agentFetch and useAgentAuth don't fire duplicate refreshes).
      const refreshToken = getAgentRefreshToken();
      if (!refreshToken || isAgentTokenExpired(refreshToken)) {
        if (!cancelled) {
          setIsAuthenticated(false);
          setAgent(null);
          setIsLoading(false);
        }
        return;
      }

      const newAccessToken = await refreshAccessToken();

      if (!cancelled) {
        if (newAccessToken) {
          setIsAuthenticated(true);
          setAgent(agentInfo);
        } else {
          setIsAuthenticated(false);
          setAgent(null);
        }
        setIsLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getAgentRefreshToken();
    // Best-effort server-side token revocation
    if (refreshToken) {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
        await fetch(`${API_BASE}/agent/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // Ignore — client-side cleanup is the source of truth
      }
    }
    clearAgentAuth();
    router.push("/login?role=agent");
  }, [router]);

  return { isAuthenticated, isLoading, agent, logout };
}
