import type { Metadata } from "next";
import Link from "next/link";
import { CanvasjobLogo } from "@/components/brand/canvasjob-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Could not open canvasjob",
  referrer: "no-referrer",
};

type ErrorPageProps = {
  searchParams?: Promise<{ reason?: string | string[] }>;
};

export default async function ExtensionHandoffErrorPage({ searchParams }: ErrorPageProps) {
  const params = await searchParams;
  const reason = Array.isArray(params?.reason) ? params.reason[0] : params?.reason;
  const expired = reason === "expired";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex">
            <CanvasjobLogo markClassName="h-8 w-8" textClassName="text-xl" />
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{expired ? "This link has expired" : "We couldn’t connect the extension"}</CardTitle>
            <CardDescription>
              {expired
                ? "Return to the canvasjob extension and select Open in dashboard again."
                : "Please try opening the dashboard from the extension again."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login?next=%2Fapp">Sign in manually</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
