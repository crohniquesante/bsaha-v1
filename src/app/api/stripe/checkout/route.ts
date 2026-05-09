import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const oneTimePrice = process.env.STRIPE_PRICE_ONE_TIME;
    const installmentPrice = process.env.STRIPE_PRICE_INSTALLMENT;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!stripeSecretKey || !oneTimePrice || !installmentPrice || !appUrl) {
      return NextResponse.json({ error: "Missing Stripe environment variables" }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });

    const contentType = request.headers.get("content-type") ?? "";
    let mode: "installment" | "one_time" = "one_time";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      mode = body?.mode === "installment" ? "installment" : "one_time";
    } else {
      const formData = await request.formData();
      mode = formData.get("mode") === "installment" ? "installment" : "one_time";
    }

    const priceId = mode === "installment" ? installmentPrice : oneTimePrice;

    const session = await stripe.checkout.sessions.create({
      mode: mode === "installment" ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/inscription?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?checkout=cancel`,
      allow_promotion_codes: true
    });

    if (contentType.includes("application/json")) {
      return NextResponse.json({ url: session.url });
    }

    return NextResponse.redirect(session.url ?? "/");
  } catch (error) {
    return NextResponse.json({ error: "Stripe checkout failed", detail: String(error) }, { status: 500 });
  }
}
