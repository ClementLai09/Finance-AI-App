"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

type ActionResult = { success: true; message: string } | { success: false; message: string };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isPositiveAmount(rawAmount: string) {
  const amount = typeof rawAmount === "string" ? rawAmount.trim() : "";
  if (amount.length > 100 || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(amount)) return false;
  return BigInt(amount.replace(".", "")) > BigInt(0);
}

function currentMonthStart() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}-01`;
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { supabase, user: error ? null : user };
}

export async function createBudget(rawCategoryId: string, rawAmount: string): Promise<ActionResult> {
  if (typeof rawCategoryId !== "string" || !uuidPattern.test(rawCategoryId)) {
    return { success: false, message: "Choose a valid expense category." };
  }
  if (typeof rawAmount !== "string" || !isPositiveAmount(rawAmount)) {
    return { success: false, message: "Enter a valid budget amount greater than zero." };
  }

  try {
    const { supabase, user } = await getAuthenticatedUser();
    if (!user) return { success: false, message: "Your session has expired. Please log in again." };

    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id, type, is_archived")
      .eq("id", rawCategoryId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (categoryError) {
      return { success: false, message: "We couldn't verify that category. Please try again." };
    }
    if (!category || category.type !== "expense" || category.is_archived) {
      return { success: false, message: "Choose one of your active expense categories." };
    }

    const { error } = await supabase.from("budgets").insert({
      user_id: user.id,
      category_id: category.id,
      amount: rawAmount.trim(),
      month: currentMonthStart(),
    });

    if (error) {
      if (error.code === "23505") {
        return { success: false, message: "A budget already exists for this category and month." };
      }
      return { success: false, message: "We couldn't save that budget. Please try again." };
    }

    revalidatePath("/budgets");
    return { success: true, message: "Monthly budget created." };
  } catch {
    return { success: false, message: "A connection error occurred. Please try again." };
  }
}

export async function updateBudgetAmount(rawBudgetId: string, rawAmount: string): Promise<ActionResult> {
  if (typeof rawBudgetId !== "string" || !uuidPattern.test(rawBudgetId)) {
    return { success: false, message: "That budget could not be found. Refresh and try again." };
  }
  if (typeof rawAmount !== "string" || !isPositiveAmount(rawAmount)) {
    return { success: false, message: "Enter a valid budget amount greater than zero." };
  }

  try {
    const { supabase, user } = await getAuthenticatedUser();
    if (!user) return { success: false, message: "Your session has expired. Please log in again." };
    const month = currentMonthStart();

    const { data: existing, error: lookupError } = await supabase
      .from("budgets")
      .select("id")
      .eq("id", rawBudgetId)
      .eq("user_id", user.id)
      .eq("month", month)
      .maybeSingle();

    if (lookupError) return { success: false, message: "We couldn't verify that budget. Please try again." };
    if (!existing) return { success: false, message: "That budget is no longer available." };

    const { data, error } = await supabase
      .from("budgets")
      .update({ amount: rawAmount.trim() })
      .eq("id", rawBudgetId)
      .eq("user_id", user.id)
      .eq("month", month)
      .select("id")
      .maybeSingle();

    if (error) return { success: false, message: "We couldn't update that budget. Please try again." };
    if (!data) return { success: false, message: "That budget is no longer available. Refresh and try again." };

    revalidatePath("/budgets");
    return { success: true, message: "Budget amount updated." };
  } catch {
    return { success: false, message: "A connection error occurred. Please try again." };
  }
}

export async function deleteBudget(rawBudgetId: string): Promise<ActionResult> {
  if (typeof rawBudgetId !== "string" || !uuidPattern.test(rawBudgetId)) {
    return { success: false, message: "That budget could not be found. Refresh and try again." };
  }

  try {
    const { supabase, user } = await getAuthenticatedUser();
    if (!user) return { success: false, message: "Your session has expired. Please log in again." };
    const month = currentMonthStart();

    const { data: existing, error: lookupError } = await supabase
      .from("budgets")
      .select("id")
      .eq("id", rawBudgetId)
      .eq("user_id", user.id)
      .eq("month", month)
      .maybeSingle();

    if (lookupError) return { success: false, message: "We couldn't verify that budget. Please try again." };
    if (!existing) return { success: false, message: "That budget is no longer available." };

    const { data, error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", rawBudgetId)
      .eq("user_id", user.id)
      .eq("month", month)
      .select("id")
      .maybeSingle();

    if (error) return { success: false, message: "We couldn't delete that budget. Please try again." };
    if (!data) return { success: false, message: "That budget is no longer available. Refresh and try again." };

    revalidatePath("/budgets");
    return { success: true, message: "Budget deleted." };
  } catch {
    return { success: false, message: "A connection error occurred. Please try again." };
  }
}
