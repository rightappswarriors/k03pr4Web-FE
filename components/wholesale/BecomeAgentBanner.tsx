"use client";

import Link from "next/link";
import { UsersRound } from "lucide-react";

export default function BecomeAgentBanner() {
  return (
    <section className="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 p-5 sm:flex sm:items-center sm:justify-between">
      <div className="flex gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-600">
          <UsersRound aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-black text-slate-950">Become a verified agent</h2>
          <p className="mt-1 text-sm text-slate-600">
            Unlock more mandates, better quotes and exclusive benefits.
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-3 sm:mt-0">
        <Link
          href="/register/supplier"
          className="inline-flex items-center rounded-lg border border-orange-400 px-4 py-2 text-sm font-bold text-orange-600 hover:bg-orange-500 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-orange-700"
        >
          Learn more
        </Link>
        <button className="btn-primary px-4 py-2 text-sm">Become Agent</button>
      </div>
    </section>
  );
}