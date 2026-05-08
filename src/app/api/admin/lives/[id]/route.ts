import { NextResponse } from "next/server";
import { adminLiveSchema } from "@/server/validators";

type Props = { params: { id: string } };

export async function POST(request: Request, { params }: Props) {
  const [{ supabaseAdmin }, { getSessionUserWithRole }] = await Promise.all([
    import("@/lib/supabase/admin"),
    import("@/server/authorization")
  ]);
  const { user, isAdmin } = await getSessionUserWithRole();
  if (!user || !isAdmin) return NextResponse.redirect(new URL("/dashboard", request.url));

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");

  if (intent === "delete") {
    await supabaseAdmin.from("lives").delete().eq("id", params.id);
    return NextResponse.redirect(new URL("/admin/lives", request.url));
  }

  const parsed = adminLiveSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    scheduledAt: formData.get("scheduledAt"),
    meetingUrl: formData.get("meetingUrl"),
    theme: formData.get("theme")
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await supabaseAdmin
    .from("lives")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      scheduled_at: parsed.data.scheduledAt,
      meeting_url: parsed.data.meetingUrl,
      theme: parsed.data.theme
    })
    .eq("id", params.id);

  return NextResponse.redirect(new URL("/admin/lives", request.url));
}
