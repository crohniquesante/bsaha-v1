import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/connexion", request.url));

  const formData = await request.formData();
  const ebookId = String(formData.get("ebookId"));
  const { data: ebook } = await supabase
    .from("ebooks")
    .select("id,storage_path")
    .eq("id", ebookId)
    .single();

  if (!ebook) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const signed = await supabase.storage
    .from("ebooks")
    .createSignedUrl(ebook.storage_path, 60 * 60);

  await supabase.from("ebook_downloads").insert({ user_id: user.id, ebook_id: ebookId });

  if (signed.data?.signedUrl) {
    return NextResponse.redirect(signed.data.signedUrl);
  }

  return NextResponse.redirect(new URL("/ebooks", request.url));
}
