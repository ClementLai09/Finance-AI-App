export function SectionPlaceholder({
  title,
  description,
  message,
}: {
  title: string;
  description: string;
  message: string;
}) {
  return (
    <section aria-labelledby="section-title">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-emerald-700">Finance AI App</p>
        <h1 id="section-title" className="text-3xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          {description}
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center sm:px-10">
        <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <span aria-hidden="true" className="text-xl">+</span>
        </div>
        <h2 className="text-base font-semibold text-slate-900">Your {title.toLowerCase()} space</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p>
      </div>
    </section>
  );
}
