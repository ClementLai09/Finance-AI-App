"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";
import { validateSavingsGoal } from "../../lib/finance/savings-goals";

type ActionResult = { success: true; message: string } | { success: false; message: string };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { supabase, user: error ? null : user };
}

export async function createSavingsGoal(
  rawName: string,
  rawTargetAmount: string,
  rawCurrentAmount: string,
  rawTargetDate: string,
): Promise<ActionResult> {
  const validation = validateSavingsGoal(rawName, rawTargetAmount, rawCurrentAmount, rawTargetDate);
  if (!validation.success) return validation;

  try {
    const { supabase, user } = await getAuthenticatedUser();
    if (!user) return { success: false, message: "Your session has expired. Please log in again." };

    const { error } = await supabase.from("savings_goals").insert({
      user_id: user.id,
      name: validation.input.name,
      target_amount: validation.input.targetAmount,
      current_amount: validation.input.currentAmount,
      target_date: validation.input.targetDate,
    });

    if (error) return { success: false, message: "We couldn't save that savings goal. Please try again." };

    revalidatePath("/savings-goals");
    return { success: true, message: "Savings goal created." };
  } catch {
    return { success: false, message: "A connection error occurred. Please try again." };
  }
}

export async function updateSavingsGoal(
  rawGoalId: string,
  rawName: string,
  rawTargetAmount: string,
  rawCurrentAmount: string,
  rawTargetDate: string,
): Promise<ActionResult> {
  if (typeof rawGoalId !== "string" || !uuidPattern.test(rawGoalId)) {
    return { success: false, message: "That savings goal could not be found. Refresh and try again." };
  }
  const validation = validateSavingsGoal(rawName, rawTargetAmount, rawCurrentAmount, rawTargetDate);
  if (!validation.success) return validation;

  try {
    const { supabase, user } = await getAuthenticatedUser();
    if (!user) return { success: false, message: "Your session has expired. Please log in again." };

    const { data: existing, error: lookupError } = await supabase
      .from("savings_goals")
      .select("id")
      .eq("id", rawGoalId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (lookupError) return { success: false, message: "We couldn't verify that savings goal. Please try again." };
    if (!existing) return { success: false, message: "That savings goal is no longer available." };

    const { data, error } = await supabase
      .from("savings_goals")
      .update({
        name: validation.input.name,
        target_amount: validation.input.targetAmount,
        current_amount: validation.input.currentAmount,
        target_date: validation.input.targetDate,
      })
      .eq("id", rawGoalId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) return { success: false, message: "We couldn't update that savings goal. Please try again." };
    if (!data) return { success: false, message: "That savings goal is no longer available. Refresh and try again." };

    revalidatePath("/savings-goals");
    return { success: true, message: "Savings goal updated." };
  } catch {
    return { success: false, message: "A connection error occurred. Please try again." };
  }
}

export async function deleteSavingsGoal(rawGoalId: string): Promise<ActionResult> {
  if (typeof rawGoalId !== "string" || !uuidPattern.test(rawGoalId)) {
    return { success: false, message: "That savings goal could not be found. Refresh and try again." };
  }

  try {
    const { supabase, user } = await getAuthenticatedUser();
    if (!user) return { success: false, message: "Your session has expired. Please log in again." };

    const { data: existing, error: lookupError } = await supabase
      .from("savings_goals")
      .select("id")
      .eq("id", rawGoalId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (lookupError) return { success: false, message: "We couldn't verify that savings goal. Please try again." };
    if (!existing) return { success: false, message: "That savings goal is no longer available." };

    const { data, error } = await supabase
      .from("savings_goals")
      .delete()
      .eq("id", rawGoalId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) return { success: false, message: "We couldn't delete that savings goal. Please try again." };
    if (!data) return { success: false, message: "That savings goal is no longer available. Refresh and try again." };

    revalidatePath("/savings-goals");
    return { success: true, message: "Savings goal deleted." };
  } catch {
    return { success: false, message: "A connection error occurred. Please try again." };
  }
}
