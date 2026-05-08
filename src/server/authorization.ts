import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getSessionUserWithRole() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { user: null, isAdmin: false, supabase };

  const { data: profile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return { user, isAdmin: Boolean(profile?.is_admin), supabase };
}
