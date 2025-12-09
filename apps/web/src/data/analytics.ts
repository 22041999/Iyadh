export type DailyMetricPoint = {
  date: string;
  salesTnd: number;
  pointsIssued: number;
  pointsRedeemed: number;
};

export type ReferralLeaderboardEntry = {
  affiliate: string;
  conversions: number;
  revenueTnd: number;
};

export const weeklyMetrics: DailyMetricPoint[] = [
  { date: "Mon", salesTnd: 2400, pointsIssued: 32000, pointsRedeemed: 18000 },
  { date: "Tue", salesTnd: 1800, pointsIssued: 21000, pointsRedeemed: 14000 },
  { date: "Wed", salesTnd: 2900, pointsIssued: 36000, pointsRedeemed: 22000 },
  { date: "Thu", salesTnd: 3200, pointsIssued: 41000, pointsRedeemed: 25000 },
  { date: "Fri", salesTnd: 5100, pointsIssued: 62000, pointsRedeemed: 32000 },
  { date: "Sat", salesTnd: 6800, pointsIssued: 71000, pointsRedeemed: 35000 },
  { date: "Sun", salesTnd: 4300, pointsIssued: 48000, pointsRedeemed: 30000 },
];

export const referralLeaderboard: ReferralLeaderboardEntry[] = [
  { affiliate: "Maison Selma", conversions: 42, revenueTnd: 5600 },
  { affiliate: "Olive Collective", conversions: 35, revenueTnd: 4800 },
  { affiliate: "Bio Medina", conversions: 28, revenueTnd: 4100 },
  { affiliate: "Artemisia", conversions: 19, revenueTnd: 2800 },
];

export const liabilitySnapshot = {
  outstandingPoints: 124_500,
  liabilityTnd: 12_450,
  weekOverWeek: 0.042,
};
