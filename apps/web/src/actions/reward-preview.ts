"use server";

import { invokeRuleEngine } from "@/lib/rule-engine";

export type RewardPreviewState = {
  status: "idle" | "success" | "error";
  message?: string;
  points?: number;
};

const initialState: RewardPreviewState = {
  status: "idle",
};

export async function previewRewards(
  _prevState: RewardPreviewState = initialState,
  formData?: FormData,
): Promise<RewardPreviewState> {
  void _prevState;
  const amount = Number(formData?.get("amount"));

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      status: "error",
      message: "Please enter a positive purchase amount.",
    };
  }

  try {
    const response = await invokeRuleEngine({
      type: "purchase.completed",
      payload: {
        user_id: "preview-user",
        subtotal_tnd: amount,
      },
    });

    const totalPoints = response.data.ledgerEntries.reduce(
      (sum, entry) => sum + entry.deltaPoints,
      0,
    );

    return {
      status: "success",
      points: totalPoints,
      message: `≈ ${totalPoints} pts`,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach loyalty engine.";
    return {
      status: "error",
      message,
    };
  }
}
