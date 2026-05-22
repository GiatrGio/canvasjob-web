import { cn } from "@/lib/utils";

export function CanvasjobLogo({
  className,
  markClassName,
  textClassName,
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img
        src="/brand/canvasjob-mark.svg"
        alt=""
        aria-hidden="true"
        className={cn("h-7 w-7 shrink-0", markClassName)}
      />
      <span className={cn("font-semibold tracking-tight text-foreground", textClassName)}>
        canvasjob
      </span>
    </span>
  );
}
