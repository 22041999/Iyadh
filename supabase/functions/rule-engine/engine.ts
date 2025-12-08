import { Parser, type Value } from "https://esm.sh/expr-eval@2.0.2";

export type EngineEventType = "purchase.completed" | "referral.completed" | "order.refunded";

export interface EngineEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  type: EngineEventType;
  payload: TPayload;
}

export interface Condition {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "includes";
  value?: unknown;
}

export interface ConditionGroup {
  all?: Condition[];
  any?: Condition[];
}

export type RuleTarget = "customer" | "referrer" | "referee" | "manual";
export type AwardType = "points" | "discount";
export type ValueType = "points" | "tnd";

export interface BusinessRule {
  id: string;
  event: EngineEventType;
  label: string;
  expression: string;
  priority: number;
  target: RuleTarget;
  awardType: AwardType;
  valueType?: ValueType;
  conditions?: ConditionGroup;
  metadata?: Record<string, unknown>;
}

export interface PointValueConfig {
  tndPerPoint: number;
}

export interface RuleSet {
  pointValue: PointValueConfig;
  earnRules: BusinessRule[];
  referralRules: BusinessRule[];
  redemptionRules: BusinessRule[];
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

export interface EngineResult {
  ledgerEntries: LedgerEntryInstruction[];
  discountAdjustments: DiscountAdjustment[];
}

const parser = new Parser({
  operators: {
    add: true,
    concatenate: true,
    conditional: true,
    divide: true,
    factorial: false,
    multiply: true,
    power: true,
    remainder: true,
    subtract: true,
  },
});

export function evaluateRules(ruleSet: RuleSet, event: EngineEvent): EngineResult {
  const rules = selectRulesForEvent(ruleSet, event.type);
  const entries: LedgerEntryInstruction[] = [];
  const discounts: DiscountAdjustment[] = [];

  for (const rule of rules) {
    if (!matchesConditions(rule.conditions, event.payload)) continue;

    const evaluationContext = { ...event.payload };
    const computed = evaluateExpression(rule.expression, evaluationContext);
    if (typeof computed !== "number" || Number.isNaN(computed)) {
      continue;
    }

    if (rule.awardType === "points") {
      const userId = resolveTargetUser(rule.target, event.payload);
      if (!userId) continue;

      const points = convertToPoints(computed, rule.valueType, ruleSet.pointValue);
      if (points === 0) continue;

      entries.push({
        userId,
        deltaPoints: Math.round(points),
        ruleId: rule.id,
        ruleLabel: rule.label,
        metadata: rule.metadata,
      });
    } else if (rule.awardType === "discount") {
      const userId = resolveTargetUser(rule.target, event.payload);
      if (!userId) continue;

      discounts.push({
        userId,
        amountTnd: Math.round((computed + Number.EPSILON) * 100) / 100,
        ruleId: rule.id,
        ruleLabel: rule.label,
        metadata: rule.metadata,
      });
    }
  }

  return { ledgerEntries: entries, discountAdjustments: discounts };
}

function selectRulesForEvent(ruleSet: RuleSet, eventType: EngineEventType): BusinessRule[] {
  const pools: BusinessRule[] = [];
  if (eventType === "purchase.completed") {
    pools.push(...(ruleSet.earnRules ?? []));
  } else if (eventType === "referral.completed") {
    pools.push(...(ruleSet.referralRules ?? []));
  } else {
    pools.push(...(ruleSet.redemptionRules ?? []));
  }
  return pools.filter((rule) => rule.event === eventType).sort((a, b) => a.priority - b.priority);
}

function evaluateExpression(expression: string, context: Record<string, unknown>): number {
  try {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(context)) {
      if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
        sanitized[key] = value;
      } else if (value === null) {
        sanitized[key] = null;
      }
    }
    return parser.parse(expression).evaluate(sanitized as Record<string, Value>);
  } catch (_err) {
    return 0;
  }
}

function matchesConditions(conditions: ConditionGroup | undefined, payload: Record<string, unknown>): boolean {
  if (!conditions) return true;

  if (conditions.all) {
    const allOk = conditions.all.every((condition) => compareCondition(condition, payload));
    if (!allOk) return false;
  }

  if (conditions.any) {
    const anyOk = conditions.any.some((condition) => compareCondition(condition, payload));
    if (!anyOk) return false;
  }

  return true;
}

function compareCondition(condition: Condition, payload: Record<string, unknown>): boolean {
  const value = payload[condition.field];
  const target = condition.value;

  switch (condition.operator) {
    case "eq":
      return value === target;
    case "neq":
      return value !== target;
    case "gt":
      return typeof value === "number" && typeof target === "number" && value > target;
    case "gte":
      return typeof value === "number" && typeof target === "number" && value >= target;
    case "lt":
      return typeof value === "number" && typeof target === "number" && value < target;
    case "lte":
      return typeof value === "number" && typeof target === "number" && value <= target;
    case "includes":
      return Array.isArray(value) ? value.includes(target) : false;
    default:
      return false;
  }
}

function resolveTargetUser(target: RuleTarget, payload: Record<string, unknown>): string | null {
  if (target === "customer" && typeof payload.user_id === "string") return payload.user_id;
  if (target === "referrer" && typeof payload.referrer_id === "string") return payload.referrer_id;
  if (target === "referee" && typeof payload.referee_id === "string") return payload.referee_id;
  if (target === "manual" && typeof payload.target_user_id === "string") return payload.target_user_id;
  return null;
}

function convertToPoints(value: number, valueType: ValueType | undefined, config: PointValueConfig): number {
  if (valueType === "tnd") {
    if (!config.tndPerPoint || config.tndPerPoint <= 0) return 0;
    return value / config.tndPerPoint;
  }
  return value;
}
