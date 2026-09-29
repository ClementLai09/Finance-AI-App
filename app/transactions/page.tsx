import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { TransactionManager, type CategoryOption, type Transaction } from "./transaction-manager";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [transactionsResult, categoriesResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("id, type, amount, category_id, date, notes, created_at")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("id, name, type, is_archived")
      .eq("user_id", user.id)
      .order("name"),
  ]);

  return (
    <TransactionManager
      transactions={(transactionsResult.data ?? []) as Transaction[]}
      categories={(categoriesResult.data ?? []) as CategoryOption[]}
      transactionsError={
        transactionsResult.error ? "We couldn't load your transactions. Please try again." : undefined
      }
      categoriesError={
        categoriesResult.error ? "We couldn't load your categories. Please try again." : undefined
      }
    />
  );
}
