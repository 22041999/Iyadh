import { createServiceClient } from "@/lib/supabase/server";

export type RuleEngineEventType =
  | "purchase.completed"
  | "referral.completed"
  | "order.refunded";

export interface RuleEngineEvent {
  type: RuleEngineEventType;
  payload: Record<string, unknown>;
}

export interface LedgerEntryInstruction {
  userId: string;
  deltaPoints: number;
  ruleId: string;
  ruleLabel: string;
  metadata?: Record<string, unknown>;
}

export interface DiscountAdjustment {
  userId: string;
  amountTnd: number;
  ruleId: string;
  ruleLabel: string;
  metadata?: Record<string, unknown>;
}

export interface RuleEngineData {
  ledgerEntries: LedgerEntryInstruction[];
  discountAdjustments: DiscountAdjustment[];
}

export interface InvokeRuleEngineResponse {
  data: RuleEngineData;
  mode: "preview" | "execute";
}

interface InvokeOptions {
  mode?: "preview" | "execute";
  refreshRules?: boolean;
}

export async function invokeRuleEngine(
  event: RuleEngineEvent,
  options?: InvokeOptions,
): Promise<InvokeRuleEngineResponse> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.functions.invoke("rule-engine", {
    body: {
      event,
      mode: options?.mode ?? "preview",
      refreshRules: options?.refreshRules ?? false,
    },
  });

  if (error) {
    throw new Error(error.message ?? "Failed to reach rule engine");
  }

  return data as InvokeRuleEngineResponse;
}
