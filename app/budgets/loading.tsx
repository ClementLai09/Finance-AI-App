export default function BudgetsLoading() {
  return (
    <section aria-label="Loading budgets" aria-busy="true">
      <div className="mb-8 h-16 rounded-lg bg-slate-200" />
      <div className="mb-6 h-36 rounded-xl border border-slate-200 bg-white" />
      <div className="space-y-4">
        {[1, 2].map((item) => (
          <div key={item} className="h-44 rounded-xl border border-slate-200 bg-white" />
        ))}
      </div>
    </section>
  );
}
