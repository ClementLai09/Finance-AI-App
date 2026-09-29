"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

type ActionResult = { success: true; message: string } | { success: false; message: string };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null };
  }

  return { supabase, user };
}

export async function createCategory(rawName: string, rawType: string): Promise<ActionResult> {
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const type = rawType === "income" || rawType === "expense" ? rawType : null;

  if (!name) {
    return { success: false, message: "Enter a category name." };
  }
  if (!type) {
    return { success: false, message: "Choose income or expense." };
  }

  try {
    const { supabase, user } = await getAuthenticatedUser();
    if (!user) {
      return { success: false, message: "Your session has expired. Please log in again." };
    }

    const { error } = await supabase.from("categories").insert({
      user_id: user.id,
      name,
      type,
      is_archived: false,
    });

    if (error) {
      if (error.code === "23505") {
        return {
          success: false,
          message: "A category with this name and type already exists, including archived categories.",
        };
      }
      return { success: false, message: "We couldn't create that category. Please try again." };
    }

    revalidatePath("/categories");
    return { success: true, message: `${name} category created.` };
  } catch {
    return { success: false, message: "A connection error occurred. Please try again." };
  }
}

export async function archiveCategory(categoryId: string): Promise<ActionResult> {
  if (typeof categoryId !== "string" || !uuidPattern.test(categoryId)) {
    return { success: false, message: "That category could not be found. Refresh and try again." };
  }

  try {
    const { supabase, user } = await getAuthenticatedUser();
    if (!user) {
      return { success: false, message: "Your session has expired. Please log in again." };
    }

    const { data, error } = await supabase
      .from("categories")
      .update({ is_archived: true })
      .eq("id", categoryId)
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .select("id")
      .maybeSingle();

    if (error) {
      return { success: false, message: "We couldn't archive that category. Please try again." };
    }
    if (!data) {
      return {
        success: false,
        message: "That category is no longer active. Refresh the list and try again.",
      };
    }

    revalidatePath("/categories");
    return { success: true, message: "Category archived. Historical transactions are unchanged." };
  } catch {
    return { success: false, message: "A connection error occurred. Please try again." };
  }
}

export async function unarchiveCategory(categoryId: string): Promise<ActionResult> {
  if (typeof categoryId !== "string" || !uuidPattern.test(categoryId)) {
    return { success: false, message: "That category could not be found. Refresh and try again." };
  }

  try {
    const { supabase, user } = await getAuthenticatedUser();
    if (!user) {
      return { success: false, message: "Your session has expired. Please log in again." };
    }

    const { data, error } = await supabase
      .from("categories")
      .update({ is_archived: false })
      .eq("id", categoryId)
      .eq("user_id", user.id)
      .eq("is_archived", true)
      .select("id")
      .maybeSingle();

    if (error) {
      return { success: false, message: "We couldn't unarchive that category. Please try again." };
    }
    if (!data) {
      return {
        success: false,
        message: "That category is no longer archived. Refresh the list and try again.",
      };
    }

    revalidatePath("/categories");
    return { success: true, message: "Category unarchived. Historical transactions are unchanged." };
  } catch {
    return { success: false, message: "A connection error occurred. Please try again." };
  }
}
