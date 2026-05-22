import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { CanvasjobLogo } from "@/components/brand/canvasjob-logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SignupPageProps = {
  searchParams?: Promise<{ next?: string | string[] }>;
};

function getSafeNext(value: string | string[] | undefined) {
  const next = Array.isArray(value) ? value[0] : value;
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return null;
  }
  return next;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const next = getSafeNext(params?.next);
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex">
            <CanvasjobLogo markClassName="h-8 w-8" textClassName="text-xl" />
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Free forever — 50 evaluations / month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <SocialAuthButtons />
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              <span>or</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <SignupForm loginHref={loginHref} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
