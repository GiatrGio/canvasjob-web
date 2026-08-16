import type { Metadata } from "next";
import Link from "next/link";
import { CanvasjobLogo } from "@/components/brand/canvasjob-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Choose canvasjob account",
  referrer: "no-referrer",
};

type ConfirmPageProps = {
  searchParams?: Promise<{ ticket?: string | string[] }>;
};

export default async function ExtensionAccountConfirmPage({ searchParams }: ConfirmPageProps) {
  const params = await searchParams;
  const rawTicket = Array.isArray(params?.ticket) ? params.ticket[0] : params?.ticket;
  const ticket =
    rawTicket && /^[A-Za-z0-9_-]{32,256}$/.test(rawTicket) ? rawTicket : null;

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
            <CardTitle>Choose which account to use</CardTitle>
            <CardDescription>
              The extension and dashboard are currently signed in with different accounts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ticket ? (
              <Button asChild className="w-full">
                <Link href={`/auth/extension?ticket=${encodeURIComponent(ticket)}&switch=1`}>
                  Continue with extension account
                </Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                This sign-in link has expired. Open the dashboard from the extension again.
              </p>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link href="/app">Keep current dashboard account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
