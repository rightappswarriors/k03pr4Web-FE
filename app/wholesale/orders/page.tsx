"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Package, RefreshCw } from "lucide-react";
import Header from "@/components/layout/Header";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import AgentAuthProvider from "@/components/auth/AgentAuthProvider";
import { useSocket } from "@/providers/SocketProvider";
import { purchaseOrderApi } from "@/services/purchase-order.service";
import { formatPrice } from "@/lib/utils";
import type { PurchaseOrder } from "@/types/wholesale";

const statusLabel: Record<string, string> = { PENDING: "Pending Review", ACCEPTED: "Accepted", REJECTED: "Rejected", IN_TRANSIT: "In Transit", DELIVERED: "Completed", CANCELLED: "Cancelled" };
export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const { subscribe } = useSocket();
  const load = useCallback(async () => { setLoading(true); setError(null); try { setOrders(await purchaseOrderApi.list()); } catch (e) { setError(e instanceof Error ? e.message : "Unable to load purchase orders."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]); useEffect(() => subscribe(({ event }) => { if (event.startsWith("purchaseOrder:")) void load(); }), [subscribe, load]);
  return <AgentAuthProvider><main className="min-h-screen bg-[#f7f7f5]"><Header wholesale /><div className="flex"><DashboardSidebar /><div className="flex-1 overflow-x-auto"><div className="container-shell py-8">
    <div className="mb-6 flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1><p className="mt-1 text-slate-600">Review and prepare payment for your supplier orders.</p></div><button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"><RefreshCw className="size-4" />Refresh</button></div>
    {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200" />)}</div> : orders.length === 0 ? <div className="rounded-xl border border-slate-100 bg-white p-12 text-center"><Package className="mx-auto size-10 text-slate-400" /><h2 className="mt-3 font-semibold text-slate-900">No purchase orders yet</h2><p className="mt-1 text-sm text-slate-500">New orders assigned to you will appear here.</p></div> : <>
      <div className="hidden overflow-hidden rounded-xl border border-slate-100 bg-white md:block"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-4">Purchase order</th><th className="p-4">Supplier</th><th className="p-4">Items</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4" /></tr></thead><tbody>{orders.map(po => <tr key={po.id} className="border-t border-slate-100"><td className="p-4"><div className="font-semibold">{po.poNumber}</div><div className="text-xs text-slate-500">{new Date(po.createdAt).toLocaleDateString("en-PH")}</div></td><td className="p-4">{po.supplier?.name ?? "Supplier"}</td><td className="p-4">{po.lineItems.length} items</td><td className="p-4 font-semibold">{formatPrice(po.totalAmount)}</td><td className="p-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">{statusLabel[po.status] ?? po.status} · {po.paymentStatus}</span></td><td className="p-4"><Link className="inline-flex rounded-lg p-2 text-[#2f8f83] hover:bg-[#e6f4f1]" href={`/wholesale/orders/${po.id}`}><Eye className="size-4" /></Link></td></tr>)}</tbody></table></div>
      <div className="space-y-3 md:hidden">{orders.map(po => <Link key={po.id} href={`/wholesale/orders/${po.id}`} className="block rounded-xl border border-slate-100 bg-white p-4"><div className="flex justify-between gap-3"><div><p className="font-semibold">{po.poNumber}</p><p className="text-sm text-slate-600">{po.supplier?.name ?? "Supplier"} · {po.lineItems.length} items</p></div><p className="font-semibold">{formatPrice(po.totalAmount)}</p></div><p className="mt-3 text-xs text-slate-500">{statusLabel[po.status] ?? po.status} · Payment {po.paymentStatus}</p></Link>)}</div>
    </>}
  </div></div></div></main></AgentAuthProvider>;
}
