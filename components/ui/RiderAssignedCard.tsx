import { Order } from "@/types/order";

export default function RiderAssignedCard({ order }: { order: Order }) {
  if (!order.assignedRider) return null;

  return (
    <div className="card p-5">
      <h3 className="text-lg font-bold text-brand-blue">Rider Information</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Rider Name</p>
          <p className="mt-1 font-semibold text-brand-blue">{order.assignedRider.name}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Contact</p>
          <p className="mt-1 font-semibold text-brand-blue">{order.assignedRider.phone}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Vehicle</p>
          <p className="mt-1 font-semibold text-brand-blue">{order.assignedRider.vehicle}</p>
        </div>
      </div>
    </div>
  );
}