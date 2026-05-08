import { NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { calendarNoteSchema } from "@/server/validators";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/connexion", request.url));

  const formData = await request.formData();
  const parsed = calendarNoteSchema.safeParse({
    date: formData.get("date"),
    note: formData.get("note")
  });
  if (!parsed.success) {
    log("warn", "calendar_note_validation_failed", {
      errors: parsed.error.flatten()
    });
    return NextResponse.json(
      { error: "Invalid calendar note payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await supabase.from("calendar_notes").insert({
    user_id: user.id,
    date: parsed.data.date,
    note: parsed.data.note
  });
  log("info", "calendar_note_inserted", { userId: user.id, date: parsed.data.date });

  const ym = parsed.data.date.slice(0, 7);
  return NextResponse.redirect(
    new URL(`/calendrier?m=${ym}&detail=${encodeURIComponent(parsed.data.date)}`, request.url)
  );
}
