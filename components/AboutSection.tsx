"use client";

import {
  Globe,
  ExternalLink,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";

export default function AboutSection({
  organization,
  totalProducts,
}: any) {
  const websiteUrl = organization.website?.startsWith("http")
    ? organization.website
    : `https://${organization.website}`;

  // ✅ NEW: dynamic socials from backend
  const socials = [
    {
      name: "Facebook",
      icon: Facebook,
      url: organization.facebooklink,
      handle: organization.facebooklink,
      color: "text-[#1877F2]",
      bg: "bg-[#1877F2]/10",
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: organization.instagramlink,
      handle: organization.instagramlink,
      color: "text-[#E1306C]",
      bg: "bg-[#E1306C]/10",
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: organization.twitterlink,
      handle: organization.twitterlink,
      color: "text-gray-800",
      bg: "bg-gray-100",
    },
  ].filter((s) => s.url); 

  return (
    <section className="bg-[#f8f8f6] py-10">
      <div className="container-shell grid md:grid-cols-3 gap-10 items-start">

        {/* LEFT CONTENT */}
        <div className="md:col-span-2 space-y-6">

          {/* TITLE */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              About {organization.name}
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              {organization.bio ||
                "We are committed to delivering high-quality products and excellent customer service."}
            </p>
          </div>

          {/* STATS */}
          <div className="grid sm:grid-cols-2 gap-4">

            <div className="bg-white border border-[#ebeae6] rounded-xl p-4 hover:shadow-sm transition">
              <p className="text-xs text-gray-500">Established</p>
              <p className="font-semibold text-lg mt-1">
                {organization.established || "2008"}
              </p>
            </div>

            <div className="bg-white border border-[#ebeae6] rounded-xl p-4 hover:shadow-sm transition">
              <p className="text-xs text-gray-500">Total Products</p>
              <p className="font-semibold text-lg mt-1">
                {totalProducts}
              </p>
            </div>

            <div className="bg-white border border-[#ebeae6] rounded-xl p-4 hover:shadow-sm transition">
              <p className="text-xs text-gray-500">Locations</p>
              <p className="font-semibold text-lg mt-1">
                {(organization.total_branches || 0) +
                  (organization.total_outlets || 0)}
              </p>
            </div>

            <div className="bg-white border border-[#ebeae6] rounded-xl p-4 hover:shadow-sm transition">
              <p className="text-xs text-gray-500">Branches & Outlets</p>
              <p className="font-semibold text-sm mt-1">
                {organization.total_branches || 0} branches ·{" "}
                {organization.total_outlets || 0} outlets
              </p>
            </div>

          </div>

          {/* CONNECT SECTION */}
          <div className="rounded-xl border border-[#ebeae6] bg-white overflow-hidden">

            <div className="px-5 py-4 border-b border-[#ebeae6] bg-[#f4f4f2]">
              <h3 className="text-lg font-bold">Connect with us</h3>
              <p className="text-xs text-gray-500 mt-1">
                Visit our official website and social pages
              </p>
            </div>

            <div className="p-5 space-y-5">

              {/* WEBSITE */}
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-lg border border-[#ebeae6] p-4 hover:border-gray-400 hover:bg-gray-50 transition"
              >
                <div className="h-11 w-11 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-gray-900 group-hover:text-white transition">
                  <Globe className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Official website</p>
                  <p className="font-semibold text-sm truncate">
                    {organization.website || "www.example.com"}
                  </p>
                </div>

                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-900" />
              </a>

              {/* SOCIAL MEDIA */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Follow us
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                  {socials.map((s) => (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center text-center gap-2 rounded-lg border border-[#ebeae6] p-3 hover:border-gray-400 hover:shadow-sm transition"
                    >
                      <div className={`h-10 w-10 rounded-full ${s.bg} ${s.color} flex items-center justify-center group-hover:scale-110 transition`}>
                        <s.icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 w-full">
                        <p className="font-semibold text-xs">{s.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {s.handle}
                        </p>
                      </div>
                    </a>
                  ))}

                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT IMAGE */}
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden border border-[#ebeae6] shadow-sm">
            <img
              src={
                organization.bannerimg ||
                "https://images.unsplash.com/photo-1542838132-92c53300491e"
              }
              alt={organization.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      </div>
    </section>
  );
}