"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

type TransactionType = "income" | "expense";
type ActionResult = { success: true; message: string } | { success: false; message: string };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number(value.slice(0, 4)) < 1) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.valueOf()) && parsedDate.toISOString().slice(0, 10) === value;
}

export async function createTransaction(
  rawType: string,
  rawAmount: string,
  rawCategoryId: string,
  rawDate: string,
  rawNotes: string,
): Promise<ActionResult> {
  const type: TransactionType | null = rawType === "income" || rawType === "expense" ? rawType : null;
  const amount = typeof rawAmount === "string" && rawAmount.trim() ? Number(rawAmount) : Number.NaN;
  const categoryId = typeof rawCategoryId === "string" ? rawCategoryId : "";
  const date = typeof rawDate === "string" ? rawDate : "";
  const notes = typeof rawNotes === "string" && rawNotes.trim() ? rawNotes : null;

  if (!type) {
    return { success: false, message: "Choose income or expense." };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, message: "Enter an amount greater than zero." };
  }
  if (!uuidPattern.test(categoryId)) {
    return { success: false, message: "Choose a valid category." };
  }
  if (!isValidDate(date)) {
    return { success: false, message: "Enter a valid transaction date." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Your session has expired. Please log in again." };
    }

    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id, type, is_archived")
      .eq("id", categoryId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (categoryError) {
      return { success: false, message: "We couldn't verify that category. Please try again." };
    }
    if (!category) {
      return { success: false, message: "Choose one of your categories." };
    }
    if (category.type !== type) {
      return { success: false, message: "Choose a category that matches the transaction type." };
    }
    if (category.is_archived) {
      return { success: false, message: "Archived categories can't be used for new transactions." };
    }

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
