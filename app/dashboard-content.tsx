import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";

type DecimalTotal = { coefficient: bigint; scale: number };
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

function decimalParts(value: number | string): DecimalTotal {
  const match = String(value).trim().match(/^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i);
  if (!match) throw new Error("Invalid numeric amount returned by the database.");

  const sign = match[1] === "-" ? -BigInt(1) : BigInt(1);
  const fraction = match[3] ?? "";
  let coefficient = BigInt(`${match[2]}${fraction}`) * sign;
  let scale = fraction.length - Number(match[4] ?? 0);
  if (scale < 0) {
    coefficient *= BigInt(10) ** BigInt(-scale);
    scale = 0;
  }
  return { coefficient, scale };
}

function addDecimal(total: DecimalTotal, value: number | string): DecimalTotal {
  const next = decimalParts(value);
  const scale = Math.max(total.scale, next.scale);
  return {
    coefficient:
      total.coefficient * BigInt(10) ** BigInt(scale - total.scale) +
      next.coefficient * BigInt(10) ** BigInt(scale - next.scale),
    scale,
  };
}

function decimalString(value: DecimalTotal): string {
  const negative = value.coefficient < BigInt(0);
  const digits = (negative ? -value.coefficient : value.coefficient)
    .toString()
    .padStart(value.scale + 1, "0");
  if (!value.scale) return `${negative ? "-" : ""}${digits}`;
  const integer = digits.slice(0, -value.scale);
  const fraction = digits.slice(-value.scale).replace(/0+$/, "");
  return `${negative ? "-" : ""}${integer}${fraction ? `.${fraction}` : ""}`;
}

function compareDecimalDescending(left: string, right: string) {
  const a = decimalParts(left);
  const b = decimalParts(right);
  const scale = Math.max(a.scale, b.scale);
  const leftValue = a.coefficient * BigInt(10) ** BigInt(scale - a.scale);
  const rightValue = b.coefficient * BigInt(10) ** BigInt(scale - b.scale);
  return leftValue > rightValue ? -1 : leftValue < rightValue ? 1 : 0;
}

function percentageOf(value: string, maximum: string) {
  const part = decimalParts(value);
  const whole = decimalParts(maximum);
  const scale = Math.max(part.scale, whole.scale);
  const numerator = part.coefficient * BigInt(10) ** BigInt(scale - part.scale);
  const denominator = whole.coefficient * BigInt(10) ** BigInt(scale - whole.scale);
  if (denominator <= BigInt(0)) return 0;
  return Number((numerator * BigInt(10000)) / denominator) / 100;
}

function formatMoney(value: string) {
  const match = value.trim().match(/^([+-]?)(\d+)(?:\.(\d*))?$/);
  if (!match) return "RM0.00";
  const integer = match[2].replace(/^0+(?=\d)/, "");
  const fraction = match[3] ?? "";
  let minorUnits = BigInt(`${integer}${fraction.padEnd(2, "0").slice(0, 2)}`);
  if (fraction[2] && fraction[2] >= "5") minorUnits += BigInt(1);
  const whole = minorUnits / BigInt(100);
  const cents = (minorUnits % BigInt(100)).toString().padStart(2, "0");
  const formattedWhole = new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0,
  }).format(whole);
  return `${match[1] === "-" ? "-" : ""}${formattedWhole}.${cents}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function currentMonthKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  return `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}`;
}

function monthRange(requestedMonth: string | undefined) {
  const currentMonth = currentMonthKey();
  const selectedMonth = requestedMonth && /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth) && requestedMonth <= currentMonth
    ? requestedMonth
    : currentMonth;
  const [yearText, monthText] = selectedMonth.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const firstDay = `${selectedMonth}-01`;
  const nextMonthStart = month === 12
    ? `${String(year + 1).padStart(4, "0")}-01-01`
    : `${yearText}-${String(month + 1).padStart(2, "0")}-01`;

  return {
    month: selectedMonth,
    currentMonth,
    firstDay,
    nextMonthStart,
    label: new Intl.DateTimeFormat("en-MY", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${firstDay}T00:00:00Z`)),
  };
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

  const { month, currentMonth, firstDay, nextMonthStart, label: monthLabel } = monthRange(requestedMonth);
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

  const totals: Record<FinanceType, DecimalTotal> = {
    income: { coefficient: BigInt(0), scale: 0 },
    expense: { coefficient: BigInt(0), scale: 0 },
  };
  const expenseByCategory = new Map<string, DecimalTotal>();

  for (const transaction of monthlyTransactions) {
    totals[transaction.type] = addDecimal(totals[transaction.type], transaction.amount_text);
    if (transaction.type === "expense") {
      expenseByCategory.set(
        transaction.category_id,
        addDecimal(
          expenseByCategory.get(transaction.category_id) ?? { coefficient: BigInt(0), scale: 0 },
          transaction.amount_text,
        ),
      );
    }
  }

  const remaining = addDecimal(
    totals.income,
    `${totals.expense.coefficient === BigInt(0) ? "" : "-"}${decimalString(totals.expense)}`,
  );
  const categorySpending = [...expenseByCategory.entries()]
    .map(([categoryId, amount]) => ({
      categoryId,
      name: categoryNames.get(categoryId) ?? "Category unavailable",
      amount: decimalString(amount),
    }))
    .sort((left, right) => compareDecimalDescending(left.amount, right.amount));
  const largestCategoryAmount = categorySpending[0]?.amount ?? "0";
  const categoryBudgets = ((budgetsResult.data ?? []) as { id: string; category_id: string; amount_text: string }[])
    .map((budget) => {
      const spent = decimalString(expenseByCategory.get(budget.category_id) ?? { coefficient: BigInt(0), scale: 0 });
      const remaining = subtractDecimal(budget.amount_text, spent);
      return {
        id: budget.id,
        name: categoryNames.get(budget.category_id) ?? "Category unavailable",
        archived: categoryRows.get(budget.category_id)?.is_archived ?? false,
        budget: budget.amount_text,
        spent,
        remaining,
        overspent: remaining.startsWith("-") ? remaining.slice(1) : null,
      };
    });

  return (
    <section aria-labelledby="dashboard-title">
      <DashboardHeading month={month} currentMonth={currentMonth} monthLabel={monthLabel} />

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Monthly income" amount={decimalString(totals.income)} />
        <SummaryCard label="Monthly expenses" amount={decimalString(totals.expense)} />
        <SummaryCard label="Remaining money" amount={decimalString(remaining)} />
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

function subtractDecimal(left: string, right: string): string {
  const a = decimalParts(left);
  const b = decimalParts(right);
  const scale = Math.max(a.scale, b.scale);
  const coefficient = a.coefficient * BigInt(10) ** BigInt(scale - a.scale) - b.coefficient * BigInt(10) ** BigInt(scale - b.scale);
  return decimalString({ coefficient, scale });
}

function SummaryCard({ label, amount }: { label: string; amount: string }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-medium text-slate-600">{label}</h2>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{formatMoney(amount)}</p>
    </article>
  );
}
