"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

type ActionResult = { success: true; message: string } | { success: false; message: string };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseNonnegativeDecimal(value: string) {
  const trimmed = value.trim();
  if (trimmed.length > 100) return null;
  const match = trimmed.match(/^(?:(\d+)(?:\.(\d*))?|\.(\d+))$/);
  if (!match) return null;
  const integer = match[1] ?? "0";
  const fraction = match[2] ?? match[3] ?? "";
  return {
    text: trimmed,
    coefficient: BigInt(`${integer}${fraction}`),
    scale: fraction.length,
  };
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number(value.slice(0, 4)) < 1) return false;
  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.valueOf()) && parsedDate.toISOString().slice(0, 10) === value;
}

function validateGoal(
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
  if (!target || target.coefficient <= BigInt(0)) {
    return { success: false as const, message: "Enter a target amount greater than zero." };
  }
  if (!current) return { success: false as const, message: "Enter a valid current saved amount of zero or more." };

  const scale = Math.max(target.scale, current.scale);
  const targetValue = target.coefficient * BigInt(10) ** BigInt(scale - target.scale);
  const currentValue = current.coefficient * BigInt(10) ** BigInt(scale - current.scale);
  if (currentValue > targetValue) {
    return { success: false as const, message: "Current savings cannot exceed the target amount." };
  }
  if (targetDate && !isValidDate(targetDate)) {
    return { success: false as const, message: "Enter a valid target date." };
  }

  return {
    success: true as const,
    input: {
      name,
      targetAmount: target.text,
      currentAmount: current.text,
      targetDate: targetDate || null,
    },
  };
}

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
  const validation = validateGoal(rawName, rawTargetAmount, rawCurrentAmount, rawTargetDate);
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
  const validation = validateGoal(rawName, rawTargetAmount, rawCurrentAmount, rawTargetDate);
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
