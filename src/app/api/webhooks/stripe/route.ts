import Stripe from "stripe";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { log } from "@/lib/logger";
import { resend } from "@/lib/resend";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function handleCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const email = session.customer_details?.email;
  if (!email) return;

  const customerId =
    typeof session.customer === "string" ? session.customer : null;

  const existing = await supabaseAdmin
    .from("users")
    .select("id,access_active")
    .eq("email", email)
    .maybeSingle();

  let userId = existing.data?.id;
  if (!userId) {
    const { data: authUser } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true
    });
    userId = authUser.user?.id;
  }
  if (!userId) return;

  await supabaseAdmin.from("users").upsert({
    id: userId,
    email,
    stripe_customer_id: customerId,
    access_active: true
  });

  if (!existing.data?.access_active) {
    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: email,
      subject: "Bienvenue dans Bsaha",
      html: "<p>Bienvenue dans le programme Bsaha. Votre acces est active.</p>"
    });
    log("info", "welcome_email_sent", { email });
  }
  log("info", "checkout_completed_processed", { email, customerId });
}

async function handleInvoiceFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const customerId =
    typeof invoice.customer === "string" ? invoice.customer : null;
  if (!customerId) return;

  await supabaseAdmin
    .from("users")
    .update({ access_active: false })
    .eq("stripe_customer_id", customerId);
  log("warn", "invoice_payment_failed_processed", { customerId });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    log("error", "stripe_webhook_signature_invalid", { reason: String(error) });
    return NextResponse.json({ error: `Webhook Error: ${String(error)}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(event);
  }

  if (event.type === "invoice.payment_failed") {
    await handleInvoiceFailed(event);
  }

  return NextResponse.json({ received: true });
}
