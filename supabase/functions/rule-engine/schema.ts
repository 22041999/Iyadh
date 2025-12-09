import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import type {
  Condition,
  AwardType,
  BusinessRule,
  ConditionGroup,
  EngineEventType,
  RuleSet,
  RuleTarget,
  ValueType,
} from "./engine.ts";

const conditionValueSchema = z.custom<Condition["value"]>(
  (val) => val !== undefined,
  { message: "value is required" },
);

const conditionSchema: z.ZodType<Condition> = z.object({
  field: z.string().min(1, "field is required"),
  operator: z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "includes"]),
  value: conditionValueSchema,
});

const conditionGroupSchema = z
  .object({
    all: z.array(conditionSchema).min(1).optional(),
    any: z.array(conditionSchema).min(1).optional(),
  })
  .refine((group) => Boolean(group.all?.length) || Boolean(group.any?.length), {
    message: "conditions must include all or any",
  })
  .optional();

const ruleEventEnum: [EngineEventType, ...EngineEventType[]] = [
  "purchase.completed",
  "referral.completed",
  "order.refunded",
];

const ruleTargetEnum: [RuleTarget, ...RuleTarget[]] = [
  "customer",
  "referrer",
  "referee",
  "manual",
];

const awardTypeEnum: [AwardType, ...AwardType[]] = ["points", "discount"];
const valueTypeEnum: [ValueType, ...ValueType[]] = ["points", "tnd"];

const baseRuleSchema = z
  .object({
    id: z.string().min(1).optional(),
    event: z.enum(ruleEventEnum).default("purchase.completed"),
    label: z.string().min(1).default("Rule"),
    expression: z.string().min(1).optional(),
    calculation: z.string().min(1).optional(),
    priority: z.number().int().nonnegative().default(1),
    target: z.enum(ruleTargetEnum).default("customer"),
    award_type: z.enum(awardTypeEnum).default("points"),
    awardType: z.enum(awardTypeEnum).optional(),
    value_type: z.enum(valueTypeEnum).default("points"),
    valueType: z.enum(valueTypeEnum).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    conditions: conditionGroupSchema,
  })
  .superRefine((rule, ctx) => {
    if (!rule.expression && !rule.calculation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "rule must include expression or calculation",
        path: ["expression"],
      });
    }
  });

const camelPointValueSchema = z.object({
  tndPerPoint: z.number().positive().optional(),
});

const snakePointValueSchema = z.object({
  tnd_per_point: z.number().positive().default(0.1),
});

const ruleSetInputSchema = z.object({
  point_value: snakePointValueSchema.optional(),
  pointValue: camelPointValueSchema.optional(),
  earn_rules: z.array(baseRuleSchema).default([]),
  referral_rules: z.array(baseRuleSchema).default([]),
  redemption_rules: z.array(baseRuleSchema).default([]),
});

type RuleInput = z.infer<typeof baseRuleSchema>;
type RuleSetInput = z.infer<typeof ruleSetInputSchema>;

type RuleCollections = Pick<RuleSet, "earnRules" | "referralRules" | "redemptionRules">;

export function parseRuleSetDefinition(definition: unknown): RuleSet {
  const parsed = ruleSetInputSchema.parse(definition ?? {});

  const pointValue = resolvePointValue(parsed);
  const collections: RuleCollections = {
    earnRules: parsed.earn_rules.map(normalizeRule),
    referralRules: parsed.referral_rules.map(normalizeRule),
    redemptionRules: parsed.redemption_rules.map(normalizeRule),
  };

  return {
    pointValue,
    ...collections,
  };
}

function resolvePointValue(parsed: RuleSetInput): RuleSet["pointValue"] {
  const snake = parsed.point_value?.tnd_per_point;
  const camel = parsed.pointValue?.tndPerPoint;
  const value = snake ?? camel ?? 0.1;

  return {
    tndPerPoint: Number(value) > 0 ? Number(value) : 0.1,
  };
}

function normalizeRule(rule: RuleInput): BusinessRule {
  const expression = rule.expression ?? rule.calculation ?? "0";
  const awardType = rule.awardType ?? rule.award_type ?? "points";
  const valueType = rule.valueType ?? rule.value_type ?? "points";

  return {
    id: rule.id ?? crypto.randomUUID(),
    event: rule.event,
    label: rule.label,
    expression,
    priority: rule.priority ?? 1,
    target: rule.target,
    awardType,
    valueType,
    conditions: rule.conditions,
    metadata: rule.metadata ?? {},
  };
}

export { conditionSchema, conditionGroupSchema, baseRuleSchema, ruleSetInputSchema };
