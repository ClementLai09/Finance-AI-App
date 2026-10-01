export type CategoryType = "income" | "expense";

export function validateCategoryInput(rawName: string, rawType: string) {
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const type: CategoryType | null = rawType === "income" || rawType === "expense" ? rawType : null;
  if (!name) return { success: false as const, message: "Enter a category name." };
  if (!type) return { success: false as const, message: "Choose income or expense." };
  return { success: true as const, input: { name, type } };
}

export function canSelectCategory(category: { type: string; is_archived: boolean }, transactionType: CategoryType) {
  return !category.is_archived && category.type === transactionType;
}
