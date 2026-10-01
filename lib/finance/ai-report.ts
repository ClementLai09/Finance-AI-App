export type AnalysisReport = {
  summary: string;
  spending_observations: string[];
  category_observations: string[];
  budget_observations: string[];
  savings_observations: string[];
  previous_month_comparison: string[];
  areas_to_watch: string[];
  suggestions: string[];
};

export function validateReport(value: unknown): AnalysisReport | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const keys: (keyof AnalysisReport)[] = [
    "summary", "spending_observations", "category_observations", "budget_observations",
    "savings_observations", "previous_month_comparison", "areas_to_watch", "suggestions",
  ];
  if (typeof record.summary !== "string" || !record.summary.trim() || record.summary.length > 1200) return null;
  const result: AnalysisReport = {
    summary: record.summary.trim(),
    spending_observations: [],
    category_observations: [],
    budget_observations: [],
    savings_observations: [],
    previous_month_comparison: [],
    areas_to_watch: [],
    suggestions: [],
  };
  for (const key of keys.slice(1)) {
    const items = record[key];
    if (!Array.isArray(items) || items.length > 6 || items.some((item) => typeof item !== "string" || !item.trim() || item.length > 600)) return null;
    Object.assign(result, { [key]: items.map((item) => (item as string).trim()) });
  }
  return result;
}
