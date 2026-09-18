"use client";

import { useState } from "react";
import type { Provider } from "@supabase/supabase-js";
import { Chrome, Linkedin, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { safeInternalPath } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/client";

type SocialProvider = {
  provider: Provider;
  label: string;
  icon: LucideIcon;
};

const PROVIDERS: SocialProvider[] = [
  { provider: "google", label: "Continue with Google", icon: Chrome },
  // { provider: "linkedin_oidc", label: "Continue with LinkedIn", icon: Linkedin },
];

function getRedirectPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return safeInternalPath(next);
}

export function SocialAuthButtons() {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  async function handleOAuth(provider: Provider) {
    trackAnalyticsEvent(
      window.location.pathname === "/signup" ? "sign_up_started" : "login_started",
      { method: provider },
    );
    setLoadingProvider(provider);
    const supabase = createClient();
    const redirectPath = getRedirectPath();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      redirectPath,
    )}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    if (error) {
      setLoadingProvider(null);
      toast.error(error.message);
    }
  }

  return (
    <div className="space-y-2">
      {PROVIDERS.map(({ provider, label, icon: Icon }) => (
        <Button
          key={provider}
          type="button"
          variant="outline"
          disabled={loadingProvider !== null}
          onClick={() => handleOAuth(provider)}
          className="w-full"
        >
          <Icon className="h-4 w-4" />
          {loadingProvider === provider ? "Redirecting..." : label}
        </Button>
      ))}
    </div>
  );
}
