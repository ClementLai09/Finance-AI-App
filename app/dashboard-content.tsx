import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import { calculateBudgetProgress } from "../lib/finance/budgets";
import { formatMoney, percentageOf, compareDecimals } from "../lib/finance/decimal";
import { getMonthRange } from "../lib/finance/dates";
import { calculateMonthlyTotals } from "../lib/finance/transactions";

type FinanceType = "income" | "expense";
type DashboardTransaction = {
  id: string;
  type: FinanceType;
  amount_text: string;
  category_id: string;
  date: string;
  notes: string | null;
  created_at: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

async function loadMonthlyTransactions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  firstDay: string,
  nextMonthStart: string,
) {
  const pageSize = 500;
  const transactions: DashboardTransaction[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("transactions")
      .select("id, type, amount_text:amount::text, category_id, date, notes, created_at")
      .eq("user_id", userId)
      .gte("date", firstDay)
      .lt("date", nextMonthStart)
      .order("date", { ascending: true })
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) return { data: transactions, error: true };
    const page = (data ?? []) as DashboardTransaction[];
    transactions.push(...page);
    if (page.length < pageSize) return { data: transactions, error: false };
  }
}

export async function DashboardContent({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const params = await searchParams;
  const requestedMonth = Array.isArray(params.month) ? params.month[0] : params.month;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { month, currentMonth, firstDay, nextMonthStart, label: monthLabel } = getMonthRange(requestedMonth);
  const [monthlyResult, recentResult, categoriesResult, budgetsResult] = await Promise.all([
    loadMonthlyTransactions(supabase, user.id, firstDay, nextMonthStart),
    supabase
      .from("transactions")
      .select("id, type, amount_text:amount::text, category_id, date, notes, created_at")
      .eq("user_id", user.id)
      .gte("date", firstDay)
      .lt("date", nextMonthStart)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(5),
    supabase.from("categories").select("id, name, is_archived").eq("user_id", user.id),
    supabase
      .from("budgets")
      .select("id, category_id, amount_text:amount::text")
      .eq("user_id", user.id)
      .eq("month", firstDay)
      .order("created_at", { ascending: true }),
  ]);

  if (monthlyResult.error || recentResult.error || categoriesResult.error || budgetsResult.error) {
    return (
      <section aria-labelledby="dashboard-title">
        <DashboardHeading month={month} currentMonth={currentMonth} monthLabel={monthLabel} />
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          We couldn’t load your dashboard data. Please try again.
          <Link href={`/?month=${month}`} className="ml-2 font-semibold underline underline-offset-2">
            Retry
          </Link>
        </div>
      </section>
    );
  }

  const monthlyTransactions = monthlyResult.data;
  const recentTransactions = (recentResult.data ?? []) as DashboardTransaction[];
  const categoryNames = new Map(
    (categoriesResult.data ?? []).map((category) => [category.id, category.name]),
  );
  const categoryRows = new Map((categoriesResult.data ?? []).map((category) => [category.id, category]));

  const totals = calculateMonthlyTotals(monthlyTransactions.map((transaction) => ({
    type: transaction.type,
    amount: transaction.amount_text,
    date: transaction.date,
    categoryId: transaction.category_id,
  })), month);
  const expenseByCategory = totals.expenseByCategory;
  const categorySpending = [...expenseByCategory.entries()]
    .map(([categoryId, amount]) => ({
      categoryId,
      name: categoryNames.get(categoryId) ?? "Category unavailable",
      amount,
    }))
    .sort((left, right) => compareDecimals(right.amount, left.amount));
  const largestCategoryAmount = categorySpending[0]?.amount ?? "0";
  const categoryBudgets = ((budgetsResult.data ?? []) as { id: string; category_id: string; amount_text: string }[])
    .map((budget) => {
      const spent = expenseByCategory.get(budget.category_id) ?? "0";
      const progress = calculateBudgetProgress(budget.amount_text, spent);
      return {
        id: budget.id,
        name: categoryNames.get(budget.category_id) ?? "Category unavailable",
        archived: categoryRows.get(budget.category_id)?.is_archived ?? false,
        budget: budget.amount_text,
        spent,
        remaining: progress.remainingAmount,
        overspent: progress.overspentAmount,
      };
    });

  return (
    <section aria-labelledby="dashboard-title">
      <DashboardHeading month={month} currentMonth={currentMonth} monthLabel={monthLabel} />

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Monthly income" amount={totals.income} />
        <SummaryCard label="Monthly expenses" amount={totals.expenses} />
        <SummaryCard label="Remaining money" amount={totals.remaining} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-950">Category spending</h2>
          <p className="mt-1 text-sm text-slate-500">Expenses for {monthLabel}</p>
          {categorySpending.length === 0 ? (
            <p className="mt-5 text-sm text-slate-500">No expenses recorded for this month.</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {categorySpending.map((item) => {
                const width = percentageOf(item.amount, largestCategoryAmount);
                return (
                  <li key={item.categoryId}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate font-medium text-slate-800">{item.name}</span>
                      <span className="shrink-0 text-slate-600">{formatMoney(item.amount)}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-emerald-600"
                        style={{ width: `${width}%` }}
                        aria-label={`${item.name}: ${formatMoney(item.amount)}`}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-950">Recent transactions</h2>
            <Link href="/transactions" className="text-sm font-medium text-emerald-700 hover:underline">
              View all
            </Link>
          </div>
          {recentTransactions.length === 0 ? (
            <p className="mt-5 text-sm text-slate-500">No transactions yet. Add one to see it here.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {recentTransactions.map((transaction) => (
                <li key={transaction.id} className="flex items-start justify-between gap-3 py-3 first:pt-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {categoryNames.get(transaction.category_id) ?? "Category unavailable"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      <span className="capitalize">{transaction.type}</span> · {formatDate(transaction.date)}
                      {transaction.notes ? ` · ${transaction.notes}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-semibold ${
                      transaction.type === "income" ? "text-emerald-700" : "text-slate-900"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "−"}
                    {formatMoney(transaction.amount_text)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="dashboard-budgets-heading">
        <h2 id="dashboard-budgets-heading" className="text-lg font-semibold text-slate-950">Category budget progress</h2>
        <p className="mt-1 text-sm text-slate-500">Budgets for {monthLabel}</p>
        {categoryBudgets.length === 0 ? (
          <p className="mt-5 text-sm text-slate-500">No category budgets for this month.</p>
        ) : (
          <ul className="mt-5 space-y-5">
            {categoryBudgets.map((budget) => {
              const progress = Math.min(percentageOf(budget.spent, budget.budget), 100);
              return (
                <li key={budget.id}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{budget.name}{budget.archived ? " (Archived)" : ""}</p>
                      <p className="mt-1 text-sm text-slate-600">{formatMoney(budget.spent)} spent of {formatMoney(budget.budget)}</p>
                    </div>
                    <p className={`text-sm font-semibold ${budget.overspent ? "text-red-700" : "text-slate-700"}`}>
                      {budget.overspent ? `Over by ${formatMoney(budget.overspent)}` : `${formatMoney(budget.remaining)} remaining`}
                    </p>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(progress, 100)} aria-label={`${budget.name} budget progress`}>
                    <div className={`h-2 rounded-full ${budget.overspent ? "bg-red-600" : "bg-emerald-600"}`} style={{ width: `${progress}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </section>
  );
}

function DashboardHeading({ month, currentMonth, monthLabel }: { month: string; currentMonth: string; monthLabel: string }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 id="dashboard-title" className="text-3xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Your financial overview for {monthLabel}.</p>
      </div>
      <form action="/" method="get" className="flex items-end gap-2">
        <label htmlFor="dashboard-month" className="grid gap-1 text-sm font-medium text-slate-700">
          Month
          <input id="dashboard-month" name="month" type="month" defaultValue={month} max={currentMonth} required className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
        </label>
        <button type="submit" className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">View</button>
      </form>
    </div>
  );
}

function SummaryCard({ label, amount }: { label: string; amount: string }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-medium text-slate-600">{label}</h2>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{formatMoney(amount)}</p>
    </article>
  );
}
