import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { log } from "@/lib/logger";
import { resend } from "@/lib/resend";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { reminderWindowUtcIso } from "@/server/live-reminders";

export async function GET(request: Request) {
  const secret = env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fromIso, toIso } = reminderWindowUtcIso();

  const { data: lives, error: livesError } = await supabaseAdmin
    .from("lives")
    .select("id,title,scheduled_at,meeting_url,theme")
    .gte("scheduled_at", fromIso)
    .lte("scheduled_at", toIso);

  if (livesError) {
    log("error", "cron_lives_query_failed", { reason: livesError.message });
    return NextResponse.json({ error: livesError.message }, { status: 500 });
  }

  const { data: members } = await supabaseAdmin
    .from("users")
    .select("email")
    .eq("access_active", true)
    .not("consent_signed_at", "is", null);

  const recipients = [...new Set((members ?? []).map((m) => m.email).filter(Boolean))];

  let sentLives = 0;
  let emailsSent = 0;

  for (const live of lives ?? []) {
    const { error: lockErr } = await supabaseAdmin.from("live_reminders").insert({ live_id: live.id });
    const lockCode = lockErr ? (lockErr as { code?: string }).code : undefined;
    if (lockErr && lockCode === "23505") continue;
    if (lockErr) {
      log("error", "live_reminder_lock_failed", { liveId: live.id, reason: lockErr.message });
      continue;
    }

    const when = new Date(live.scheduled_at).toLocaleString("fr-FR", {
      dateStyle: "full",
      timeStyle: "short"
    });

    try {
      for (const to of recipients) {
        await resend.emails.send({
          from: env.RESEND_FROM_EMAIL,
          to,
          subject: `Rappel — Live Bsaha dans 1 heure : ${live.title}`,
          html: `<p>Le live <strong>${live.title}</strong> commence bientot (${when}).</p>
<p>Thematique : ${live.theme}</p>
<p><a href="${live.meeting_url}">Acceder au live</a></p>`
        });
        emailsSent += 1;
      }
      sentLives += 1;
      log("info", "live_reminder_batch_sent", { liveId: live.id, recipients: recipients.length });
    } catch (err) {
      log("error", "live_reminder_email_failed", { liveId: live.id, reason: String(err) });
    }
  }

  return NextResponse.json({
    ok: true,
    livesInWindow: lives?.length ?? 0,
    remindersCreated: sentLives,
    emailsSent
  });
}
