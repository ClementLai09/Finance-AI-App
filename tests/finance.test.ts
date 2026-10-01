import { describe, expect, it } from "vitest";
import { validateReport } from "../lib/finance/ai-report";
import { calculateBudgetProgress, isPositiveBudgetAmount } from "../lib/finance/budgets";
import { canSelectCategory, validateCategoryInput } from "../lib/finance/categories";
import { addDecimals, compareDecimals, decimalToString, formatMoney, parseDecimal, subtractDecimals } from "../lib/finance/decimal";
import { currentMonthKey, getMonthRange, isValidDate, monthStartForDate } from "../lib/finance/dates";
import { calculateSavingsGoal, validateSavingsGoal } from "../lib/finance/savings-goals";
import { calculateMonthlyTotals, parsePositiveAmount, validateTransactionInput } from "../lib/finance/transactions";

describe("decimal money helpers", () => {
  it("adds and subtracts without floating point loss", () => {
    expect(decimalToString(addDecimals(parseDecimal("0.1"), "0.2"))).toBe("0.3");
    expect(decimalToString(subtractDecimals("10000000000000000.01", "0.02"))).toBe("9999999999999999.99");
  });

  it("preserves fractional precision and normalizes insignificant zeroes", () => {
    expect(decimalToString(addDecimals(parseDecimal("1.2300"), "0.00005"))).toBe("1.23005");
    expect(decimalToString(parseDecimal("12.5000"))).toBe("12.5");
  });

  it("compares decimal strings exactly", () => {
    expect(compareDecimals("10.0001", "10.0000")).toBe(1);
    expect(compareDecimals("0.09", "0.1")).toBe(-1);
    expect(compareDecimals("4.20", "4.2")).toBe(0);
  });

  it("rounds only for display", () => {
    expect(formatMoney("1234.565")).toContain("1,234.57");
    expect(formatMoney("0.004")).toContain("0.00");
  });
});

describe("transaction amount and input validation", () => {
  it.each([
    ["12", "12"],
    ["00012.3400", "12.3400"],
    [".05", "0.05"],
  ])("accepts positive amount %s as exact decimal text", (input, expected) => {
    expect(parsePositiveAmount(input)).toBe(expected);
  });

  it.each(["", "0", "0.000", "-1", "1e3", "1,000", "abc"])("rejects invalid transaction amount %s", (input) => {
    expect(parsePositiveAmount(input)).toBeNull();
  });

  it("validates transaction type, category UUID, date, and optional notes", () => {
    const valid = validateTransactionInput("expense", "1.2300", "550e8400-e29b-41d4-a716-446655440000", "2024-02-29", "   ");
    expect(valid).toEqual({
      success: true,
      input: { type: "expense", amount: "1.2300", categoryId: "550e8400-e29b-41d4-a716-446655440000", date: "2024-02-29", notes: null },
    });
    expect(validateTransactionInput("transfer", "1", "550e8400-e29b-41d4-a716-446655440000", "2024-02-29", "").success).toBe(false);
    expect(validateTransactionInput("income", "1", "bad-id", "2024-02-29", "").success).toBe(false);
    expect(validateTransactionInput("income", "1", "550e8400-e29b-41d4-a716-446655440000", "2023-02-29", "").success).toBe(false);
  });
});

describe("monthly dashboard totals", () => {
  it("uses transaction dates, separates income/expenses, and totals expense categories", () => {
    const result = calculateMonthlyTotals([
      { type: "income", amount: "1000.10", date: "2026-09-01", categoryId: "salary" },
      { type: "expense", amount: "200.02", date: "2026-09-30", categoryId: "food" },
      { type: "expense", amount: "0.03", date: "2026-09-30", categoryId: "food" },
      { type: "income", amount: "9999", date: "2026-10-01", categoryId: "salary" },
      { type: "expense", amount: "99", date: "2026-08-31", categoryId: "food" },
    ], "2026-09");

    expect(result.income).toBe("1000.1");
    expect(result.expenses).toBe("200.05");
    expect(result.remaining).toBe("800.05");
    expect(result.expenseByCategory.get("food")).toBe("200.05");
    expect(result.expenseByCategory.has("salary")).toBe(false);
  });
});

describe("budget validation and calculations", () => {
  it.each(["1", "0.01", ".5"])("accepts positive budget amount %s", (amount) => {
    expect(isPositiveBudgetAmount(amount)).toBe(true);
  });

  it.each(["0", "0.00", "-1", "1e2", "  "])("rejects invalid budget amount %s", (amount) => {
    expect(isPositiveBudgetAmount(amount)).toBe(false);
  });

  it("returns zero remaining at the limit and a positive overspend when exceeded", () => {
    expect(calculateBudgetProgress("100.00", "100")).toEqual({ remainingAmount: "0", overspentAmount: null });
    expect(calculateBudgetProgress("100", "125.25")).toEqual({ remainingAmount: "-25.25", overspentAmount: "25.25" });
  });
});

describe("savings goal validation and calculation", () => {
  it("accepts saved amount equal to target and zero saved amount", () => {
    expect(validateSavingsGoal(" Fund ", "100.00", "100", "2024-02-29")).toEqual({
      success: true,
      input: { name: "Fund", targetAmount: "100.00", currentAmount: "100", targetDate: "2024-02-29" },
    });
    expect(validateSavingsGoal("Fund", "100", "0", "").success).toBe(true);
  });

  it("rejects current savings above target with exact decimal comparison", () => {
    expect(validateSavingsGoal("Fund", "100.005", "100.006", "").success).toBe(false);
  });

  it("rejects missing names, nonpositive targets, invalid current values, and invalid dates", () => {
    expect(validateSavingsGoal(" ", "1", "0", "").success).toBe(false);
    expect(validateSavingsGoal("Fund", "0", "0", "").success).toBe(false);
    expect(validateSavingsGoal("Fund", "1", "-1", "").success).toBe(false);
    expect(validateSavingsGoal("Fund", "1", "0", "2023-02-29").success).toBe(false);
  });

  it("calculates exact remaining and goal progress", () => {
    expect(calculateSavingsGoal("100.01", "25.005")).toEqual({ remainingAmount: "75.005", progressPercent: 25 });
  });
});

describe("date and month boundaries", () => {
  it("validates leap days and rejects impossible calendar dates", () => {
    expect(isValidDate("2024-02-29")).toBe(true);
    expect(isValidDate("2023-02-29")).toBe(false);
    expect(isValidDate("2024-13-01")).toBe(false);
    expect(isValidDate("0000-01-01")).toBe(false);
  });

  it("uses Kuala Lumpur calendar month across UTC month boundaries", () => {
    expect(currentMonthKey(new Date("2026-01-31T15:59:59.000Z"))).toBe("2026-01");
    expect(currentMonthKey(new Date("2026-01-31T16:00:00.000Z"))).toBe("2026-02");
  });

  it("builds correct month ranges for year rollover and clamps invalid/future months", () => {
    const now = new Date("2026-01-31T16:00:00.000Z");
    expect(getMonthRange("2025-12", now)).toMatchObject({ month: "2025-12", firstDay: "2025-12-01", nextMonthStart: "2026-01-01" });
    expect(getMonthRange("2026-13", now).month).toBe("2026-02");
    expect(getMonthRange("2026-03", now).month).toBe("2026-02");
    expect(monthStartForDate(now)).toBe("2026-02-01");
  });
});

describe("category validation and selection", () => {
  it("trims names and allows only income or expense types", () => {
    expect(validateCategoryInput("  Food  ", "expense")).toEqual({ success: true, input: { name: "Food", type: "expense" } });
    expect(validateCategoryInput("  ", "income").success).toBe(false);
    expect(validateCategoryInput("Food", "transfer").success).toBe(false);
  });

  it("allows selection only for active categories of the matching type", () => {
    expect(canSelectCategory({ type: "expense", is_archived: false }, "expense")).toBe(true);
    expect(canSelectCategory({ type: "income", is_archived: false }, "expense")).toBe(false);
    expect(canSelectCategory({ type: "expense", is_archived: true }, "expense")).toBe(false);
  });
});

describe("AI report validation", () => {
  const validReport = {
    summary: "  Stable month.  ",
    spending_observations: ["  Spending rose. "],
    category_observations: [],
    budget_observations: [],
    savings_observations: [],
    previous_month_comparison: [],
    areas_to_watch: [],
    suggestions: [],
  };

  it("accepts the expected schema and trims text", () => {
    expect(validateReport(validReport)).toMatchObject({ summary: "Stable month.", spending_observations: ["Spending rose."] });
  });

  it.each([
    null,
    [],
    {},
    { ...validReport, summary: " " },
    { ...validReport, summary: "x".repeat(1201) },
    { ...validReport, suggestions: [""] },
    { ...validReport, suggestions: ["x".repeat(601)] },
    { ...validReport, suggestions: Array(7).fill("Suggestion") },
    { ...validReport, suggestions: [4] },
  ])("rejects malformed or out-of-bounds report %#", (report) => {
    expect(validateReport(report)).toBeNull();
  });
});
