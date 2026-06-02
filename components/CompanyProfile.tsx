"use client";

import { CheckCircle2, Globe, Users, Factory } from "lucide-react";

export default function CompanyProfile({
  organization,
  branchesCount,
  outletsCount,
}: {
  organization: any;
  branchesCount: number;
  outletsCount: number;
}) {
  return (
    <section className="bg-[#f8f8f6] border-y border-[#ebeae6] py-14">
      <div className="container-shell">

        {/* TITLE */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-wide text-gray-900">
            COMPANY PROFILE
          </h2>

          {/* ✅ softer line */}
          <div className="h-0.75 w-14 bg-[#2f8f83]/80 mx-auto mt-3 rounded-full" />
        </div>

        {/* CONTENT */}
        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* LEFT */}
          <div className="space-y-5 text-sm leading-relaxed text-gray-600">
            <p>
              {organization.description ||
                "We are committed to delivering high-quality products and excellent customer service."}
            </p>

            <ul className="space-y-3 text-gray-800">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#2f8f83] mt-0.5" />
                <span>
                  Established and trusted organization serving customers nationwide.
                </span>
              </li>

              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#2f8f83] mt-0.5" />
                <span>
                  {branchesCount} branches and {outletsCount} outlets available.
                </span>
              </li>

              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#2f8f83] mt-0.5" />
                <span>
                  Customer-first approach with strict quality standards.
                </span>
              </li>
            </ul>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                {
                  icon: Factory,
                  label: "Locations",
                  val: branchesCount + outletsCount,
                },
                { icon: Users, label: "Customers", val: "1000+" },
                { icon: Globe, label: "Reach", val: "Nationwide" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white border border-[#ecebe7] rounded-lg p-4 text-center shadow-sm"
                >
                  <item.icon className="h-5 w-5 mx-auto text-[#2f8f83] mb-1" />
                  <p className="font-semibold text-sm text-gray-900">
                    {item.val}
                  </p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="rounded-xl overflow-hidden border border-[#ecebe7] shadow-sm">
            <img
              src={
                organization.coverImage ||
                "https://images.unsplash.com/photo-1542838132-92c53300491e"
              }
              className="w-full aspect-video object-cover"
            />
          </div>
        </div>

        {/* QUOTE */}
        <div className="mt-12 bg-[#f1f4f3] border-l-[3px] border-[#2f8f83]/70 p-6 rounded-lg max-w-3xl mx-auto">
          <p className="italic text-lg text-gray-800">
            "Quality first, Customer first."
          </p>
          <p className="text-xs text-gray-500 mt-2">
            — Our business philosophy
          </p>
        </div>

      </div>
    </section>
  );
}