"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { archiveCategory, createCategory, unarchiveCategory } from "./actions";

export type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  is_archived: boolean;
};

export function CategoryManager({
  categories,
  loadError,
}: {
  categories: Category[];
  loadError?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [pending, setPending] = useState<"create" | string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const activeCategories = categories.filter((category) => !category.is_archived);
  const archivedCategories = categories.filter((category) => category.is_archived);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFeedback({ kind: "error", message: "Enter a category name." });
      return;
    }

    setPending("create");
    setFeedback(null);
    try {
      const result = await createCategory(trimmedName, type);
      setFeedback({ kind: result.success ? "success" : "error", message: result.message });
      if (result.success) {
        setName("");
        router.refresh();
      }
    } catch {
      setFeedback({ kind: "error", message: "A connection error occurred. Please try again." });
    } finally {
      setPending(null);
    }
  }

  async function handleArchive(category: Category) {
    if (pending) return;

    setPending(category.id);
    setFeedback(null);
    try {
      const result = await archiveCategory(category.id);
      setFeedback({ kind: result.success ? "success" : "error", message: result.message });
      if (result.success) router.refresh();
    } catch {
      setFeedback({ kind: "error", message: "A connection error occurred. Please try again." });
    } finally {
      setPending(null);
    }
  }

  async function handleUnarchive(category: Category) {
    if (pending) return;

    setPending(category.id);
    setFeedback(null);
    try {
      const result = await unarchiveCategory(category.id);
      setFeedback({ kind: result.success ? "success" : "error", message: result.message });
      if (result.success) router.refresh();
    } catch {
      setFeedback({ kind: "error", message: "A connection error occurred. Please try again." });
    } finally {
      setPending(null);
    }
  }

  return (
    <section aria-labelledby="categories-heading">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-emerald-700">Finance AI App</p>
        <h1 id="categories-heading" className="text-3xl font-semibold tracking-tight text-slate-950">
          Categories
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Create income and expense categories to organize your transactions.
        </p>
      </div>

      {loadError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p role="alert">{loadError}</p>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="mt-2 font-semibold underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <form onSubmit={handleCreate} className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-950">Add a category</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="category-type" className="mb-1.5 block text-sm font-medium text-slate-700">
                Category type
              </label>
              <select
                id="category-type"
                value={type}
                onChange={(event) => setType(event.target.value as "income" | "expense")}
                disabled={Boolean(pending)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label htmlFor="category-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                id="category-name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                disabled={Boolean(pending)}
                placeholder="For example, Groceries"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={Boolean(pending)}
              className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending === "create" ? "Creating…" : "Create category"}
            </button>
          </div>
        </form>

        <div className="space-y-6">
          {feedback && (
            <p
              role={feedback.kind === "error" ? "alert" : "status"}
              className={`rounded-lg px-4 py-3 text-sm ${
                feedback.kind === "error"
                  ? "border border-red-200 bg-red-50 text-red-800"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-900"
              }`}
            >
              {feedback.message}
            </p>
          )}

          {!loadError && categories.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
              <h2 className="font-semibold text-slate-900">No categories yet</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Create an income or expense category to get started.
              </p>
            </div>
          )}

          {categories.length > 0 && (
            <>
              <CategoryList
                title="Active categories"
                categories={activeCategories}
                emptyMessage="Active categories will appear here."
                pending={pending}
                onArchive={handleArchive}
              />
              <CategoryList
                title="Archived categories"
                categories={archivedCategories}
                emptyMessage="Archived categories will appear here."
                pending={pending}
                onUnarchive={handleUnarchive}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function CategoryList({
  title,
  categories,
  emptyMessage,
  pending,
  onArchive,
  onUnarchive,
}: {
  title: string;
  categories: Category[];
  emptyMessage: string;
  pending: string | null;
  onArchive?: (category: Category) => void;
  onUnarchive?: (category: Category) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {categories.length}
        </span>
      </div>
      {categories.length === 0 ? (
        <p className="py-3 text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{category.name}</p>
                <p className="mt-1 text-xs capitalize text-slate-500">{category.type}</p>
              </div>
              {(onArchive || onUnarchive) && (
                <button
                  type="button"
                  onClick={() => (onArchive ? onArchive(category) : onUnarchive?.(category))}
                  disabled={Boolean(pending)}
                  aria-label={`${onArchive ? "Archive" : "Unarchive"} ${category.name} category`}
                  className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending === category.id
                    ? onArchive
                      ? "Archiving…"
                      : "Unarchiving…"
                    : onArchive
                      ? "Archive"
                      : "Unarchive"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
