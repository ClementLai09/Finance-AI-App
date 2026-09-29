import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { BudgetManager, type BudgetItem, type BudgetCategory } from "./budget-manager";

type ExpenseTransaction = { category_id: string; amount_text: string };

type DecimalTotal = { coefficient: bigint; scale: number };

function decimalParts(value: string): DecimalTotal {
  const match = value.trim().match(/^([+-]?)(\d+)(?:\.(\d*))?$/);
  if (!match) throw new Error("Invalid numeric amount returned by the database.");
  const coefficient = BigInt(`${match[2]}${match[3] ?? ""}`) * (match[1] === "-" ? -BigInt(1) : BigInt(1));
  return { coefficient, scale: (match[3] ?? "").length };
}

function addDecimal(total: DecimalTotal, value: string): DecimalTotal {
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

function subtractDecimal(left: string, right: string): string {
  const a = decimalParts(left);
  const b = decimalParts(right);
  const scale = Math.max(a.scale, b.scale);
  const coefficient =
    a.coefficient * BigInt(10) ** BigInt(scale - a.scale) -
    b.coefficient * BigInt(10) ** BigInt(scale - b.scale);
  const negative = coefficient < BigInt(0);
  const digits = (negative ? -coefficient : coefficient).toString().padStart(scale + 1, "0");
  if (!scale) return `${negative ? "-" : ""}${digits}`;
  const integer = digits.slice(0, -scale);
  const fraction = digits.slice(-scale).replace(/0+$/, "");
  return `${negative ? "-" : ""}${integer}${fraction ? `.${fraction}` : ""}`;
}

function currentMonth() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const next = new Date(Date.UTC(year, month, 1));
  return {
    start,
    nextStart: `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-01`,
    label: new Intl.DateTimeFormat("en-MY", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${start}T00:00:00Z`)),
  };
}

async function loadMonthlyExpenses(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  start: string,
  nextStart: string,
) {
  const pageSize = 500;
  const expenses: ExpenseTransaction[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("transactions")
      .select("category_id, amount_text:amount::text")
      .eq("user_id", userId)
      .eq("type", "expense")
      .gte("date", start)
      .lt("date", nextStart)
      .order("date", { ascending: true })
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) return { expenses, error: true };
    const page = (data ?? []) as ExpenseTransaction[];
    expenses.push(...page);
    if (page.length < pageSize) return { expenses, error: false };
  }
}

export default async function BudgetsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const month = currentMonth();
  const [budgetsResult, categoriesResult, expenseResult] = await Promise.all([
    supabase
      .from("budgets")
      .select("id, category_id, amount_text:amount::text, month")
      .eq("user_id", user.id)
      .eq("month", month.start)
      .order("created_at", { ascending: true }),
    supabase
      .from("categories")
      .select("id, name, type, is_archived")
      .eq("user_id", user.id)
      .order("name"),
    loadMonthlyExpenses(supabase, user.id, month.start, month.nextStart),
  ]);

  const loadError = budgetsResult.error || categoriesResult.error || expenseResult.error;
  const categories = (categoriesResult.data ?? []) as BudgetCategory[];
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const spentByCategory = new Map<string, DecimalTotal>();

  for (const expense of expenseResult.expenses) {
    spentByCategory.set(
      expense.category_id,
      addDecimal(
        spentByCategory.get(expense.category_id) ?? { coefficient: BigInt(0), scale: 0 },
        expense.amount_text,
      ),
    );
  }

  const budgets: BudgetItem[] = ((budgetsResult.data ?? []) as {
    id: string;
    category_id: string;
    amount_text: string;
    month: string;
  }[]).map((budget) => {
    const spent = spentByCategory.get(budget.category_id) ?? { coefficient: BigInt(0), scale: 0 };
    const spentString = decimalString(spent);
    const remaining = subtractDecimal(budget.amount_text, spentString);
    return {
      id: budget.id,
      categoryId: budget.category_id,
      categoryName: categoryNames.get(budget.category_id) ?? "Category unavailable",
      isCategoryArchived: categories.find((category) => category.id === budget.category_id)?.is_archived ?? false,
      budgetAmount: budget.amount_text,
      spentAmount: spentString,
      remainingAmount: remaining,
      overspentAmount: remaining.startsWith("-") ? remaining.slice(1) : null,
    };
  });

  const alreadyBudgeted = new Set(budgets.map((budget) => budget.categoryId));
  const availableCategories = categories.filter(
    (category) => category.type === "expense" && !category.is_archived && !alreadyBudgeted.has(category.id),
  );

  return (
    <BudgetManager
      monthLabel={month.label}
      budgets={loadError ? [] : budgets}
      availableCategories={availableCategories}
      loadError={loadError ? "We couldn't load your budgets. Please try again." : undefined}
    />
  );
}
