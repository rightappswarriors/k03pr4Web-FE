"use client";

export default function ProductCategories({
  categories,
  products,
  selectedCategory,
  setSelectedCategory,
  setActiveTab,
}: any) {

  // ✅ NEW: filter only relevant categories
  const filteredCategories = categories.filter((cat: any) =>
    products.some((p: any) => p.category_name === cat.name)
  );

  return (
    <section className="py-12">

      {/* TITLE */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-wide text-gray-900">
          PRODUCT CATEGORY
        </h2>
        <div className="h-0.5 w-14 bg-[#2f8f83]/80 mx-auto mt-3 rounded-full" />
      </div>

      {/* CONTENT */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">

          {filteredCategories.map((cat: any) => {
            const sample = products.find(
              (p: any) => p.category_name === cat.name
            );

            const count = products.filter(
              (p: any) => p.category_name === cat.name
            ).length;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setActiveTab("products");
                }}
                className={`group rounded-lg border overflow-hidden text-left transition-all duration-300 ${
                  selectedCategory === cat.name
                    ? "border-[#2f8f83] shadow-md"
                    : "border-[#ebeae6] bg-white hover:shadow-md hover:-translate-y-1"
                }`}
              >
                {/* IMAGE */}
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={
                      sample?.image ||
                      "https://images.unsplash.com/photo-1542838132-92c53300491e"
                    }
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* TEXT */}
                <div className="p-3 text-center">
                  <p className="font-semibold text-sm text-gray-800 group-hover:text-[#2f8f83] transition">
                    {cat.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {count} item{count > 1 ? "s" : ""}
                  </p>
                </div>
              </button>
            );
          })}

        </div>
      ) : (
        <p className="text-center text-gray-500">
          No categories yet.
        </p>
      )}
    </section>
  );
}