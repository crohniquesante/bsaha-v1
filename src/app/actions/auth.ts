"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { log } from "@/lib/logger";

export async function signInAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password"))
  });
  if (error) {
    log("warn", "signin_failed", { reason: error.message });
    redirect("/connexion?error=signin");
  }
  redirect("/dashboard");
}

export async function signUpAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password: String(formData.get("password"))
  });
  if (error) {
    log("warn", "signup_failed", { reason: error.message });
    redirect("/inscription?error=signup");
  }
  redirect("/connexion");
}

export async function resetPasswordAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    String(formData.get("email"))
  );
  if (error) {
    log("warn", "reset_password_failed", { reason: error.message });
    redirect("/connexion?error=reset");
  }
  redirect("/connexion?reset=sent");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}
