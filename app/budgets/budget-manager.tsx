"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { createBudget, deleteBudget, updateBudgetAmount } from "./actions";

export type BudgetCategory = {
  id: string;
  name: string;
  type: "income" | "expense";
  is_archived: boolean;
};

export type BudgetItem = {
  id: string;
  categoryId: string;
  categoryName: string;
  isCategoryArchived: boolean;
  budgetAmount: string;
  spentAmount: string;
  remainingAmount: string;
  overspentAmount: string | null;
};

type Feedback = { kind: "success" | "error"; message: string };

function formatMoney(value: string) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function BudgetManager({
  monthLabel,
  budgets,
  availableCategories,
  loadError,
}: {
  monthLabel: string;
  budgets: BudgetItem[];
  availableCategories: BudgetCategory[];
  loadError?: string;
}) {
  const router = useRouter();
  const pendingRef = useRef(false);
  const [categoryId, setCategoryId] = useState(availableCategories[0]?.id ?? "");
  const [newAmount, setNewAmount] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [pending, setPending] = useState<"create" | "update" | "delete" | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending("create");
    setFeedback(null);
    try {
      const result = await createBudget(categoryId, newAmount);
      setFeedback({ kind: result.success ? "success" : "error", message: result.message });
      if (result.success) {
        setNewAmount("");
        router.refresh();
      }
    } catch {
      setFeedback({ kind: "error", message: "A connection error occurred. Please try again." });
    } finally {
      pendingRef.current = false;
      setPending(null);
    }
  }

  function startEditing(budget: BudgetItem) {
    setDeleteConfirmationId(null);
    setEditingId(budget.id);
    setEditAmount(budget.budgetAmount);
    setFeedback(null);
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>, budgetId: string) {
    event.preventDefault();
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending("update");
    setFeedback(null);
    try {
      const result = await updateBudgetAmount(budgetId, editAmount);
      setFeedback({ kind: result.success ? "success" : "error", message: result.message });
      if (result.success) {
        setEditingId(null);
        setEditAmount("");
        router.refresh();
      }
    } catch {
      setFeedback({ kind: "error", message: "A connection error occurred. Please try again." });
    } finally {
      pendingRef.current = false;
      setPending(null);
    }
  }

  async function handleDelete(budgetId: string) {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending("delete");
    setFeedback(null);
    try {
      const result = await deleteBudget(budgetId);
      setFeedback({ kind: result.success ? "success" : "error", message: result.message });
      if (result.success) {
        setDeleteConfirmationId(null);
        router.refresh();
      }
    } catch {
      setFeedback({ kind: "error", message: "A connection error occurred. Please try again." });
    } finally {
      pendingRef.current = false;
      setPending(null);
    }
  }

  return (
    <section aria-labelledby="budgets-heading">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-emerald-700">Finance AI App</p>
        <h1 id="budgets-heading" className="text-3xl font-semibold tracking-tight text-slate-950">
          Budgets
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Set expense category budgets and track spending for {monthLabel}.
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

      {feedback && (
        <p
          role={feedback.kind === "error" ? "alert" : "status"}
          className={`mb-5 rounded-lg px-4 py-3 text-sm ${
            feedback.kind === "error"
              ? "border border-red-200 bg-red-50 text-red-800"
              : "border border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
        >
          {feedback.message}
        </p>
      )}

      {availableCategories.length > 0 && !loadError && (
        <form onSubmit={handleCreate} className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-950">Set a category budget</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_auto] sm:items-end">
            <div>
              <label htmlFor="budget-category" className="mb-1.5 block text-sm font-medium text-slate-700">
                Expense category
              </label>
              <select
                id="budget-category"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                disabled={Boolean(pending)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
              >
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="budget-amount" className="mb-1.5 block text-sm font-medium text-slate-700">
                Monthly amount (RM)
              </label>
              <input
                id="budget-amount"
                type="text"
                inputMode="decimal"
                value={newAmount}
                onChange={(event) => setNewAmount(event.target.value)}
                required
                disabled={Boolean(pending)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={Boolean(pending) || !categoryId}
              className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending === "create" ? "Saving…" : "Set budget"}
            </button>
          </div>
        </form>
      )}

      {budgets.length === 0 && !loadError ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          <h2 className="font-semibold text-slate-900">No budgets for {monthLabel}</h2>
          {availableCategories.length > 0 ? (
            <p className="mt-2 text-sm text-slate-500">Set a budget above to start tracking category spending.</p>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              Create an active expense category first in{" "}
              <Link href="/categories" className="font-medium text-emerald-800 underline underline-offset-2">
                Categories
              </Link>.
            </p>
          )}
        </div>
      ) : budgets.length > 0 ? (
        <div className="space-y-4">
          {budgets.map((budget) => (
            <article key={budget.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">{budget.categoryName}</h2>
                  {budget.isCategoryArchived && (
                    <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      Archived category
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {editingId !== budget.id && deleteConfirmationId !== budget.id && (
                    <>
                      <button
                        type="button"
                        onClick={() => startEditing(budget)}
                        disabled={Boolean(pending)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                      >
                        Edit amount
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingId(null); setDeleteConfirmationId(budget.id); setFeedback(null); }}
                        disabled={Boolean(pending)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editingId === budget.id ? (
                <form onSubmit={(event) => handleUpdate(event, budget.id)} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="w-full sm:max-w-xs">
                    <label htmlFor={`edit-budget-${budget.id}`} className="mb-1.5 block text-sm font-medium text-slate-700">
                      Monthly amount (RM)
                    </label>
                    <input
                      id={`edit-budget-${budget.id}`}
                      type="text"
                      inputMode="decimal"
                      value={editAmount}
                      onChange={(event) => setEditAmount(event.target.value)}
                      required
                      disabled={Boolean(pending)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={Boolean(pending)} className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
                      {pending === "update" ? "Saving…" : "Save amount"}
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} disabled={Boolean(pending)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-60">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : deleteConfirmationId === budget.id ? (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-900">Delete this monthly budget? This will not change any transactions.</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(budget.id)}
                      disabled={Boolean(pending)}
                      className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
                    >
                      {pending === "delete" ? "Deleting…" : "Confirm delete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmationId(null)}
                      disabled={Boolean(pending)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-800 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-sm text-slate-500">Budget amount</dt>
                    <dd className="mt-1 font-semibold text-slate-900">{formatMoney(budget.budgetAmount)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Spent</dt>
                    <dd className="mt-1 font-semibold text-slate-900">{formatMoney(budget.spentAmount)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Remaining</dt>
                    <dd className={`mt-1 font-semibold ${budget.overspentAmount ? "text-red-700" : "text-emerald-800"}`}>
                      {formatMoney(budget.remainingAmount)}
                    </dd>
                  </div>
                </dl>
              )}

              {budget.overspentAmount && editingId !== budget.id && deleteConfirmationId !== budget.id && (
                <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
                  Over budget by {formatMoney(budget.overspentAmount)}.
                </p>
              )}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
