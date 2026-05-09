import { Resend } from "resend";
import { env } from "@/lib/env";

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

export const resend = new Proxy({} as Resend, {
  get(_target, prop, _receiver): unknown {
    const client = getResend();
    const value = Reflect.get(client as unknown as object, prop, client);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  }
}) as Resend;
