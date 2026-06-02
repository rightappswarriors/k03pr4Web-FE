"use client";

export default function StoreHero({ organization }: any) {
  const fallbackImage =
    "https://images.unsplash.com/photo-1542838132-92c53300491e";

  return (
    <div className="relative h-56 sm:h-64 md:h-80 lg:h-96 w-full overflow-hidden">

      {/* IMAGE */}
      <img
        src={organization.coverImage || fallbackImage}
        className="w-full h-full object-cover"
        alt="Store Cover"
      />

      {/* SOFT GRADIENT */}
      <div className="absolute inset-0 bg-linear-to-r from-white/90 via-white/70 to-transparent" />

      {/* CONTENT */}
      <div className="absolute inset-0 flex items-center">
        <div className="container-shell px-4 sm:px-6">

          {/* BADGE */}
          <span className="inline-flex items-center gap-1.5 bg-[#d98b2b] text-white text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full font-medium shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 sm:h-3.5 sm:w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3l7 4v5c0 5-3.5 9-7 9s-7-4-7-9V7l7-4z"
              />
            </svg>

            Trusted Supplier
          </span>

          {/* TITLE */}
          <h1 className="mt-3 text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
            {organization.name}
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-2 sm:mt-3 max-w-full sm:max-w-lg md:max-w-xl text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
            {organization.description ||
              "We provide high-quality products with trusted service across multiple locations."}
          </p>

        </div>
      </div>
    </div>
  );
}