"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

type TransactionType = "income" | "expense";
type ActionResult = { success: true; message: string } | { success: false; message: string };
type ValidTransactionInput = {
  type: TransactionType;
  amount: string;
  categoryId: string;
  date: string;
  notes: string | null;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parsePositiveAmount(rawAmount: string): string | null {
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

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number(value.slice(0, 4)) < 1) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.valueOf()) && parsedDate.toISOString().slice(0, 10) === value;
}

function validateTransactionInput(
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
  if (amount === null) {
    return { success: false, message: "Enter an amount greater than zero." };
  }
  if (!uuidPattern.test(categoryId)) {
    return { success: false, message: "Choose a valid category." };
  }
  if (!isValidDate(date)) {
    return { success: false, message: "Enter a valid transaction date." };
  }

  return { success: true, input: { type, amount, categoryId, date, notes } };
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return { supabase, user: null };
  return { supabase, user };
}

async function getUsableCategory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  categoryId: string,
  type: TransactionType,
  allowArchived: boolean,
) {
  const { data: category, error } = await supabase
    .from("categories")
    .select("id, type, is_archived")
    .eq("id", categoryId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { valid: false as const, message: "We couldn't verify that category. Please try again." };
  if (!category) return { valid: false as const, message: "Choose one of your categories." };
  if (category.type !== type) {
    return { valid: false as const, message: "Choose a category that matches the transaction type." };
  }
  if (category.is_archived && !allowArchived) {
    return { valid: false as const, message: "Archived categories can't be assigned to this transaction." };
  }

  return { valid: true as const, category };
}

export async function createTransaction(
  rawType: string,
  rawAmount: string,
  rawCategoryId: string,
  rawDate: string,
  rawNotes: string,
): Promise<ActionResult> {
  const validation = validateTransactionInput(rawType, rawAmount, rawCategoryId, rawDate, rawNotes);
  if (!validation.success) return validation;
  const { type, amount, categoryId, date, notes } = validation.input;

  try {
    const { supabase, user } = await getAuthenticatedUser();
    if (!user) {
      return { success: false, message: "Your session has expired. Please log in again." };
    }

    const categoryResult = await getUsableCategory(supabase, user.id, categoryId, type, false);
    if (!categoryResult.valid) return { success: false, message: categoryResult.message };

    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type,
      amount,
      category_id: categoryId,
      date,
      notes,
    });

    if (error) {
      return { success: false, message: "We couldn't save that transaction. Please try again." };
    }

    revalidatePath("/transactions");
    return { success: true, message: `${type === "income" ? "Income" : "Expense"} added successfully.` };
  } catch {
    return { success: false, message: "A connection error occurred. Please try again." };
  }
}

export async function updateTransaction(
  rawTransactionId: string,
  rawType: string,
  rawAmount: string,
  rawCategoryId: string,
  rawDate: string,
  rawNotes: string,
): Promise<ActionResult> {
  if (typeof rawTransactionId !== "string" || !uuidPattern.test(rawTransactionId)) {
    return { success: false, message: "That transaction could not be found. Refresh and try again." };
  }

  const validation = validateTransactionInput(rawType, rawAmount, rawCategoryId, rawDate, rawNotes);
  if (!validation.success) return validation;
  const { type, amount, categoryId, date, notes } = validation.input;

  try {
    const { supabase, user } = await getAuthenticatedUser();
    if (!user) {
      return { success: false, message: "Your session has expired. Please log in again." };
    }

    const { data: existing, error: transactionError } = await supabase
      .from("transactions")
      .select("id, type, category_id")
      .eq("id", rawTransactionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (transactionError) {
      return { success: false, message: "We couldn't verify that transaction. Please try again." };
    }
    if (!existing) {
      return { success: false, message: "That transaction could not be found or is no longer available." };
    }

    const categoryWasChanged = categoryId !== existing.category_id;
    const categoryResult = await getUsableCategory(
      supabase,
      user.id,
      categoryId,
      type,
      !categoryWasChanged && type === existing.type,
    );
    if (!categoryResult.valid) return { success: false, message: categoryResult.message };

    const updates = {
      type,
      amount,
      date,
      notes,
      ...(categoryWasChanged ? { category_id: categoryId } : {}),
    };
    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", rawTransactionId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return { success: false, message: "We couldn't update that transaction. Please try again." };
    }
    if (!data) {
      return { success: false, message: "That transaction is no longer available. Refresh and try again." };
    }

    revalidatePath("/transactions");
    return { success: true, message: "Transaction updated successfully." };
  } catch {
    return { success: false, message: "A connection error occurred. Please try again." };
  }
}

export async function deleteTransaction(rawTransactionId: string): Promise<ActionResult> {
  if (typeof rawTransactionId !== "string" || !uuidPattern.test(rawTransactionId)) {
    return { success: false, message: "That transaction could not be found. Refresh and try again." };
  }

  try {
    const { supabase, user } = await getAuthenticatedUser();
    if (!user) {
      return { success: false, message: "Your session has expired. Please log in again." };
    }

    const { data: existing, error: lookupError } = await supabase
      .from("transactions")
      .select("id")
      .eq("id", rawTransactionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (lookupError) {
      return { success: false, message: "We couldn't verify that transaction. Please try again." };
    }
    if (!existing) {
      return { success: false, message: "That transaction could not be found or is no longer available." };
    }

    const { data, error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", rawTransactionId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return { success: false, message: "We couldn't delete that transaction. Please try again." };
    }
    if (!data) {
      return { success: false, message: "That transaction is no longer available. Refresh and try again." };
    }

    revalidatePath("/transactions");
    return { success: true, message: "Transaction deleted successfully." };
  } catch {
    return { success: false, message: "A connection error occurred. Please try again." };
  }
}
