"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAgentAuth } from "@/hooks/useAgentAuth";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

/**
 * Wraps protected wholesale pages and blocks rendering until the
 * agent's authentication has been initialised (token checked / refreshed).
 *
 * While `isLoading` is `true` a skeleton is shown so that no API request
 * is fired with a stale or missing token.
 *
 * If the user is not authenticated once initialisation finishes,
 * they are redirected to `/login?role=agent`.
 */
export default function AgentAuthProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAgentAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?role=agent");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    // Show a full-page skeleton while auth is being resolved.
    return (
      <main className="min-h-screen bg-[#f7f7f5]">
        <DashboardSkeleton />
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
