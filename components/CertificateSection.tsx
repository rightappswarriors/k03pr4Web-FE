"use client";

import { Award } from "lucide-react";

export default function CertificateSection() {
  const certificates = [
    { name: "ISO 9001:2015", desc: "Quality Management" },
    { name: "ISO 14001", desc: "Environmental Standard" },
    { name: "BSCI Certified", desc: "Social Compliance" },
    { name: "CE Certification", desc: "European Conformity" },
  ];

  return (
    <section className="bg-[#f8f8f6] py-14">
      <div className="container-shell">

        {/* TITLE */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-wide text-gray-900">
            CERTIFICATE QUALIFICATION
          </h2>

          {/* same warm underline */}
          <div className="h-0.75 w-14 bg-[#2f8f83]/80 mx-auto mt-3 rounded-full" />
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {certificates.map((c) => (
            <div
              key={c.name}
              className="bg-white border border-[#ecebe7] rounded-xl p-6 text-center shadow-sm hover:shadow-md transition"
            >
              {/* ICON */}
              <div className="h-14 w-14 rounded-full bg-[#2f8f83]/10 text-[#2f8f83] mx-auto flex items-center justify-center mb-4">
                <Award className="h-6 w-6" />
              </div>

              {/* TEXT */}
              <p className="font-semibold text-sm text-gray-900">
                {c.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {c.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}