import { NextRequest, NextResponse } from "next/server";

/**
 * Decode a JWT payload (base64url) without relying on Node's `Buffer`,
 * which is unreliable inside the Next.js Edge Runtime.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    // base64url → standard base64
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Returns true when the access token in the cookie is expired.
 * We use this to decide whether to let the page render (the client hook
 * will refresh transparently) or to force a login.
 */
function isTokenExpired(payload: Record<string, unknown> | null): boolean {
  if (!payload) return true;
  const exp = payload.exp as number | undefined;
  if (!exp) return false; // no exp claim — treat as valid
  return Date.now() >= exp * 1000;
}

/**
 * Wholesale routes a guest (or retail user) may browse without an
 * agent session.  Only these exact paths and their sub-paths under
 * /wholesale/products are public — everything else under /wholesale/**
 * requires an approved agent session.
 */
function isPublicWholesalePath(pathname: string): boolean {
  // /wholesale  (landing page only — NOT /wholesale/* sub-paths)
  if (pathname === "/wholesale" || pathname === "/wholesale/") return true;

  // /wholesale/products  and  /wholesale/products/:id
  if (pathname === "/wholesale/products") return true;
  if (pathname.startsWith("/wholesale/products/")) return true;

  return false;
}

/**
 * Paths that require an APPROVED agent session.
 */
const AGENT_ONLY_PAGES = [
  "/wholesale/dashboard",
  "/wholesale/rfqs",
  "/wholesale/inbox",
  "/wholesale/orders",
  "/wholesale/checkout",
  "/wholesale/quotes",
  "/wholesale/settings",
];

function requiresAgentSession(pathname: string): boolean {
  return AGENT_ONLY_PAGES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Wholesale route protection ──────────────────────────
  if (pathname.startsWith("/wholesale")) {
    const agentToken = request.cookies.get("agent_access_token")?.value;
    const userToken = request.cookies.get("access_token")?.value;

    // ── Public wholesale pages: allow anyone ──
    if (isPublicWholesalePath(pathname)) {
      return NextResponse.next();
    }

    // ── Retail user trying to access a protected wholesale page ──
    if (userToken && !agentToken) {
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set(
        "toast",
        "Wholesale Marketplace is available only for approved Procurement Agents.",
      );
      return NextResponse.redirect(homeUrl);
    }

    // ── No agent token on a protected page ──
    if (!agentToken && requiresAgentSession(pathname)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("role", "agent");
      return NextResponse.redirect(loginUrl);
    }

    // ── No agent token but the path is not explicitly protected ──
    // (e.g. /wholesale/some-future-page) — still redirect to login.
    if (!agentToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("role", "agent");
      return NextResponse.redirect(loginUrl);
    }

    // ── Token present — decode and check verification status ──
    const payload = decodeJwtPayload(agentToken);
    const verificationStatus = payload?.verification_status as string | undefined;
    const isExpired = isTokenExpired(payload);

    if (!payload) {
      // Token is malformed
      if (requiresAgentSession(pathname)) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("role", "agent");
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    if (verificationStatus === "APPROVED") {
      // Token may be expired, but the client-side hook will
      // transparently refresh it.  Let the page render.
      return NextResponse.next();
    }

    if (verificationStatus === "REJECTED") {
      return NextResponse.redirect(new URL("/agent/rejected", request.url));
    }

    // PENDING_VERIFICATION or PENDING_ORGANIZATION_APPROVAL
    return NextResponse.redirect(new URL("/agent/pending", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/wholesale/:path*"],
};
