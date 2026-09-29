import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { CategoryManager, type Category } from "./category-manager";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type, is_archived")
    .eq("user_id", user.id)
    .order("type")
    .order("name");

  return (
    <CategoryManager
      categories={(data ?? []) as Category[]}
      loadError={error ? "We couldn't load your categories. Please try again." : undefined}
    />
  );
}
