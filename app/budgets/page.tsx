import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { BudgetManager, type BudgetItem, type BudgetCategory } from "./budget-manager";
import { addDecimals, decimalToString, type Decimal } from "../../lib/finance/decimal";
import { calculateBudgetProgress } from "../../lib/finance/budgets";
import { getMonthRange } from "../../lib/finance/dates";

type ExpenseTransaction = { category_id: string; amount_text: string };

function currentMonth() {
  const range = getMonthRange();
  return { start: range.firstDay, nextStart: range.nextMonthStart, label: range.label };
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
  const spentByCategory = new Map<string, Decimal>();

  for (const expense of expenseResult.expenses) {
    spentByCategory.set(
      expense.category_id,
      addDecimals(
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
    const spentString = decimalToString(spent);
    const progress = calculateBudgetProgress(budget.amount_text, spentString);
    return {
      id: budget.id,
      categoryId: budget.category_id,
      categoryName: categoryNames.get(budget.category_id) ?? "Category unavailable",
      isCategoryArchived: categories.find((category) => category.id === budget.category_id)?.is_archived ?? false,
      budgetAmount: budget.amount_text,
      spentAmount: spentString,
      ...progress,
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
