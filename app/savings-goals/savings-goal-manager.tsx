"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { createSavingsGoal, deleteSavingsGoal, updateSavingsGoal } from "./actions";

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  remainingAmount: string;
  progressPercent: number;
  targetDate: string | null;
};

type GoalDraft = {
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
};

function formatMoney(value: string) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function SavingsGoalManager({
  goals,
  loadError,
}: {
  goals: SavingsGoal[];
  loadError?: string;
}) {
  const router = useRouter();
  const pendingRef = useRef(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [targetDate, setTargetDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<GoalDraft | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [pending, setPending] = useState<"create" | "update" | "delete" | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending("create");
    setFeedback(null);
    try {
      const result = await createSavingsGoal(name, targetAmount, currentAmount, targetDate);
      setFeedback({ kind: result.success ? "success" : "error", message: result.message });
      if (result.success) {
        setName("");
        setTargetAmount("");
        setCurrentAmount("0");
        setTargetDate("");
        router.refresh();
      }
    } catch {
      setFeedback({ kind: "error", message: "A connection error occurred. Please try again." });
    } finally {
      pendingRef.current = false;
      setPending(null);
    }
  }

  function startEditing(goal: SavingsGoal) {
    setDeleteConfirmationId(null);
    setEditingId(goal.id);
    setEditDraft({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate ?? "",
    });
    setFeedback(null);
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>, goalId: string) {
    event.preventDefault();
    if (!editDraft || pendingRef.current) return;
    pendingRef.current = true;
    setPending("update");
    setFeedback(null);
    try {
      const result = await updateSavingsGoal(
        goalId,
        editDraft.name,
        editDraft.targetAmount,
        editDraft.currentAmount,
        editDraft.targetDate,
      );
      setFeedback({ kind: result.success ? "success" : "error", message: result.message });
      if (result.success) {
        setEditingId(null);
        setEditDraft(null);
        router.refresh();
      }
    } catch {
      setFeedback({ kind: "error", message: "A connection error occurred. Please try again." });
    } finally {
      pendingRef.current = false;
      setPending(null);
    }
  }

  async function handleDelete(goalId: string) {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending("delete");
    setFeedback(null);
    try {
      const result = await deleteSavingsGoal(goalId);
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
    <section aria-labelledby="savings-goals-heading">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-emerald-700">Finance AI App</p>
        <h1 id="savings-goals-heading" className="text-3xl font-semibold tracking-tight text-slate-950">
          Savings Goals
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Track progress toward the things you are saving for.
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

      {!loadError && (
        <form onSubmit={handleCreate} className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-950">Add a savings goal</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="goal-name" className="mb-1.5 block text-sm font-medium text-slate-700">Goal name</label>
              <input
                id="goal-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                disabled={Boolean(pending)}
                placeholder="For example, Emergency fund"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
              />
            </div>
            <div>
              <label htmlFor="goal-target" className="mb-1.5 block text-sm font-medium text-slate-700">Target amount (RM)</label>
              <input
                id="goal-target"
                type="text"
                inputMode="decimal"
                value={targetAmount}
                onChange={(event) => setTargetAmount(event.target.value)}
                required
                disabled={Boolean(pending)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
              />
            </div>
            <div>
              <label htmlFor="goal-current" className="mb-1.5 block text-sm font-medium text-slate-700">Current saved amount (RM)</label>
              <input
                id="goal-current"
                type="text"
                inputMode="decimal"
                value={currentAmount}
                onChange={(event) => setCurrentAmount(event.target.value)}
                required
                disabled={Boolean(pending)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
              />
            </div>
            <div>
              <label htmlFor="goal-date" className="mb-1.5 block text-sm font-medium text-slate-700">Target date (optional)</label>
              <input
                id="goal-date"
                type="date"
                value={targetDate}
                onChange={(event) => setTargetDate(event.target.value)}
                disabled={Boolean(pending)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={Boolean(pending)}
            className="mt-4 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending === "create" ? "Saving…" : "Create goal"}
          </button>
        </form>
      )}

      {!loadError && goals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          <h2 className="font-semibold text-slate-900">No savings goals yet</h2>
          <p className="mt-2 text-sm text-slate-500">Create a goal above to track your progress.</p>
        </div>
      ) : !loadError ? (
        <div className="space-y-4">
          {goals.map((goal) => (
            <article key={goal.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words text-lg font-semibold text-slate-950">{goal.name}</h2>
                  {goal.targetDate ? (
                    <p className="mt-1 text-sm text-slate-500">Target date: {formatDate(goal.targetDate)}</p>
                  ) : (
                    <p className="mt-1 text-sm text-slate-500">No target date</p>
                  )}
                </div>
                {editingId !== goal.id && deleteConfirmationId !== goal.id && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(goal)}
                      disabled={Boolean(pending)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditingId(null); setEditDraft(null); setDeleteConfirmationId(goal.id); setFeedback(null); }}
                      disabled={Boolean(pending)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {editingId === goal.id && editDraft ? (
                <form onSubmit={(event) => handleUpdate(event, goal.id)} className="mt-5">
                  <GoalFields
                    prefix={`edit-${goal.id}`}
                    draft={editDraft}
                    disabled={Boolean(pending)}
                    onChange={setEditDraft}
                  />
                  <div className="mt-4 flex gap-2">
                    <button type="submit" disabled={Boolean(pending)} className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
                      {pending === "update" ? "Saving…" : "Save changes"}
                    </button>
                    <button type="button" onClick={() => { setEditingId(null); setEditDraft(null); }} disabled={Boolean(pending)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-60">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : deleteConfirmationId === goal.id ? (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-900">Delete this savings goal?</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(goal.id)}
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
                <div className="mt-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                    <p className="font-medium text-slate-800">
                      {formatMoney(goal.currentAmount)} saved of {formatMoney(goal.targetAmount)}
                    </p>
                    <p className="text-slate-600">{goal.progressPercent}%</p>
                  </div>
                  <div
                    className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-label={`${goal.name} progress`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={goal.progressPercent}
                  >
                    <div className="h-full rounded-full bg-emerald-600" style={{ width: `${goal.progressPercent}%` }} />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    Remaining: <span className="font-semibold text-slate-900">{formatMoney(goal.remainingAmount)}</span>
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function GoalFields({
  prefix,
  draft,
  disabled,
  onChange,
}: {
  prefix: string;
  draft: GoalDraft;
  disabled: boolean;
  onChange: (draft: GoalDraft) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor={`${prefix}-name`} className="mb-1.5 block text-sm font-medium text-slate-700">Goal name</label>
        <input
          id={`${prefix}-name`}
          type="text"
          value={draft.name}
          onChange={(event) => onChange({ ...draft, name: event.target.value })}
          required
          disabled={disabled}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
        />
      </div>
      <div>
        <label htmlFor={`${prefix}-target`} className="mb-1.5 block text-sm font-medium text-slate-700">Target amount (RM)</label>
        <input
          id={`${prefix}-target`}
          type="text"
          inputMode="decimal"
          value={draft.targetAmount}
          onChange={(event) => onChange({ ...draft, targetAmount: event.target.value })}
          required
          disabled={disabled}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
        />
      </div>
      <div>
        <label htmlFor={`${prefix}-current`} className="mb-1.5 block text-sm font-medium text-slate-700">Current saved amount (RM)</label>
        <input
          id={`${prefix}-current`}
          type="text"
          inputMode="decimal"
          value={draft.currentAmount}
          onChange={(event) => onChange({ ...draft, currentAmount: event.target.value })}
          required
          disabled={disabled}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
        />
      </div>
      <div>
        <label htmlFor={`${prefix}-date`} className="mb-1.5 block text-sm font-medium text-slate-700">Target date (optional)</label>
        <input
          id={`${prefix}-date`}
          type="date"
          value={draft.targetDate}
          onChange={(event) => onChange({ ...draft, targetDate: event.target.value })}
          disabled={disabled}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
        />
      </div>
    </div>
  );
}
