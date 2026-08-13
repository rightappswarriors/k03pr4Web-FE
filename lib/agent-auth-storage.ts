/**
 * Agent Authentication Storage Utilities
 * Centralised token + agent-info storage helpers (localStorage + cookie).
 *
 * Retail (customer) auth keys (`access`, `refresh`, `loggedInUser`) are
 * intentionally left untouched so that the two systems stay independent.
 */

export interface AgentInfo {
  id: string;
  email: string;
  fullname: string;
  phone?: string | null;
  verificationStatus: string;
  organizationId?: number | null;
  agentType: string;
}

const ACCESS_TOKEN_KEY = "agent_access_token";
const REFRESH_TOKEN_KEY = "agent_refresh_token";
const AGENT_INFO_KEY = "agent";

// ─── Access token ─────────────────────────────────────────────────────────

export function getAgentAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAgentAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  // Keep the cookie in sync for middleware route-protection checks.
  // The cookie mirrors the refresh-token lifetime so the middleware
  // continues to recognise the session even after the access token
  // expires (the client-side hook will transparently refresh it).
  document.cookie = `${ACCESS_TOKEN_KEY}=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=lax`;
}

// ─── Refresh token ────────────────────────────────────────────────────────

export function getAgentRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAgentRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

// ─── Both tokens ─────────────────────────────────────────────────────────

/**
 * Persist both the access and refresh tokens.
 * The access-token cookie is updated with a 7-day max-age so the
 * middleware keeps treating the session as valid while the
 * client-side hook refreshes the short-lived access token.
 */
export function setAgentTokens(accessToken: string, refreshToken: string): void {
  setAgentAccessToken(accessToken);
  setAgentRefreshToken(refreshToken);
}

// ─── Agent profile info ──────────────────────────────────────────────────

export function getAgentInfo(): AgentInfo | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(AGENT_INFO_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AgentInfo;
  } catch {
    return null;
  }
}

export function setAgentInfo(info: AgentInfo): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AGENT_INFO_KEY, JSON.stringify(info));
}

// ─── Token validation ────────────────────────────────────────────────────

/** Returns `true` when the JWT's `exp` claim is in the past. */
export function isAgentTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    ) as { exp?: number };
    if (!payload.exp) return false; // No exp — treat as valid
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true; // Unparseable — treat as expired
  }
}

// ─── Clear ───────────────────────────────────────────────────────────────

/**
 * Removes every agent auth artefact (localStorage + cookie) and fires the
 * `auth-changed` event so that `useAuth` and other listeners re-sync.
 */
export function clearAgentAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AGENT_INFO_KEY);
  document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0; SameSite=lax`;
  window.dispatchEvent(new Event("auth-changed"));
}

// ─── Convenience ─────────────────────────────────────────────────────────

export function hasAgentAuth(): boolean {
  return !!getAgentAccessToken() && !!getAgentInfo();
}
