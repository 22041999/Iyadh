import { serve } from "https://deno.land/std@0.214.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1?target=deno";
import {
  EngineEvent,
  EngineResult,
  RuleSet,
  BusinessRule,
  ConditionGroup,
  EngineEventType,
  RuleTarget,
  AwardType,
  ValueType,
  evaluateRules,
} from "./engine.ts";

interface EngineRequest {
  event: EngineEvent;
  mode?: "preview" | "execute";
}

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: EngineRequest;
  try {
    body = await req.json();
  } catch (_err) {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  if (!body?.event?.type || !body.event.payload) {
    return jsonResponse({ error: "Invalid event payload" }, 400);
  }

  try {
    const ruleSet = await loadActiveRuleSet();
    const evaluation = evaluateRules(ruleSet, body.event);

    if (body.mode === "execute") {
      await persistResult(evaluation, body.event);
    }

    return jsonResponse({
      data: evaluation,
      mode: body.mode ?? "preview",
    });
  } catch (error) {
    console.error("rule-engine error", error);
    return jsonResponse({ error: "Internal error" }, 500);
  }
});

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function loadActiveRuleSet(): Promise<RuleSet> {
  const { data, error } = await supabase
    .from("business_rules")
    .select("definition")
    .eq("is_active", true)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.definition) {
    return {
      pointValue: { tndPerPoint: 0.1 },
      earnRules: [],
      referralRules: [],
      redemptionRules: [],
    };
  }

  return normalizeRuleSet(data.definition);
}

function normalizeRuleSet(definition: Record<string, unknown>): RuleSet {
  const pointValueRaw = definition["point_value"] as Record<string, unknown> | undefined;
  const earnRulesRaw = definition["earn_rules"] as Record<string, unknown>[] | undefined;
  const referralRulesRaw = definition["referral_rules"] as Record<string, unknown>[] | undefined;
  const redemptionRulesRaw = definition["redemption_rules"] as Record<string, unknown>[] | undefined;

  return {
    pointValue: {
      tndPerPoint: Number(pointValueRaw?.["tnd_per_point"] ?? 0.1),
    },
    earnRules: (earnRulesRaw ?? []).map(normalizeRule),
    referralRules: (referralRulesRaw ?? []).map(normalizeRule),
    redemptionRules: (redemptionRulesRaw ?? []).map(normalizeRule),
  };
}

function normalizeRule(rule: Record<string, unknown>): BusinessRule {
  const expression =
    (rule["expression"] as string | undefined) ??
    (rule["calculation"] as string | undefined) ??
    "0";
  const target = (rule["target"] as string | undefined) ?? "customer";
  const awardType = (rule["award_type"] as string | undefined) ?? "points";
  const valueType = (rule["value_type"] as string | undefined) ?? "points";

  return {
    id: (rule["id"] as string | undefined) ?? crypto.randomUUID(),
    event: (rule["event"] as EngineEventType | undefined) ?? "purchase.completed",
    label: (rule["label"] as string | undefined) ?? "Rule",
    expression,
    priority: Number(rule["priority"] ?? 1),
    target: target as RuleTarget,
    awardType: awardType as AwardType,
    valueType: valueType as ValueType,
    conditions: normalizeConditions(rule["conditions"] as ConditionGroup | undefined),
    metadata: (rule["metadata"] as Record<string, unknown> | undefined) ?? {},
  };
}

function normalizeConditions(group?: ConditionGroup): ConditionGroup | undefined {
  if (!group) return undefined;
  return {
    all: group.all,
    any: group.any,
  };
}

async function persistResult(result: EngineResult, event: EngineEvent) {
  if (result.ledgerEntries.length === 0 && result.discountAdjustments.length === 0) {
    return;
  }

  const source = event.type === "referral.completed" ? "referral" : "order";

  for (const entry of result.ledgerEntries) {
    const balance = await getCurrentBalance(entry.userId);
    const newBalance = balance + entry.deltaPoints;

    const { error } = await supabase.from("points_ledger").insert({
      user_id: entry.userId,
      entry_type: entry.deltaPoints >= 0 ? "earn" : "spend",
      source,
      order_id: (event.payload.order_id as string | undefined) ?? null,
      referral_id: (event.payload.referral_id as string | undefined) ?? null,
      delta: entry.deltaPoints,
      balance_after: newBalance,
      rule_snapshot: {
        ruleId: entry.ruleId,
        ruleLabel: entry.ruleLabel,
        payload: event.payload,
      },
      notes: entry.metadata?.description ?? entry.ruleLabel,
    });

    if (error) {
      throw error;
    }
  }

  await supabase.from("event_log").insert({
    event_type: event.type,
    user_id: resolvePrimaryUser(event.payload),
    payload: event.payload,
  });
}

async function getCurrentBalance(userId: string): Promise<number> {
  const { data, error } = await supabase.rpc("current_points_balance", {
    target_user: userId,
  });

  if (error) {
    throw error;
  }

  return typeof data === "number" ? data : 0;
}

function resolvePrimaryUser(payload: Record<string, unknown>): string | null {
  if (typeof payload.user_id === "string") return payload.user_id;
  if (typeof payload.referrer_id === "string") return payload.referrer_id;
  if (typeof payload.referee_id === "string") return payload.referee_id;
  return null;
}
