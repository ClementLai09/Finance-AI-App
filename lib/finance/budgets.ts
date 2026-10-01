import { subtractDecimals, decimalToString } from "./decimal";

export function isPositiveBudgetAmount(rawAmount: string): boolean {
  const amount = typeof rawAmount === "string" ? rawAmount.trim() : "";
  if (amount.length > 100 || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(amount)) return false;
  return BigInt(amount.replace(".", "")) > BigInt(0);
}

export function calculateBudgetProgress(budgetAmount: string, spentAmount: string) {
  const remainingAmount = decimalToString(subtractDecimals(budgetAmount, spentAmount));
  return {
    remainingAmount,
    overspentAmount: remainingAmount.startsWith("-") ? remainingAmount.slice(1) : null,
  };
}
