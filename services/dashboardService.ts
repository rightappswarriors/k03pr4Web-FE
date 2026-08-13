// services/dashboardService.ts
import { agentFetch } from "@/lib/agent-api-client";
import type { DashboardResponse } from "@/types/dashboard";

export async function getAgentDashboard(): Promise<DashboardResponse> {
  if (process.env.NODE_ENV === "development") {
    console.log("[Agent Dashboard] Fetching dashboard");
  }

  try {
    // agentFetch already unwraps json.data, so the returned value is
    // the DashboardResponse directly.
    const data = await agentFetch<DashboardResponse>("/agent/dashboard");

    if (process.env.NODE_ENV === "development") {
      console.log("[Agent Dashboard] Response counts", {
        activities: data.recentActivity?.length ?? 0,
        orders: data.recentOrders?.length ?? 0,
        rfqs: data.recentRFQs?.length ?? 0,
      });
    }

    return data;
  } catch (error) {
    console.error("Error getting Dashboard data:", error);
    throw error;
  }
}
