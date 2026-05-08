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
    await supabaseAdmin.from("deals").delete().eq("id", params.id);
  } else if (intent === "toggle") {
    const current = await supabaseAdmin.from("deals").select("is_active").eq("id", params.id).single();
    await supabaseAdmin.from("deals").update({ is_active: !current.data?.is_active }).eq("id", params.id);
  } else if (intent === "update") {
    await supabaseAdmin
      .from("deals")
      .update({
        brand_name: String(formData.get("brandName") ?? ""),
        promo_code: String(formData.get("promoCode") ?? ""),
        description: String(formData.get("description") ?? ""),
        affiliate_url: String(formData.get("affiliateUrl") ?? ""),
        expires_at: formData.get("expiresAt") ? String(formData.get("expiresAt")) : null
      })
      .eq("id", params.id);
  }

  return NextResponse.redirect(new URL("/admin/deals", request.url));
}
