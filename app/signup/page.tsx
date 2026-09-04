import Link from "next/link";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { CanvasjobLogo } from "@/components/brand/canvasjob-logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FREE_EVALUATION_LIMIT } from "@/lib/limits";

// Google is the only way in, so this page is just the OAuth button. The
// `next` redirect is read from the query string by SocialAuthButtons and run
// through safeInternalPath there.
export default function SignupPage() {
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
            <CardDescription>
              Free forever — {FREE_EVALUATION_LIMIT} evaluations / month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SocialAuthButtons />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
