import StoreCard from "@/components/ui/StoreCard";

export default function LocationSection({ stores }: any) {
  const branches = stores.filter((s: any) => s.type === "branch");
  const outlets = stores.filter((s: any) => s.type === "outlet");

  return (
    <div className="flex flex-col min-h-[60vh] space-y-12">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold">Our Locations</h2>
        <p className="text-sm text-gray-500 mt-1">
          {branches.length} branches · {outlets.length} outlets
        </p>
      </div>

      {/* CONTENT */}
      {(branches.length > 0 || outlets.length > 0) ? (
        <>
          {/* BRANCHES */}
          {branches.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                🏢 Branches
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {branches.length}
                </span>
              </h3>

              <p className="text-xs text-gray-500 mb-4">
                Full-service locations of this organization.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map((store: any, index: number) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    index={index}
                    variant="location"
                  />
                ))}
              </div>
            </div>
          )}

          {/* OUTLETS */}
          {outlets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                🏬 Outlets
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {outlets.length}
                </span>
              </h3>

              <p className="text-xs text-gray-500 mb-4">
                Smaller pickup points and partner stores.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {outlets.map((store: any, index: number) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    index={index}
                    variant="location" // ✅ ADD THIS
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* EMPTY STATE (CENTERED) */
        <div className="flex flex-1 items-center justify-center text-gray-500">
          No locations available
        </div>
      )}
    </div>
  );
}