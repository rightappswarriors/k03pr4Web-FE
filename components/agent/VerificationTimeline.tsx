"use client";

import { CheckCircle2 } from "lucide-react";

interface TimelineStage {
  label: string;
  completed: boolean;
  inProgress?: boolean;
}

interface VerificationTimelineProps {
  stages: {
    accountCreated: boolean;
    profileCreated?: boolean;
    documentsUploaded: boolean;
    identityVerified: boolean;
    organizationApproved: boolean;
    agentActivated: boolean;
  };
  isProcurement?: boolean;
}

export default function VerificationTimeline({ stages, isProcurement }: VerificationTimelineProps) {
  // Procurement agent timeline includes profile created
  const timelineStages: TimelineStage[] = isProcurement
    ? [
        { label: "Account Created", completed: stages.accountCreated },
        { label: "Procurement Profile Created", completed: stages.profileCreated || false },
        { label: "Documents Uploaded", completed: stages.documentsUploaded },
        { label: "Identity Verification", completed: stages.identityVerified },
        { label: "Organization Approval", completed: stages.organizationApproved },
        { label: "Procurement Agent Activated", completed: stages.agentActivated },
      ]
    : [
        { label: "Account Created", completed: stages.accountCreated },
        { label: "Documents Uploaded", completed: stages.documentsUploaded },
        { label: "Identity Verification", completed: stages.identityVerified },
        { label: "Organization Approval", completed: stages.organizationApproved },
        { label: "Agent Activation", completed: stages.agentActivated },
      ];

  return (
    <div className="space-y-4">
      {timelineStages.map((stage, index) => {
        const isLast = index === timelineStages.length - 1;

        return (
          <div key={stage.label} className="flex items-start gap-3">
            {/* Icon */}
            <div className="relative flex h-10 w-10 items-center justify-center">
              {stage.completed ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2f8f83]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
              ) : stage.inProgress ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#2f8f83] bg-white">
                  <div className="h-2 w-2 rounded-full bg-[#2f8f83] animate-pulse" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-300 bg-white">
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                </div>
              )}

              {/* Connector line */}
              {!isLast && (
                <div
                  className={`
                    absolute top-10 left-1/2 -translate-x-1/2
                    h-6 w-0.5 bg-slate-200
                  `}
                />
              )}
            </div>

            {/* Label */}
            <div className="pt-2.5">
              <p
                className={`
                  text-sm font-medium
                  ${stage.completed ? "text-[#2f8f83]" : "text-slate-500"}
                `}
              >
                {stage.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}