import { api } from "@/lib/api/server";
import { TrackerTable } from "@/components/tracker/tracker-table";
import { AddApplicationDialog } from "@/components/tracker/add-application-dialog";

/**
 * Tracker dashboard — the user's primary workspace. Lists every tracked job
 * (Saved → Withdrawn). Server-rendered for the initial paint; the table
 * mutates state client-side after that to keep status changes snappy.
 */
export default async function TrackerPage() {
  const items = await api.applications.list();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Every job you&apos;ve saved or applied to, in one place.
          </p>
        </div>
        <AddApplicationDialog />
      </div>
      <TrackerTable initial={items} />
    </div>
  );
}
