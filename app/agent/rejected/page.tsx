"use client";

import Link from "next/link";

export default function AgentRejectedPage() {
  return (
    <div className="min-h-screen bg-[#f6f4ee] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[1.75rem] border border-[#ded8cc] bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)] text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <svg
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-[#10231f] mb-2">
          Application Not Approved
        </h1>
        <p className="text-sm text-[#66706b] mb-6">
          Your procurement agent application has been reviewed and was not
          approved. Please contact the organization for more details.
        </p>
        <Link
          href="/login?mode=agent"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2f8f83] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#26776d]"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
