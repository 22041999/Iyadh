"use client";

import { useActionState } from "react";
import type { RewardPreviewState } from "@/actions/reward-preview";

type RewardPreviewCardProps = {
  title: string;
  description: string;
  inputLabel: string;
  submitLabel: string;
  action: (
    prevState: RewardPreviewState,
    formData: FormData,
  ) => Promise<RewardPreviewState>;
};

const initialState: RewardPreviewState = { status: "idle" };

export default function RewardPreviewCard({
  title,
  description,
  inputLabel,
  submitLabel,
  action,
}: RewardPreviewCardProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-3xl border border-amber-100 bg-white/90 p-6 shadow-lg shadow-amber-100/50 dark:border-zinc-800 dark:bg-zinc-950/60"
    >
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-amber-600">
          {title}
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{description}</p>
      </div>
      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
        {inputLabel}
        <div className="flex rounded-2xl border border-amber-200 bg-white text-base shadow-inner focus-within:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900">
          <span className="flex items-center px-3 text-sm text-zinc-400">TND</span>
          <input
            type="number"
            name="amount"
            step="0.1"
            min="1"
            placeholder="120"
            className="w-full rounded-2xl border-0 bg-transparent px-3 py-3 text-base outline-none"
            required
          />
        </div>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Calculating…" : submitLabel}
      </button>
      {state.status !== "idle" && (
        <p
          className={
            state.status === "error"
              ? "text-sm text-red-500"
              : "text-sm font-semibold text-emerald-600"
          }
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
