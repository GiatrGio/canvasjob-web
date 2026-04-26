import "server-only";

import { createClient } from "@/lib/supabase/server";
import { makeApi } from "@/lib/api/core";

async function getServerToken(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export const api = makeApi(getServerToken);
export { ApiError } from "@/lib/api/core";
