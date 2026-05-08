import { NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { computeVideoComplete } from "@/server/rules";
import { videoProgressSchema } from "@/server/validators";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/connexion", request.url));

  const formData = await request.formData();
  const parsed = videoProgressSchema.safeParse({
    watchedPercent: formData.get("watchedPercent"),
    videoId: formData.get("videoId"),
    personalNote: formData.get("personalNote")
  });
  if (!parsed.success) {
    log("warn", "video_progress_validation_failed", {
      errors: parsed.error.flatten()
    });
    return NextResponse.json(
      { error: "Invalid video progress payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await supabase.from("video_progress").upsert(
    {
      user_id: user.id,
      video_id: parsed.data.videoId,
      watched_percent: parsed.data.watchedPercent,
      is_complete: computeVideoComplete(parsed.data.watchedPercent),
      personal_note: parsed.data.personalNote,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id,video_id" }
  );
  log("info", "video_progress_upserted", {
    userId: user.id,
    videoId: parsed.data.videoId,
    watchedPercent: parsed.data.watchedPercent
  });

  return NextResponse.redirect(request.headers.get("referer") ?? "/videos");
}
