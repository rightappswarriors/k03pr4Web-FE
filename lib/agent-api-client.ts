/**
 * Shared API client for agent-authenticated requests.
 *
 * Features:
 *  - Automatic access-token refresh on HTTP 401
 *  - Single-flight refresh: concurrent 401s share one refresh request
 *  - Transparent retry of the original request after refresh
 *  - On refresh failure: clears agent auth and redirects to /login?role=agent
 *  - Surfaces the backend's real error message instead of a generic string
 */

import {
  getAgentAccessToken,
  getAgentRefreshToken,
  setAgentTokens,
  setAgentAccessToken,
  clearAgentAuth,
  isAgentTokenExpired,
} from "./agent-auth-storage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Single-flight lock.
 *
 * When the first request receives a 401 it kicks off a refresh.
 * Every subsequent 401 arriving while the refresh is in-flight
 * awaits the same promise instead of firing its own refresh call.
 */
let refreshPromise: Promise<string | null> | null = null;

/** Redirect the browser to the agent login page. */
function redirectToAgentLogin(): void {
  if (typeof window !== "undefined") {
    window.location.href = "/login?role=agent";
  }
}

/**
 * Calls POST /agent/refresh with the stored refresh token.
 * Returns the new access token string, or `null` on failure
 * (in which case auth state is cleared and the user is redirected).
 *
 * Exported so that `useAgentAuth` and other hooks share the same
 * single-flight lock — preventing duplicate refresh requests.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getAgentRefreshToken();
  if (!refreshToken) {
    clearAgentAuth();
    redirectToAgentLogin();
    return null;
  }

  // Bail early if the refresh token itself is expired.
  if (isAgentTokenExpired(refreshToken)) {
    clearAgentAuth();
    redirectToAgentLogin();
    return null;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/agent/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) throw new Error("Refresh endpoint returned error");

      const data = await res.json();
      if (data.success && data.accessToken) {
        // Persist the new tokens.
        if (data.refreshToken) {
          setAgentTokens(data.accessToken, data.refreshToken);
        } else {
          setAgentAccessToken(data.accessToken);
        }
        return data.accessToken;
      }

      throw new Error("Missing accessToken in refresh response");
    } catch {
      clearAgentAuth();
      redirectToAgentLogin();
      return null;
    } finally {
      // Always release the lock — even on failure.
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Extracts a human-readable error message from a backend JSON error response.
 */
function extractErrorMessage(errorBody: Record<string, unknown>, status: number): string {
  // NestJS exception filter returns: { message: string|string[], error: string, statusCode: number }
  const msg = errorBody.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string" && msg) return msg;
  if (typeof errorBody.error === "string" && errorBody.error) return errorBody.error;
  if (typeof errorBody.error === "string" && errorBody.error) return errorBody.error;
  // Zod / custom: { error: string } or { message: string }
  if (typeof errorBody.error === "string") return errorBody.error;
  return `Request failed with status ${status}`;
}

/**
 * Fetches a resource from `fullPath` (e.g. `"/agent/dashboard"`)
 * using the agent access token.
 *
 * On 401: attempts a single refresh, then retries the request once.
 * On any other non-OK status: throws with the backend's error message.
 */
export async function agentFetch<T = unknown>(
  fullPath: string,
  options?: RequestInit
): Promise<T> {
  const headers = new Headers(options?.headers as HeadersInit | undefined);
  const token = getAgentAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_BASE}${fullPath}`, { ...options, headers });

  if (res.status === 401) {
    // Token expired or invalid — refresh and retry once.
    const newToken = await refreshAccessToken();
    if (!newToken) {
      throw new Error("Session expired. Please log in again.");
    }

    headers.set("Authorization", `Bearer ${newToken}`);
    const retryRes = await fetch(`${API_BASE}${fullPath}`, { ...options, headers });

    if (!retryRes.ok) {
      const errorBody = await retryRes.json().catch(() => ({}));
      throw new Error(extractErrorMessage(errorBody, retryRes.status));
    }

    const json = await retryRes.json();
    return (json.data !== undefined ? json.data : json) as T;
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorBody, res.status));
  }

  const json = await res.json();
  return (json.data !== undefined ? json.data : json) as T;
}
