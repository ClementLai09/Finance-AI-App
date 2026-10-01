"use client";

import { useState, useTransition } from "react";
import { analyzeMonth, type AnalysisReport } from "./actions";

const sections: { key: keyof Omit<AnalysisReport, "summary">; title: string }[] = [
  { key: "spending_observations", title: "Spending observations" },
  { key: "category_observations", title: "Category observations" },
  { key: "budget_observations", title: "Budget observations" },
  { key: "savings_observations", title: "Savings goals" },
  { key: "previous_month_comparison", title: "Compared with last month" },
  { key: "areas_to_watch", title: "Areas to watch" },
  { key: "suggestions", title: "Suggestions" },
];

export function AnalysisManager({ initialMonth }: { initialMonth: string }) {
  const [month, setMonth] = useState(initialMonth);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState("");
  const [empty, setEmpty] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit() {
    setError("");
    setEmpty(false);
    setReport(null);
    startTransition(async () => {
      const result = await analyzeMonth(month);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.empty) {
        setEmpty(true);
        return;
      }
      setReport(result.report);
    });
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Monthly Financial Analysis</h1>
        <p className="text-sm text-slate-600">Review a concise analysis of your recorded finances for one month.</p>
      </header>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
            Month
            <input
              type="month"
              value={month}
              max={initialMonth}
              onChange={(event) => {
                setMonth(event.target.value);
                setReport(null);
                setEmpty(false);
                setError("");
              }}
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            />
          </label>
          <button
            type="button"
            disabled={isPending || !month}
            onClick={submit}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Analyzing…" : "Analyze month"}
          </button>
        </div>
        <p className="text-xs leading-5 text-slate-600">
          To produce this report, the app sends Gemini a calculated summary of your selected month, including category names and amounts, budget totals, savings goal totals, and month-over-month totals when available. It does not send transaction notes, transaction rows, account IDs, or your user ID. Google&apos;s free tier may use submitted data to improve its products; review the current <a className="underline" href="https://ai.google.dev/gemini-api/docs/pricing" target="_blank" rel="noreferrer">Gemini API data terms</a> before proceeding.
        </p>
      </section>

      {isPending && <p role="status" className="text-sm text-slate-600">Calculating your monthly summary and preparing the report…</p>}
      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
      {empty && <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">There is no financial activity or saved goal data for this month to analyze.</div>}

      {report && (
        <section aria-live="polite" className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{report.summary}</p>
          </div>
          {sections.map(({ key, title }) => report[key].length > 0 && (
            <div key={key}>
              <h3 className="font-medium text-slate-900">{title}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                {report[key].map((item, index) => <li key={`${key}-${index}`}>{item}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
