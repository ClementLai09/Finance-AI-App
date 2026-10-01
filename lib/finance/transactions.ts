import { addDecimals, decimalToString, type Decimal } from "./decimal";
import { getMonthRange, isValidDate } from "./dates";

export type TransactionType = "income" | "expense";
export type ValidTransactionInput = {
  type: TransactionType;
  amount: string;
  categoryId: string;
  date: string;
  notes: string | null;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parsePositiveAmount(rawAmount: string): string | null {
  if (typeof rawAmount !== "string") return null;
  const amount = rawAmount.trim();
  const match = amount.match(/^(\d+)(?:\.(\d*))?$|^\.(\d+)$/);
  if (!match) return null;

  const integer = match[1] ?? "0";
  const fraction = match[2] ?? match[3] ?? "";
  const significantInteger = integer.replace(/^0+/, "") || "0";
  if (significantInteger.length > 131072 || fraction.length > 16383) return null;
  if (BigInt(`${significantInteger}${fraction}`) <= BigInt(0)) return null;
  return fraction ? `${significantInteger}.${fraction}` : significantInteger;
}

export function validateTransactionInput(
  rawType: string,
  rawAmount: string,
  rawCategoryId: string,
  rawDate: string,
  rawNotes: string,
): { success: true; input: ValidTransactionInput } | { success: false; message: string } {
  const type: TransactionType | null = rawType === "income" || rawType === "expense" ? rawType : null;
  const amount = parsePositiveAmount(rawAmount);
  const categoryId = typeof rawCategoryId === "string" ? rawCategoryId : "";
  const date = typeof rawDate === "string" ? rawDate : "";
  const notes = typeof rawNotes === "string" && rawNotes.trim() ? rawNotes : null;

  if (!type) return { success: false, message: "Choose income or expense." };
  if (amount === null) return { success: false, message: "Enter an amount greater than zero." };
  if (!uuidPattern.test(categoryId)) return { success: false, message: "Choose a valid category." };
  if (!isValidDate(date)) return { success: false, message: "Enter a valid transaction date." };
  return { success: true, input: { type, amount, categoryId, date, notes } };
}

export type MonthlyTransaction = { type: TransactionType; amount: string; date: string; categoryId: string };
export type MonthlyTotals = { income: string; expenses: string; remaining: string; expenseByCategory: Map<string, string> };

export function calculateMonthlyTotals(
  transactions: MonthlyTransaction[],
  month: string,
): MonthlyTotals {
  const { firstDay, nextMonthStart } = getMonthRange(month);
  let income: Decimal = { coefficient: BigInt(0), scale: 0 };
  let expenses: Decimal = { coefficient: BigInt(0), scale: 0 };
  const categoryTotals = new Map<string, Decimal>();

  for (const transaction of transactions) {
    if (transaction.date < firstDay || transaction.date >= nextMonthStart) continue;
    if (transaction.type === "income") {
      income = addDecimals(income, transaction.amount);
    } else {
      expenses = addDecimals(expenses, transaction.amount);
      categoryTotals.set(
        transaction.categoryId,
        addDecimals(categoryTotals.get(transaction.categoryId) ?? { coefficient: BigInt(0), scale: 0 }, transaction.amount),
      );
    }
  }

  const incomeText = decimalToString(income);
  const expenseText = decimalToString(expenses);
  return {
    income: incomeText,
    expenses: expenseText,
    remaining: decimalToString(addDecimals(income, `-${expenseText}`)),
    expenseByCategory: new Map([...categoryTotals].map(([id, total]) => [id, decimalToString(total)])),
  };
}
