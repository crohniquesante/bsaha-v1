import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let adminClient: SupabaseClient | null = null;

function getSupabaseAdminClient(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return adminClient;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, _receiver): unknown {
    const client = getSupabaseAdminClient();
    const value = Reflect.get(client as unknown as object, prop, client);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  }
}) as SupabaseClient;
