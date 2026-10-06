export type SavingsGoalTimestamps = {
  created_at: string | null;
  updated_at: string | null;
};

function monthForTimestamp(timestamp: string | null): string | null {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return year && month ? `${year}-${month}` : null;
}

export function hasSavingsGoalActivityInMonth(
  goals: SavingsGoalTimestamps[],
  month: string,
): boolean {
  return goals.some(
    (goal) =>
      monthForTimestamp(goal.created_at) === month ||
      monthForTimestamp(goal.updated_at) === month,
  );
}

export function hasRelevantMonthlyAnalysisData(
  month: string,
  transactionCount: number,
  budgetCount: number,
  goals: SavingsGoalTimestamps[],
): boolean {
  return (
    transactionCount > 0 ||
    budgetCount > 0 ||
    hasSavingsGoalActivityInMonth(goals, month)
  );
}
