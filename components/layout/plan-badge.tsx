import { Crown } from "lucide-react";
import Link from "next/link";
import type { Plan } from "@/lib/plan";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function PlanBadge({ plan, href }: { plan: Plan; href?: string }) {
  const pro = plan === "pro";
  const badge = (
    <Badge
      variant={pro ? "outline" : "secondary"}
      className={cn(
        "h-7 gap-1.5 whitespace-nowrap px-2.5 text-xs",
        href && "cursor-pointer",
        pro && "border-emerald-200 bg-emerald-50 text-emerald-700",
      )}
      aria-label={pro ? "Pro plan" : "Free plan"}
    >
      {pro ? <Crown className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {pro ? "Pro plan" : "Free plan"}
    </Badge>
  );

  if (href) {
    return (
      <Link href={href} aria-label={pro ? "View Pro billing" : "View pricing"}>
        {badge}
      </Link>
    );
  }

  return badge;
}
