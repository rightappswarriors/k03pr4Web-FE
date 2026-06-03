"use client";

import Link from "next/link";
import Image from "next/image";
import { getMediaImageUrl, PRODUCT_FALLBACK_IMAGE } from "@/lib/images";
import { ArrowLeft, Heart, Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";

export default function StoreHeader({
  organization,
  following,
  setFollowing,
}: {
  organization: any;
  following: boolean;
  setFollowing: (val: boolean) => void;
}) {
  return (
    <div className="border-b border-[#ded8cc] bg-[#fbfaf6]">
      <div className="container-shell flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/stores"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#ded8cc] bg-white text-[#66706b] transition hover:border-[#2f8f83] hover:text-[#2f8f83]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-[#ded8cc] bg-white">
            <Image
              src={getMediaImageUrl(organization.profilephoto, PRODUCT_FALLBACK_IMAGE)}
              alt={`${organization.name} logo`}
              className="object-cover"
              fill
              sizes="56px"
              quality={72}
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-black tracking-tight text-[#10231f] md:text-2xl">
                {organization.name}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#edf7f3] px-2.5 py-1 text-xs font-bold text-[#1f5f56]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-[#8a938c]">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {organization.contactnumber || "No contact number"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {organization.email || "No email available"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:flex md:w-auto">
          <button
            onClick={() => setFollowing(!following)}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition ${
              following
                ? "border border-[#ded8cc] bg-white text-[#10231f]"
                : "bg-[#2f8f83] text-white hover:bg-[#26776d]"
            }`}
          >
            <Heart className={`h-4 w-4 ${following ? "fill-current" : ""}`} />
            {following ? "Following" : "Follow"}
          </button>

          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#ded8cc] bg-white px-4 text-sm font-bold text-[#10231f] transition hover:border-[#2f8f83]">
            <MessageCircle className="h-4 w-4" />
            Contact
          </button>
        </div>
      </div>
    </div>
  );
}
