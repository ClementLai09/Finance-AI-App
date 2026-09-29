export default function TransactionsLoading() {
  return (
    <section aria-labelledby="transactions-loading-title" aria-busy="true">
      <div className="mb-8 animate-pulse">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="mt-3 h-9 w-52 rounded bg-slate-200" />
        <div className="mt-3 h-5 max-w-lg rounded bg-slate-200" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
      <span id="transactions-loading-title" className="sr-only">
        Loading transactions
      </span>
    </section>
  );
}
