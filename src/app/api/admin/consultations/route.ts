import { NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSessionUserWithRole } from "@/server/authorization";
import { adminConsultationSchema } from "@/server/validators";

export async function POST(request: Request) {
  const { user, isAdmin } = await getSessionUserWithRole();
  if (!user || !isAdmin) return NextResponse.redirect(new URL("/dashboard", request.url));

  const formData = await request.formData();
  const parsed = adminConsultationSchema.safeParse({
    userId: formData.get("userId"),
    number: formData.get("number"),
    scheduledAt: formData.get("scheduledAt") || undefined,
    durationMin: formData.get("durationMin") || undefined,
    status: formData.get("status")
  });
  if (!parsed.success) {
    log("warn", "admin_consultation_validation_failed", { errors: parsed.error.flatten() });
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  let notesPath: string | null = null;
  const file = formData.get("notesPdf");
  if (file instanceof File && file.size > 0) {
    const fileName = `${parsed.data.userId}/consultation-${parsed.data.number}-${Date.now()}.pdf`;
    const bytes = await file.arrayBuffer();
    await supabaseAdmin.storage.from("consultations").upload(fileName, bytes, {
      contentType: "application/pdf",
      upsert: true
    });
    notesPath = fileName;
  }

  const { data: existing } = await supabaseAdmin
    .from("consultations")
    .select("notes_pdf_path")
    .eq("user_id", parsed.data.userId)
    .eq("number", parsed.data.number)
    .maybeSingle();

  const payload: Record<string, unknown> = {
    user_id: parsed.data.userId,
    number: parsed.data.number,
    scheduled_at: parsed.data.scheduledAt || null,
    duration_min: parsed.data.durationMin ?? null,
    status: parsed.data.status
  };
  if (notesPath) {
    payload.notes_pdf_path = notesPath;
  } else if (existing?.notes_pdf_path) {
    payload.notes_pdf_path = existing.notes_pdf_path;
  }

  await supabaseAdmin.from("consultations").upsert(payload, {
    onConflict: "user_id,number"
  });

  log("info", "admin_consultation_upserted", {
    adminId: user.id,
    userId: parsed.data.userId,
    number: parsed.data.number
  });
  return NextResponse.redirect(new URL("/admin/consultations", request.url));
}
