import { NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { projectionWriteSchema } from "@/server/validators";

const MAX_PROJECTIONS = 5;

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/connexion", request.url));

  const formData = await request.formData();
  const parsed = projectionWriteSchema.safeParse({
    conditionText: formData.get("conditionText"),
    actionText: formData.get("actionText")
  });
  if (!parsed.success) {
    log("warn", "projection_validation_failed", { errors: parsed.error.flatten() });
    return NextResponse.redirect(new URL("/objectifs?error=validation", request.url));
  }

  const { count, error: countError } = await supabase
    .from("projections")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (countError) {
    log("error", "projection_count_failed", { reason: countError.message });
    return NextResponse.redirect(new URL("/objectifs?error=server", request.url));
  }

  if ((count ?? 0) >= MAX_PROJECTIONS) {
    return NextResponse.redirect(new URL("/objectifs?error=limit", request.url));
  }

  const { error } = await supabase.from("projections").insert({
    user_id: user.id,
    condition_text: parsed.data.conditionText,
    action_text: parsed.data.actionText
  });
  if (error) {
    log("warn", "projection_insert_failed", { reason: error.message });
    return NextResponse.redirect(new URL("/objectifs?error=server", request.url));
  }

  log("info", "projection_created", { userId: user.id });
  return NextResponse.redirect(new URL("/objectifs", request.url));
}
