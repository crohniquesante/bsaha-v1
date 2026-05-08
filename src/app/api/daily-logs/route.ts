import { NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildDailyLogConflictKey } from "@/server/rules";
import { dailyLogSchema } from "@/server/validators";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(new URL("/connexion", request.url));

  const formData = await request.formData();
  const parsed = dailyLogSchema.safeParse({
    date: formData.get("date"),
    bristolType: formData.get("bristolType"),
    stoolCount: formData.get("stoolCount"),
    painLevel: formData.get("painLevel"),
    fatigue: formData.get("fatigue"),
    mood: formData.get("mood"),
    note: formData.get("note")
  });

  if (!parsed.success) {
    log("warn", "daily_log_validation_failed", {
      errors: parsed.error.flatten()
    });
    return NextResponse.json(
      { error: "Invalid daily log payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const payload = {
    user_id: user.id,
    date: parsed.data.date,
    bristol_type: parsed.data.bristolType,
    stool_count: parsed.data.stoolCount,
    pain_level: parsed.data.painLevel,
    fatigue: parsed.data.fatigue,
    mood: parsed.data.mood,
    note: parsed.data.note
  };

  await supabase.from("daily_logs").upsert(payload, {
    onConflict: buildDailyLogConflictKey()
  });
  log("info", "daily_log_upserted", { userId: user.id, date: payload.date });
  return NextResponse.redirect(new URL("/suivi", request.url));
}
