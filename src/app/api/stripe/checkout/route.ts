import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let mode: "installment" | "one_time" = "one_time";
  if (contentType.includes("application/json")) {
    const body = await request.json();
    mode = body?.mode === "installment" ? "installment" : "one_time";
  } else {
    const formData = await request.formData();
    mode = formData.get("mode") === "installment" ? "installment" : "one_time";
  }
  const priceId =
    mode === "installment"
      ? env.STRIPE_PRICE_INSTALLMENT
      : env.STRIPE_PRICE_ONE_TIME;

  const session = await stripe.checkout.sessions.create({
    mode: mode === "installment" ? "subscription" : "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/inscription?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/?checkout=cancel`,
    allow_promotion_codes: true
  });

  if (contentType.includes("application/json")) {
    return NextResponse.json({ url: session.url });
  }

  return NextResponse.redirect(session.url ?? "/");
}
