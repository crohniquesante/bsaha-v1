import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { log } from "@/lib/logger";
import { resend } from "@/lib/resend";
import { supabaseAdmin } from "@/lib/supabase/admin";

const bodySchema = z.object({
  email: z.string().trim().email().max(254)
});

function resolvePdfLocation(): { bucket: string; path: string } | null {
  const bucket = env.LEAD_MAGNET_EBOOK_BUCKET ?? "ebooks";
  let path = env.LEAD_MAGNET_EBOOK_PATH?.trim();
  if (path) return { bucket, path };

  return null;
}

export async function POST(request: Request) {
  const host = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const formData = await request.formData();
  const parsed = bodySchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    log("warn", "lead_magnet_validation_failed");
    return NextResponse.redirect(`${host}/ebook-gratuit?error=invalid`);
  }

  const normalizedEmail = parsed.data.email.toLowerCase();

  const { error: insertError } = await supabaseAdmin.from("lead_magnet_submissions").insert({
    email: normalizedEmail,
    source: "stopper_crise"
  });

  const insertCode = insertError ? (insertError as { code?: string }).code : undefined;
  const duplicateSubmission = insertCode === "23505";
  if (insertError && !duplicateSubmission) {
    log("error", "lead_magnet_insert_failed", { reason: insertError.message });
    return NextResponse.redirect(`${host}/ebook-gratuit?error=server`);
  }

  let bucketPath = resolvePdfLocation();
  if (!bucketPath) {
    const { data: ebook } = await supabaseAdmin
      .from("ebooks")
      .select("storage_path")
      .eq("is_free", true)
      .order("order_index", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (ebook?.storage_path) {
      bucketPath = { bucket: env.LEAD_MAGNET_EBOOK_BUCKET ?? "ebooks", path: ebook.storage_path };
    }
  }

  if (!bucketPath) {
    log("error", "lead_magnet_no_pdf_configured");
    return NextResponse.redirect(`${host}/ebook-gratuit?error=config`);
  }

  const signed = await supabaseAdmin.storage
    .from(bucketPath.bucket)
    .createSignedUrl(bucketPath.path, 72 * 60 * 60);

  if (!signed.data?.signedUrl) {
    log("error", "lead_magnet_signed_url_failed", { reason: signed.error?.message });
    return NextResponse.redirect(`${host}/ebook-gratuit?error=server`);
  }

  const { error: sendError } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: normalizedEmail,
    subject: "Votre ebook gratuit — Stopper la crise de Crohn",
    html: `<p>Bonjour,</p>
<p>Merci pour votre inscription. Voici votre lien securise pour telecharger l ebook (valable 72 h) :</p>
<p><a href="${signed.data.signedUrl}">Telecharger le PDF</a></p>
<p>A tres vite sur Bsaha.</p>`
  });

  if (sendError) {
    log("error", "lead_magnet_email_failed", { reason: sendError.message });
    return NextResponse.redirect(`${host}/ebook-gratuit?error=server`);
  }

  log("info", "lead_magnet_sent", { email: normalizedEmail });
  return NextResponse.redirect(`${host}/ebook-gratuit?sent=1`);
}
