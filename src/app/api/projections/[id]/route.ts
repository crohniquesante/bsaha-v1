import { NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { projectionWriteSchema } from "@/server/validators";

type Props = { params: { id: string } };

export async function POST(request: Request, { params }: Props) {
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/connexion", request.url));

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");

  if (intent === "delete") {
    const { error } = await supabase.from("projections").delete().eq("id", params.id).eq("user_id", user.id);
    if (error) log("warn", "projection_delete_failed", { reason: error.message });
    return NextResponse.redirect(new URL("/objectifs", request.url));
  }

  const parsed = projectionWriteSchema.safeParse({
    conditionText: formData.get("conditionText"),
    actionText: formData.get("actionText")
  });
  if (!parsed.success) {
    return NextResponse.redirect(new URL("/objectifs?error=validation", request.url));
  }

  const { error } = await supabase
    .from("projections")
    .update({
      condition_text: parsed.data.conditionText,
      action_text: parsed.data.actionText
    })
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (error) {
    log("warn", "projection_update_failed", { reason: error.message });
    return NextResponse.redirect(new URL("/objectifs?error=server", request.url));
  }

  log("info", "projection_updated", { userId: user.id, id: params.id });
  return NextResponse.redirect(new URL("/objectifs", request.url));
}
