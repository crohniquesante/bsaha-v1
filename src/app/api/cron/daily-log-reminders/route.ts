import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { log } from "@/lib/logger";
import { resend } from "@/lib/resend";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { calendarDateParis } from "@/server/calendar-grid";

export async function GET(request: Request) {
  const secret = env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayParis = calendarDateParis();
  const appUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

  const { data: members } = await supabaseAdmin
    .from("users")
    .select("id,email")
    .eq("access_active", true)
    .not("consent_signed_at", "is", null);

  let claimed = 0;
  let emailsSent = 0;

  for (const member of members ?? []) {
    if (!member.email) continue;

    const { data: hasLog } = await supabaseAdmin
      .from("daily_logs")
      .select("id")
      .eq("user_id", member.id)
      .eq("date", todayParis)
      .maybeSingle();

    if (hasLog) continue;

    const { error: lockErr } = await supabaseAdmin.from("daily_log_reminder_sent").insert({
      user_id: member.id,
      calendar_date: todayParis
    });
    const code = lockErr ? (lockErr as { code?: string }).code : undefined;
    if (code === "23505") continue;
    if (lockErr) {
      log("error", "daily_log_reminder_lock_failed", {
        userId: member.id,
        reason: lockErr.message
      });
      continue;
    }
    claimed += 1;

    try {
      await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: member.email,
        subject: "Bsaha - Pense a ton releve du jour",
        html: `<p>Bonjour,</p>
<p>Tu n&apos;as pas encore complete ton releve symptomes pour aujourd&apos;hui (${todayParis}).</p>
<p><a href="${appUrl}/suivi">Completer mon releve</a></p>
<p>Prends soin de toi.</p>`
      });
      emailsSent += 1;
    } catch (err) {
      log("error", "daily_log_reminder_email_failed", { userId: member.id, reason: String(err) });
    }
  }

  log("info", "daily_log_reminder_cron_completed", {
    calendarDate: todayParis,
    claimed,
    emailsSent
  });

  return NextResponse.json({
    ok: true,
    calendarDate: todayParis,
    claimed,
    emailsSent
  });
}
