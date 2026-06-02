"use client";

type Props = {
  value: "delivery" | "pickup";
  onChange: (value: "delivery" | "pickup") => void;
};

export default function DeliveryPickupSelector({ value, onChange }: Props) {
  return (
    <div className="card p-5">
      <h3 className="text-lg font-bold text-brand-blue">Is this for Delivery or Pickup?</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <button
          onClick={() => onChange("delivery")}
          className={`rounded-2xl border p-4 text-left transition ${
            value === "delivery" ? "border-orange-500 bg-orange-50" : "border-slate-200"
          }`}
        >
          <p className="font-semibold text-brand-blue">Delivery</p>
          <p className="mt-1 text-sm text-slate-500">Deliver to customer address with map support.</p>
        </button>
        <button
          onClick={() => onChange("pickup")}
          className={`rounded-2xl border p-4 text-left transition ${
            value === "pickup" ? "border-orange-500 bg-orange-50" : "border-slate-200"
          }`}
        >
          <p className="font-semibold text-brand-blue">Pickup</p>
          <p className="mt-1 text-sm text-slate-500">Choose a branch and pickup schedule.</p>
        </button>
      </div>
    </div>
  );
}