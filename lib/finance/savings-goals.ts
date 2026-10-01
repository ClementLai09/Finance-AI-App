import { compareDecimals, decimalToString, percentageOf, subtractDecimals } from "./decimal";
import { isValidDate } from "./dates";

function parseNonnegativeDecimal(value: string) {
  const trimmed = value.trim();
  if (trimmed.length > 100) return null;
  const match = trimmed.match(/^(?:(\d+)(?:\.(\d*))?|\.(\d+))$/);
  if (!match) return null;
  const integer = match[1] ?? "0";
  const fraction = match[2] ?? match[3] ?? "";
  return { text: trimmed, normalized: `${integer}.${fraction}` };
}

export function validateSavingsGoal(
  rawName: string,
  rawTargetAmount: string,
  rawCurrentAmount: string,
  rawTargetDate: string,
) {
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const target = typeof rawTargetAmount === "string" ? parseNonnegativeDecimal(rawTargetAmount) : null;
  const current = typeof rawCurrentAmount === "string" ? parseNonnegativeDecimal(rawCurrentAmount) : null;
  const targetDate = typeof rawTargetDate === "string" ? rawTargetDate.trim() : "";

  if (!name) return { success: false as const, message: "Enter a savings goal name." };
  if (!target || compareDecimals(target.normalized, "0") <= 0) {
    return { success: false as const, message: "Enter a target amount greater than zero." };
  }
  if (!current) return { success: false as const, message: "Enter a valid current saved amount of zero or more." };
  if (compareDecimals(current.normalized, target.normalized) > 0) {
    return { success: false as const, message: "Current savings cannot exceed the target amount." };
  }
  if (targetDate && !isValidDate(targetDate)) {
    return { success: false as const, message: "Enter a valid target date." };
  }
  return {
    success: true as const,
    input: { name, targetAmount: target.text, currentAmount: current.text, targetDate: targetDate || null },
  };
}

export function calculateSavingsGoal(targetAmount: string, currentAmount: string) {
  return {
    remainingAmount: decimalToString(subtractDecimals(targetAmount, currentAmount)),
    progressPercent: percentageOf(currentAmount, targetAmount),
  };
}
