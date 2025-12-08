import { assertEquals } from "https://deno.land/std@0.214.0/testing/asserts.ts";
import { evaluateRules, EngineEvent, RuleSet } from "./engine.ts";

const baseRules: RuleSet = {
  pointValue: {
    tndPerPoint: 0.1,
  },
  earnRules: [
    {
      id: "purchase-base",
      event: "purchase.completed",
      label: "Base earn",
      expression: "subtotal_tnd * 0.1",
      target: "customer",
      awardType: "points",
      priority: 1,
      conditions: {},
    },
  ],
  referralRules: [
    {
      id: "referrer-bonus",
      event: "referral.completed",
      label: "Referrer bonus",
      expression: "order_total * 0.15",
      target: "referrer",
      awardType: "points",
      priority: 1,
      conditions: {},
    },
    {
      id: "referee-bonus",
      event: "referral.completed",
      label: "Referee bonus",
      expression: "order_total * 0.05",
      target: "referee",
      awardType: "points",
      priority: 1,
      conditions: {},
    },
  ],
  redemptionRules: [],
};

Deno.test("purchase event computes point entries", () => {
  const event: EngineEvent = {
    type: "purchase.completed",
    payload: {
      user_id: "user-1",
      subtotal_tnd: 200,
    },
  };

  const result = evaluateRules(baseRules, event);

  assertEquals(result.ledgerEntries.length, 1);
  assertEquals(result.ledgerEntries[0].deltaPoints, 20);
  assertEquals(result.ledgerEntries[0].userId, "user-1");
});

Deno.test("referral completed rewards both parties", () => {
  const event: EngineEvent = {
    type: "referral.completed",
    payload: {
      referrer_id: "ref-123",
      referee_id: "ref-456",
      order_total: 100,
    },
  };

  const result = evaluateRules(baseRules, event);

  assertEquals(result.ledgerEntries.length, 2);
  const referrer = result.ledgerEntries.find((entry) => entry.userId === "ref-123");
  const referee = result.ledgerEntries.find((entry) => entry.userId === "ref-456");

  assertEquals(referrer?.deltaPoints, 15);
  assertEquals(referee?.deltaPoints, 5);
});
