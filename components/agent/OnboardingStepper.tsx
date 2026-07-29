"use client";

import { Check } from "lucide-react";
import { ProcurementAgentType } from "@/types/agent";

interface OnboardingStepperProps {
  currentStep: number;
  totalSteps: number;
  steps?: string[];
  agentType?: ProcurementAgentType;
  isProcurement?: boolean;
}

export default function OnboardingStepper({
  currentStep,
  totalSteps,
  steps,
  agentType,
  isProcurement,
}: OnboardingStepperProps) {
  // Procurement Agent steps (organization flow has 9 steps, independent has 8)
  const procurementOrgSteps = [
    "Agent Type",
    "Organization",
    "Personal Info",
    "Business Info",
    "Verification",
    "Preferences",
    "Categories",
    "Payment",
    "Review",
  ];

  const procurementIndepSteps = [
    "Agent Type",
    "Personal Info",
    "Business Info",
    "Verification",
    "Preferences",
    "Categories",
    "Payment",
    "Review",
  ];

  // Sales Agent steps (original)
  const salesSteps = [
    "Agent Type",
    "Organization",
    "Personal Info",
    "Verification",
    "Coverage",
    "Skills",
    "Payment",
    "Review",
  ];

  // Determine step labels based on flow type
  const getStepLabels = () => {
    if (steps) return steps;
    if (isProcurement) {
      return agentType === "ORGANIZATION" ? procurementOrgSteps : procurementIndepSteps;
    }
    return salesSteps;
  };

  const stepLabels = getStepLabels();
  const stepCount = stepLabels.length;

  return (
    <div className="w-full">
      {/* Progress bar */}

      {/* Step labels */}
      <div className={`mt-4 grid grid-cols-4 gap-2 sm:gap-3 sm:grid-cols-${stepCount}`}>
        {stepLabels.map((label, index) => {
          const stepNum = index + 1;
          const isComplete = currentStep > stepNum;
          const isActive = currentStep === stepNum;
          const isLast = stepNum === stepCount;

          return (
            <div
              key={label}
              className={`
                flex flex-col items-center text-center
                ${!isLast ? "sm:relative" : ""}
              `}
            >
              {/* Line connector for non-last steps on desktop */}
              {!isLast && (
                <div
                  className={`
                    absolute top-4 left-1/2 h-0.5 w-full hidden sm:block
                    ${isComplete ? "bg-[#2f8f83]" : "bg-slate-200"}
                  `}
                  style={{ marginLeft: "24px" }}
                />
              )}

              {/* Step circle */}
              <div
                className={`
                  flex h-8 w-8 items-center justify-center rounded-full border-2
                  z-10
                  ${isComplete || isActive
                    ? "border-[#2f8f83] bg-[#2f8f83] text-white"
                    : "border-slate-300 bg-white text-slate-500"
                  }
                `}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-bold">{stepNum}</span>
                )}
              </div>

              {/* Step label - only on larger screens */}
              <p
                className={`
                  mt-2 hidden text-[10px] font-medium uppercase tracking-wider sm:block
                  ${isComplete || isActive ? "text-[#2f8f83]" : "text-slate-400"}
                `}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}