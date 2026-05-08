import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSessionUserWithRole } from "@/server/authorization";

type Props = { params: { id: string } };

export async function POST(request: Request, { params }: Props) {
  const { user, isAdmin } = await getSessionUserWithRole();
  if (!user || !isAdmin) return NextResponse.redirect(new URL("/dashboard", request.url));

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");

  if (intent === "delete") {
    await supabaseAdmin.from("consultations").delete().eq("id", params.id);
    return NextResponse.redirect(new URL("/admin/consultations", request.url));
  }

  if (intent === "update") {
    const update: Record<string, unknown> = {
      status: String(formData.get("status") ?? "A venir"),
      scheduled_at: formData.get("scheduledAt") ? String(formData.get("scheduledAt")) : null,
      duration_min: formData.get("durationMin") ? Number(formData.get("durationMin")) : null
    };

    const file = formData.get("notesPdf");
    if (file instanceof File && file.size > 0) {
      const consultation = await supabaseAdmin
        .from("consultations")
        .select("user_id,number")
        .eq("id", params.id)
        .single();
      const fileName = `${consultation.data?.user_id}/consultation-${consultation.data?.number}-${Date.now()}.pdf`;
      const bytes = await file.arrayBuffer();
      await supabaseAdmin.storage.from("consultations").upload(fileName, bytes, {
        contentType: "application/pdf",
        upsert: true
      });
      update.notes_pdf_path = fileName;
    }

    await supabaseAdmin.from("consultations").update(update).eq("id", params.id);
  }

  return NextResponse.redirect(new URL("/admin/consultations", request.url));
}
