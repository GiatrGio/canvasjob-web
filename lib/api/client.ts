"use client";

import { createClient } from "@/lib/supabase/client";
import { makeApi } from "@/lib/api/core";

async function getBrowserToken(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export const api = makeApi(getBrowserToken);
export { ApiError } from "@/lib/api/core";
