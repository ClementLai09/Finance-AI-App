"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { createTransaction, deleteTransaction, updateTransaction } from "./actions";
import { canSelectCategory } from "../../lib/finance/categories";
import { formatMoney } from "../../lib/finance/decimal";
import { parsePositiveAmount } from "../../lib/finance/transactions";

export type Transaction = {
  id: string;
  type: "income" | "expense";
  amount_text: string;
  category_id: string;
  date: string;
  notes: string | null;
  created_at: string;
};

export type CategoryOption = {
  id: string;
  name: string;
  type: "income" | "expense";
  is_archived: boolean;
};

type EditDraft = {
  type: "income" | "expense";
  amount: string;
  categoryId: string;
  date: string;
  notes: string;
};

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isPositiveAmount(value: string) {
  return parsePositiveAmount(value) !== null;
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function TransactionManager({
  transactions,
  categories,
  transactionsError,
  categoriesError,
}: {
  transactions: Transaction[];
  categories: CategoryOption[];
  transactionsError?: string;
  categoriesError?: string;
}) {
  const router = useRouter();
  const pendingRef = useRef(false);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [pendingMutation, setPendingMutation] = useState<"create" | "edit" | "delete" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const isMutationPending = pendingMutation !== null;

  useEffect(() => {
    setDate(getLocalDate());
  }, []);

  const activeCategories = categories.filter(
    (category) => canSelectCategory(category, type),
  );
  const categoriesById = new Map(categories.map((category) => [category.id, category]));

  function handleTypeChange(nextType: "income" | "expense") {
    setType(nextType);
    setCategoryId("");
  }

  function startEditing(transaction: Transaction) {
    const category = categoriesById.get(transaction.category_id);
    setEditingId(transaction.id);
    setDeleteConfirmationId(null);
    setEditDraft({
      type: transaction.type,
      amount: transaction.amount_text,
      categoryId: category?.is_archived ? "" : transaction.category_id,
      date: transaction.date,
      notes: transaction.notes ?? "",
    });
    setFeedback(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditDraft(null);
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>, transaction: Transaction) {
    event.preventDefault();
    if (!editDraft || pendingRef.current) return;

    if (!isPositiveAmount(editDraft.amount)) {
      setFeedback({ kind: "error", message: "Enter an amount greater than zero." });
      return;
    }

    const originalCategory = categoriesById.get(transaction.category_id);
    const keepingArchivedCategory = Boolean(
      originalCategory?.is_archived && editDraft.type === transaction.type && !editDraft.categoryId,
    );
    const nextCategoryId = editDraft.categoryId || (keepingArchivedCategory ? transaction.category_id : "");
    if (!nextCategoryId) {
      setFeedback({ kind: "error", message: "Choose a category that matches the transaction type." });
      return;
    }
    if (!editDraft.date) {
      setFeedback({ kind: "error", message: "Choose a transaction date." });
      return;
    }

    pendingRef.current = true;
    setPendingMutation("edit");
    setFeedback(null);
    try {
      const result = await updateTransaction(
        transaction.id,
        editDraft.type,
        editDraft.amount,
        nextCategoryId,
        editDraft.date,
        editDraft.notes,
      );
      setFeedback({ kind: result.success ? "success" : "error", message: result.message });
      if (result.success) {
        cancelEditing();
        router.refresh();
      }
    } catch {
      setFeedback({ kind: "error", message: "A connection error occurred. Please try again." });
    } finally {
      pendingRef.current = false;
      setPendingMutation(null);
    }
  }

  async function handleDelete(transaction: Transaction) {
    if (pendingRef.current) return;

    pendingRef.current = true;
    setPendingMutation("delete");
    setFeedback(null);
    try {
      const result = await deleteTransaction(transaction.id);
      setFeedback({ kind: result.success ? "success" : "error", message: result.message });
      if (result.success) {
        setDeleteConfirmationId(null);
        router.refresh();
      }
    } catch {
      setFeedback({ kind: "error", message: "A connection error occurred. Please try again." });
    } finally {
      pendingRef.current = false;
      setPendingMutation(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;

    if (!isPositiveAmount(amount)) {
      setFeedback({ kind: "error", message: "Enter an amount greater than zero." });
      return;
    }
    if (!categoryId) {
      setFeedback({ kind: "error", message: "Choose a category." });
      return;
    }
    if (!date) {
      setFeedback({ kind: "error", message: "Choose a transaction date." });
      return;
    }

    pendingRef.current = true;
    setPendingMutation("create");
    setFeedback(null);

    try {
      const result = await createTransaction(type, amount, categoryId, date, notes);
      setFeedback({ kind: result.success ? "success" : "error", message: result.message });
      if (result.success) {
        setAmount("");
        setCategoryId("");
        setNotes("");
        setDate(getLocalDate());
        router.refresh();
      }
    } catch {
      setFeedback({ kind: "error", message: "A connection error occurred. Please try again." });
    } finally {
      pendingRef.current = false;
      setPendingMutation(null);
    }
  }

  return (
    <section aria-labelledby="transactions-heading">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-emerald-700">Finance AI App</p>
        <h1 id="transactions-heading" className="text-3xl font-semibold tracking-tight text-slate-950">
          Transactions
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Record income and expenses and review your recent activity.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-950">Add a transaction</h2>

          <fieldset className="mt-5" disabled={isMutationPending}>
            <legend className="mb-2 block text-sm font-medium text-slate-700">Type</legend>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange("expense")}
                aria-pressed={type === "expense"}
                className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                  type === "expense"
                    ? "border-rose-700 bg-rose-50 text-rose-800"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("income")}
                aria-pressed={type === "income"}
                className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                  type === "income"
                    ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Income
              </button>
            </div>
          </fieldset>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="transaction-amount" className="mb-1.5 block text-sm font-medium text-slate-700">
                Amount (RM)
              </label>
              <input
                id="transaction-amount"
                name="amount"
                type="text"
                inputMode="decimal"
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                disabled={isMutationPending}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="transaction-category" className="mb-1.5 block text-sm font-medium text-slate-700">
                {type === "income" ? "Income category" : "Expense category"}
              </label>
              <select
                id="transaction-category"
                name="category_id"
                required
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                disabled={isMutationPending || Boolean(categoriesError) || activeCategories.length === 0}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
              >
                <option value="">Choose a category</option>
                {activeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categoriesError ? (
                <p role="alert" className="mt-1.5 text-xs text-red-700">{categoriesError}</p>
              ) : activeCategories.length === 0 ? (
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  No active {type} categories. <Link href="/categories" className="font-semibold text-emerald-800 underline">Create one in Categories</Link>.
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="transaction-date" className="mb-1.5 block text-sm font-medium text-slate-700">
                Date
              </label>
              <input
                id="transaction-date"
                name="date"
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
                disabled={isMutationPending}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="transaction-notes" className="mb-1.5 block text-sm font-medium text-slate-700">
                Notes <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                id="transaction-notes"
                name="notes"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={isMutationPending}
                className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={isMutationPending || Boolean(categoriesError) || activeCategories.length === 0 || !date}
              className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pendingMutation === "create" ? "Saving…" : `Add ${type}`}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {transactionsError && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {transactionsError}
              <button type="button" onClick={() => router.refresh()} className="ml-2 font-semibold underline">
                Try again
              </button>
            </p>
          )}
          {feedback && (
            <p
              role={feedback.kind === "error" ? "alert" : "status"}
              className={`rounded-lg border px-4 py-3 text-sm ${
                feedback.kind === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-900"
              }`}
            >
              {feedback.message}
            </p>
          )}

          <section aria-labelledby="transaction-list-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="transaction-list-heading" className="text-lg font-semibold text-slate-950">
                Recent transactions
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {transactions.length}
              </span>
            </div>

            {transactionsError ? null : transactions.length === 0 ? (
              <p className="py-8 text-center text-sm leading-6 text-slate-500">
                No transactions yet. Add your first income or expense using the form.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {transactions.map((transaction) => {
                  const category = categoriesById.get(transaction.category_id);
                  const isIncome = transaction.type === "income";
                  const isEditing = editingId === transaction.id && editDraft !== null;
                  const canKeepArchivedCategory = Boolean(
                    category?.is_archived && editDraft?.type === transaction.type && !editDraft.categoryId,
                  );
                  const editCategories = isEditing
                    ? categories.filter((option) => !option.is_archived && option.type === editDraft.type)
                    : [];
                  const editCategoryValue = editCategories.some((option) => option.id === editDraft?.categoryId)
                    ? editDraft?.categoryId ?? ""
                    : "";

                  return (
                    <li key={transaction.id} className="py-4 first:pt-0 last:pb-0">
                      {isEditing && editDraft ? (
                        <form onSubmit={(event) => handleUpdate(event, transaction)} className="space-y-4 rounded-xl bg-slate-50 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">Edit transaction</p>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              disabled={isMutationPending}
                              className="text-sm font-medium text-slate-600 underline underline-offset-2 disabled:opacity-60"
                            >
                              Cancel
                            </button>
                          </div>

                          <fieldset disabled={isMutationPending}>
                            <legend className="mb-2 text-xs font-medium text-slate-600">Type</legend>
                            <div className="grid grid-cols-2 gap-2">
                              {(["expense", "income"] as const).map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  aria-pressed={editDraft.type === option}
                                  onClick={() => {
                                    if (editDraft.type !== option) {
                                      setEditDraft({ ...editDraft, type: option, categoryId: "" });
                                    }
                                  }}
                                  className={`rounded-lg border px-3 py-2 text-sm font-semibold capitalize ${
                                    editDraft.type === option
                                      ? option === "income"
                                        ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                                        : "border-rose-700 bg-rose-50 text-rose-800"
                                      : "border-slate-200 bg-white text-slate-600"
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </fieldset>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label htmlFor={`edit-amount-${transaction.id}`} className="mb-1.5 block text-xs font-medium text-slate-600">
                                Amount (RM)
                              </label>
                              <input
                                id={`edit-amount-${transaction.id}`}
                                type="text"
                                inputMode="decimal"
                                required
                                value={editDraft.amount}
                                onChange={(event) => setEditDraft({ ...editDraft, amount: event.target.value })}
                                disabled={isMutationPending}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
                              />
                            </div>
                            <div>
                              <label htmlFor={`edit-date-${transaction.id}`} className="mb-1.5 block text-xs font-medium text-slate-600">
                                Date
                              </label>
                              <input
                                id={`edit-date-${transaction.id}`}
                                type="date"
                                required
                                value={editDraft.date}
                                onChange={(event) => setEditDraft({ ...editDraft, date: event.target.value })}
                                disabled={isMutationPending}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor={`edit-category-${transaction.id}`} className="mb-1.5 block text-xs font-medium text-slate-600">
                              {editDraft.type === "income" ? "Income category" : "Expense category"}
                            </label>
                            {category?.is_archived && (
                              <p className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                                Current category: <strong>{category.name}</strong> (archived). Keep it for this transaction or choose an active replacement.
                              </p>
                            )}
                            <select
                              id={`edit-category-${transaction.id}`}
                              required={!canKeepArchivedCategory}
                              value={editCategoryValue}
                              onChange={(event) => setEditDraft({ ...editDraft, categoryId: event.target.value })}
                              disabled={isMutationPending || Boolean(categoriesError)}
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
                            >
                              <option value="">
                                {canKeepArchivedCategory ? "Keep current archived category" : "Choose an active category"}
                              </option>
                              {editCategories.map((option) => (
                                <option key={option.id} value={option.id}>{option.name}</option>
                              ))}
                            </select>
                            {categoriesError && <p role="alert" className="mt-1 text-xs text-red-700">{categoriesError}</p>}
                          </div>

                          <div>
                            <label htmlFor={`edit-notes-${transaction.id}`} className="mb-1.5 block text-xs font-medium text-slate-600">
                              Notes (optional)
                            </label>
                            <textarea
                              id={`edit-notes-${transaction.id}`}
                              rows={2}
                              value={editDraft.notes}
                              onChange={(event) => setEditDraft({ ...editDraft, notes: event.target.value })}
                              disabled={isMutationPending}
                              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isMutationPending || Boolean(categoriesError) || (!canKeepArchivedCategory && editCategories.length === 0)}
                            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {pendingMutation === "edit" ? "Saving changes…" : "Save changes"}
                          </button>
                        </form>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                    isIncome ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                                  }`}
                                >
                                  {isIncome ? "Income" : "Expense"}
                                </span>
                                <span className="truncate text-sm font-semibold text-slate-900">
                                  {category?.name ?? "Category unavailable"}
                                </span>
                              </div>
                              <p className="mt-2 text-xs text-slate-500">{formatDate(transaction.date)}</p>
                              {transaction.notes && (
                                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-5 text-slate-600">
                                  {transaction.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-3">
                              <p className={`text-sm font-semibold ${isIncome ? "text-emerald-800" : "text-slate-900"}`}>
                                {formatMoney(transaction.amount_text)}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditing(transaction)}
                                  disabled={isMutationPending}
                                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    cancelEditing();
                                    setDeleteConfirmationId(transaction.id);
                                    setFeedback(null);
                                  }}
                                  disabled={isMutationPending}
                                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                          {deleteConfirmationId === transaction.id && (
                            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
                              <p className="text-sm text-rose-900">Delete this transaction? This action cannot be undone.</p>
                              <div className="mt-3 flex justify-end gap-2 sm:mt-0">
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmationId(null)}
                                  disabled={isMutationPending}
                                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-60"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(transaction)}
                                  disabled={isMutationPending}
                                  className="rounded-lg bg-rose-700 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {pendingMutation === "delete" ? "Deleting…" : "Confirm delete"}
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
