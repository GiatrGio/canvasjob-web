import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, type ApplicationStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <Badge variant={status}>{STATUS_LABELS[status]}</Badge>;
}
