import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Wholesale route protection ──────────────────────────
  if (pathname.startsWith("/wholesale")) {
    const agentToken = request.cookies.get("agent_access_token")?.value;
    const userToken = request.cookies.get("access_token")?.value;

    // Retail user logged in but trying to access wholesale → redirect home
    if (userToken && !agentToken) {
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("toast", "Wholesale Marketplace is available only for approved Procurement Agents.");
      return NextResponse.redirect(homeUrl);
    }

    // No agent token → redirect to login with agent mode preselected
    if (!agentToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("mode", "agent");
      return NextResponse.redirect(loginUrl);
    }

    // Decode and validate agent token
    try {
      const payload = JSON.parse(
        Buffer.from(agentToken.split(".")[1], "base64").toString()
      );
      const verificationStatus = payload.verification_status;

      if (verificationStatus === "APPROVED") {
        return NextResponse.next();
      }

      if (verificationStatus === "REJECTED") {
        return NextResponse.redirect(new URL("/agent/rejected", request.url));
      }

      // PENDING_VERIFICATION or PENDING_ORGANIZATION_APPROVAL
      return NextResponse.redirect(new URL("/agent/pending", request.url));
    } catch {
      // Token is malformed - redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("mode", "agent");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/wholesale/:path*"],
};
