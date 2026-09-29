import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { SavingsGoalManager, type SavingsGoal } from "./savings-goal-manager";

type GoalRow = {
  id: string;
  name: string;
  target_amount_text: string;
  current_amount_text: string;
  target_date: string | null;
};

type DecimalValue = { coefficient: bigint; scale: number };

function parseDecimal(value: string): DecimalValue {
  const match = value.trim().match(/^([+-]?)(\d+)(?:\.(\d*))?$/);
  if (!match) throw new Error("Invalid numeric amount returned by the database.");
  return {
    coefficient: BigInt(`${match[2]}${match[3] ?? ""}`) * (match[1] === "-" ? -BigInt(1) : BigInt(1)),
    scale: (match[3] ?? "").length,
  };
}

function subtractDecimal(left: string, right: string): string {
  const a = parseDecimal(left);
  const b = parseDecimal(right);
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

function progressPercent(current: string, target: string) {
  const currentValue = parseDecimal(current);
  const targetValue = parseDecimal(target);
  const scale = Math.max(currentValue.scale, targetValue.scale);
  const numerator = currentValue.coefficient * BigInt(10) ** BigInt(scale - currentValue.scale);
  const denominator = targetValue.coefficient * BigInt(10) ** BigInt(scale - targetValue.scale);
  if (denominator <= BigInt(0)) return 0;
  return Number((numerator * BigInt(10000)) / denominator) / 100;
}

async function loadGoals(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const pageSize = 500;
  const goals: GoalRow[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("savings_goals")
      .select("id, name, target_amount_text:target_amount::text, current_amount_text:current_amount::text, target_date")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) return { goals, error: true };
    const page = (data ?? []) as GoalRow[];
    goals.push(...page);
    if (page.length < pageSize) return { goals, error: false };
  }
}

export default async function SavingsGoalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const result = await loadGoals(supabase, user.id);
  const goals: SavingsGoal[] = result.goals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    targetAmount: goal.target_amount_text,
    currentAmount: goal.current_amount_text,
    remainingAmount: subtractDecimal(goal.target_amount_text, goal.current_amount_text),
    progressPercent: progressPercent(goal.current_amount_text, goal.target_amount_text),
    targetDate: goal.target_date,
  }));

  return (
    <SavingsGoalManager
      goals={result.error ? [] : goals}
      loadError={result.error ? "We couldn't load your savings goals. Please try again." : undefined}
    />
  );
}
