import { NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { projectionWriteSchema } from "@/server/validators";

const MAX_PROJECTIONS = 5;

export async function POST(request: Request) {
  const [{ createSupabaseServerClient }, { supabaseAdmin }] = await Promise.all([
    import("@/lib/supabase/server"),
    import("@/lib/supabase/admin")
  ]);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const parsed = projectionWriteSchema.safeParse({
    conditionText: formData.get("conditionText"),
    actionText: formData.get("actionText")
  });
  if (!parsed.success) {
    log("warn", "projection_validation_failed", { errors: parsed.error.flatten() });
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { count, error: countError } = await supabaseAdmin
    .from("projections")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (countError) {
    log("error", "projection_count_failed", { reason: countError.message });
    return NextResponse.json(
      {
        error: "projection_count_failed",
        message: countError.message,
        code: countError.code,
        details: countError.details,
        hint: countError.hint
      },
      { status: 500 }
    );
  }

  if ((count ?? 0) >= MAX_PROJECTIONS) {
    return NextResponse.json(
      { error: "Projection limit reached", limit: MAX_PROJECTIONS },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("projections").insert({
    user_id: user.id,
    condition_text: parsed.data.conditionText,
    action_text: parsed.data.actionText
  });
  if (error) {
    log("warn", "projection_insert_failed", { reason: error.message });
    return NextResponse.json(
      {
        error: "projection_insert_failed",
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      },
      { status: 500 }
    );
  }

  log("info", "projection_created", { userId: user.id });
  return NextResponse.redirect(new URL("/objectifs", request.url));
}
