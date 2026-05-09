import Stripe from "stripe";
import { env } from "@/lib/env";

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20"
    });
  }
  return stripeClient;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, _receiver): unknown {
    const client = getStripe();
    const value = Reflect.get(client as unknown as object, prop, client);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  }
}) as Stripe;
