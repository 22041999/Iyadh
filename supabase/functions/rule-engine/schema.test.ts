import { assertEquals, assertThrows } from "https://deno.land/std@0.214.0/testing/asserts.ts";
import { parseRuleSetDefinition } from "./schema.ts";

Deno.test("parseRuleSetDefinition returns defaults when missing", () => {
  const result = parseRuleSetDefinition(undefined);
  assertEquals(result.pointValue.tndPerPoint, 0.1);
  assertEquals(result.earnRules.length, 0);
});

Deno.test("parseRuleSetDefinition validates expressions", () => {
  assertThrows(() =>
    parseRuleSetDefinition({
      earn_rules: [
        {
          label: "Invalid",
        },
      ],
    })
  );
});

Deno.test("parseRuleSetDefinition normalizes snake + camel case", () => {
  const result = parseRuleSetDefinition({
    point_value: { tnd_per_point: 0.2 },
    referral_rules: [
      {
        label: "referral",
        calculation: "order_total * 0.1",
        target: "referrer",
        event: "referral.completed",
      },
    ],
  });

  assertEquals(result.pointValue.tndPerPoint, 0.2);
  assertEquals(result.referralRules[0].expression, "order_total * 0.1");
  assertEquals(result.referralRules[0].target, "referrer");
});
