export type Plan = "free" | "pro";

export function normalizePlan(plan: unknown): Plan {
  return plan === "pro" ? "pro" : "free";
}
