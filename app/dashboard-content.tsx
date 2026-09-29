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
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function currentMonthRange() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = new Date(Date.UTC(year, month, 1));
  const nextMonthStart = `${nextMonth.getUTCFullYear()}-${String(
    nextMonth.getUTCMonth() + 1,
  ).padStart(2, "0")}-01`;

  return {
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

export async function DashboardContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { firstDay, nextMonthStart, label: monthLabel } = currentMonthRange();
  const [monthlyResult, recentResult, categoriesResult] = await Promise.all([
    loadMonthlyTransactions(supabase, user.id, firstDay, nextMonthStart),
    supabase
      .from("transactions")
      .select("id, type, amount_text:amount::text, category_id, date, notes, created_at")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(5),
    supabase.from("categories").select("id, name").eq("user_id", user.id),
  ]);

  if (monthlyResult.error || recentResult.error || categoriesResult.error) {
    return (
      <section aria-labelledby="dashboard-title">
        <DashboardHeading monthLabel={monthLabel} />
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          We couldn’t load your dashboard data. Please try again.
          <Link href="/" className="ml-2 font-semibold underline underline-offset-2">
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

  return (
    <section aria-labelledby="dashboard-title">
      <DashboardHeading monthLabel={monthLabel} />

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
    </section>
  );
}

function DashboardHeading({ monthLabel }: { monthLabel: string }) {
  return (
    <div className="mb-6">
      <h1 id="dashboard-title" className="text-3xl font-semibold tracking-tight text-slate-950">
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-slate-600">Your financial overview for {monthLabel}.</p>
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
