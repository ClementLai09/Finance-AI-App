import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { SavingsGoalManager, type SavingsGoal } from "./savings-goal-manager";
import { calculateSavingsGoal } from "../../lib/finance/savings-goals";

type GoalRow = {
  id: string;
  name: string;
  target_amount_text: string;
  current_amount_text: string;
  target_date: string | null;
};

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
  const goals: SavingsGoal[] = result.goals.map((goal) => {
    const calculations = calculateSavingsGoal(goal.target_amount_text, goal.current_amount_text);
    return {
      id: goal.id,
      name: goal.name,
      targetAmount: goal.target_amount_text,
      currentAmount: goal.current_amount_text,
      ...calculations,
      targetDate: goal.target_date,
    };
  });

  return (
    <SavingsGoalManager
      goals={result.error ? [] : goals}
      loadError={result.error ? "We couldn't load your savings goals. Please try again." : undefined}
    />
  );
}
