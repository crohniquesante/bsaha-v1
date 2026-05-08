"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signConsentAction(formData: FormData) {
  const accepted = formData.get("accepted") === "on";
  if (!accepted) return;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const ipAddress = (await headers()).get("x-forwarded-for") ?? "unknown";
  await supabase
    .from("users")
    .update({ consent_signed_at: new Date().toISOString(), consent_ip_address: ipAddress })
    .eq("id", user.id);

  redirect("/dashboard");
}
