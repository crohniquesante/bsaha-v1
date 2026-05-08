import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSessionUserWithRole } from "@/server/authorization";

type Props = { params: { id: string } };

export async function GET(request: Request, { params }: Props) {
  const { user, isAdmin } = await getSessionUserWithRole();
  if (!user) return NextResponse.redirect(new URL("/connexion", request.url));

  const { data: consultation } = await supabaseAdmin
    .from("consultations")
    .select("user_id,notes_pdf_path")
    .eq("id", params.id)
    .single();

  if (!consultation?.notes_pdf_path) {
    return NextResponse.redirect(new URL("/consultations", request.url));
  }

  const isOwner = consultation.user_id === user.id;
  if (!isOwner && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const signed = await supabaseAdmin.storage
    .from("consultations")
    .createSignedUrl(consultation.notes_pdf_path, 60 * 10);

  if (!signed.data?.signedUrl) {
    return NextResponse.redirect(new URL("/consultations", request.url));
  }

  return NextResponse.redirect(signed.data.signedUrl);
}
