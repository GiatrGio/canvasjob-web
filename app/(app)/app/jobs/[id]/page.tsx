import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api, ApiError } from "@/lib/api/server";
import { JobDetail } from "@/components/tracker/job-detail";
import { Button } from "@/components/ui/button";

/**
 * Source-agnostic individual job page. Renders fields the same way regardless
 * of where the job came from (LinkedIn, Indeed, manual, …); only the "Open
 * on <source>" link adapts.
 */
export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const application = await api.applications.get(id);
    return (
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/app">
            <ArrowLeft className="h-4 w-4" />
            Back to tracker
          </Link>
        </Button>
        <JobDetail application={application} />
      </div>
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }
}
