import { FileText, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * CV Tailoring placeholder. The Pro feature isn't built yet — this page
 * exists so we can route to it from the sidebar and the upgrade callouts.
 * The "Tailor my CV" button shows an alert; we'll wire it up once the
 * underlying LLM endpoint and CV upload flow exist.
 */
export default function CvTailoringPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">CV Tailoring</h1>
        <p className="text-muted-foreground">
          Adjust your CV to fit any job description in seconds — coming soon.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            How it&apos;ll work
          </CardTitle>
          <CardDescription>
            CV Tailoring is coming soon for Pro.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            <Step n={1} title="Upload your CV" body="One-time upload as PDF or DOCX." />
            <Step n={2} title="Pick a tracked job" body="Choose any job from your tracker." />
            <Step n={3} title="Tailor & download" body="LLM rewrites your CV for that job." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your base CV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Upload UI is coming soon.
            </p>
            <Button className="mt-4" disabled>
              Upload CV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="text-xs font-semibold text-muted-foreground">Step {n}</div>
      <div className="mt-1 font-medium">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{body}</div>
    </div>
  );
}
