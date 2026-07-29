"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import VerificationTimeline from "./VerificationTimeline";

interface SuccessCardProps {
  agentId?: string;
  isProcurement?: boolean;
}

export default function SuccessCard({ agentId, isProcurement }: SuccessCardProps) {
  // Procurement agent timeline includes profile created stage
  const procurementStages = {
    accountCreated: true,
    profileCreated: true,
    documentsUploaded: true,
    identityVerified: false,
    organizationApproved: false,
    agentActivated: false,
  };

  const salesStages = {
    accountCreated: true,
    documentsUploaded: true,
    identityVerified: false,
    organizationApproved: false,
    agentActivated: false,
  };

  const stages = isProcurement ? procurementStages : salesStages;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-[1.75rem] border border-[#ded8cc] bg-white p-8 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
    >
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#2f8f83]">
        <svg
          className="h-10 w-10 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="mt-6 text-3xl font-black tracking-tight text-[#10231f]">
        Registration Submitted
      </h1>

      <p className="mt-3 text-sm text-slate-600">
        Your application is now in review. We'll notify you once everything is
        verified.
      </p>

      <div className="mt-8">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Application Status
        </p>
        <p className="mt-1.5 text-lg font-bold text-[#2f8f83]">
          Pending Verification
        </p>
      </div>

      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Timeline
        </p>
        <div className="mt-4 flex justify-center">
          <VerificationTimeline
            stages={stages}
            isProcurement={isProcurement}
          />
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-500">
        Estimated review time: 24–48 hours
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#2f8f83] text-sm font-bold text-white transition hover:bg-[#26776d] sm:w-auto sm:px-8"
      >
        Return to Marketplace
      </Link>
    </motion.div>
  );
}