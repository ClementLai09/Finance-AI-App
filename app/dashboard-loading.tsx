export function DashboardLoading() {
  return (
    <section aria-label="Loading dashboard" aria-busy="true">
      <div className="mb-6 h-16 rounded-lg bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-28 rounded-xl bg-white ring-1 ring-slate-200" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {[1, 2].map((item) => (
          <div key={item} className="h-64 rounded-xl bg-white ring-1 ring-slate-200" />
        ))}
      </div>
    </section>
  );
}
