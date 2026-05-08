import { NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { adminDealSchema } from "@/server/validators";

export async function POST(request: Request) {
  const [{ supabaseAdmin }, { createSupabaseServerClient }] = await Promise.all([
    import("@/lib/supabase/admin"),
    import("@/lib/supabase/server")
  ]);

  async function ensureAdmin() {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
    return data?.is_admin ? user : null;
  }

  const admin = await ensureAdmin();
  if (!admin) return NextResponse.redirect(new URL("/dashboard", request.url));

  const formData = await request.formData();
  const parsed = adminDealSchema.safeParse({
    brandName: formData.get("brandName"),
    promoCode: formData.get("promoCode"),
    description: formData.get("description"),
    affiliateUrl: formData.get("affiliateUrl"),
    expiresAt: formData.get("expiresAt") || undefined,
    isActive: formData.get("isActive") || "true"
  });
  if (!parsed.success) {
    log("warn", "admin_deal_validation_failed", { errors: parsed.error.flatten() });
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await supabaseAdmin.from("deals").insert({
    brand_name: parsed.data.brandName,
    promo_code: parsed.data.promoCode,
    description: parsed.data.description,
    affiliate_url: parsed.data.affiliateUrl,
    expires_at: parsed.data.expiresAt || null,
    is_active: parsed.data.isActive === "true"
  });
  log("info", "admin_deal_created", { adminId: admin.id, brand: parsed.data.brandName });
  return NextResponse.redirect(new URL("/admin/deals", request.url));
}
