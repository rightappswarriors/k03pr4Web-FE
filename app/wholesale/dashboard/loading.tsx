export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <div className="border-b border-slate-200 bg-[#1f5f56]">
        <div className="container-shell py-6">
          <div className="h-8 w-64 animate-pulse rounded bg-slate-300" />
          <div className="mt-2 h-4 w-96 animate-pulse rounded bg-slate-300" />
        </div>
      </div>
      <div className="container-shell py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="h-48 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-48 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    </main>
  );
}
