import {
  Package,
  Clock3,
  UserRoundCheck,
  Bike,
  House,
} from "lucide-react";
import { deliverySteps } from "@/lib/utils";

const stepIcons = [Package, Clock3, UserRoundCheck, Bike, House];
const stepSubtitles = ["In progress...", "", "", "", ""];

export default function OrderProgressTracker({
  currentStep,
}: {
  currentStep: number;
}) {
  return (
    <div className="card rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h3 className="text-2xl font-bold text-brand-blue">
        Delivery Progress
      </h3>

      {/* ✅ HORIZONTAL TRACKER */}
      <div className="mt-8 flex items-start justify-between">
        {deliverySteps.map((step, index) => {
          const Icon = stepIcons[index];
          const active = index === currentStep;
          const done = index < currentStep;
          const isLast = index === deliverySteps.length - 1;

          return (
            <div key={step} className="relative flex flex-1 flex-col items-center text-center">
              
              {/* LINE CONNECTOR */}
              {!isLast && (
                <div
                  className={`absolute top-6 left-1/2 h-0.5 w-full ${
                    done ? "bg-[#2f8f83]" : "bg-slate-200"
                  }`}
                />
              )}

              {/* ICON */}
              <div
                className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                  active || done
                    ? "border-[#2f8f83] bg-[#e9f6f3] text-[#2f8f83]"
                    : "border-slate-300 bg-slate-100 text-slate-500"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* TEXT */}
              <div className="mt-3">
                <p
                  className={`text-sm font-medium ${
                    active || done
                      ? "text-[#2f8f83]"
                      : "text-slate-400"
                  }`}
                >
                  {step}
                </p>

                {active && stepSubtitles[index] && (
                  <p className="mt-1 text-xs text-slate-500">
                    {stepSubtitles[index]}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}