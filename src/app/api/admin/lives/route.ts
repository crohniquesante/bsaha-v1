import { NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSessionUserWithRole } from "@/server/authorization";
import { adminLiveSchema } from "@/server/validators";

export async function POST(request: Request) {
  const { user, isAdmin } = await getSessionUserWithRole();
  if (!user || !isAdmin) return NextResponse.redirect(new URL("/dashboard", request.url));

  const formData = await request.formData();
  const parsed = adminLiveSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    scheduledAt: formData.get("scheduledAt"),
    meetingUrl: formData.get("meetingUrl"),
    theme: formData.get("theme")
  });
  if (!parsed.success) {
    log("warn", "admin_live_validation_failed", { errors: parsed.error.flatten() });
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await supabaseAdmin.from("lives").insert({
    title: parsed.data.title,
    description: parsed.data.description,
    scheduled_at: parsed.data.scheduledAt,
    meeting_url: parsed.data.meetingUrl,
    theme: parsed.data.theme
  });

  log("info", "admin_live_created", { adminId: user.id });
  return NextResponse.redirect(new URL("/admin/lives", request.url));
}
