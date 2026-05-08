import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_PRICE_ONE_TIME: z.string().min(1),
  STRIPE_PRICE_INSTALLMENT: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email().or(z.string().endsWith(">")),
  BUNNY_LIBRARY_ID: z.string().optional(),
  NEXT_PUBLIC_DISCORD_INVITE_URL: z.preprocess((v) => {
    const s = typeof v === "string" ? v.trim() : v;
    return !s ? undefined : s;
  }, z.string().url().optional()),
  NEXT_PUBLIC_CALENDLY_URL: z.preprocess((v) => {
    const s = typeof v === "string" ? v.trim() : v;
    return !s ? undefined : s;
  }, z.string().url().optional()),
  CRON_SECRET: z.string().min(8).optional(),
  LEAD_MAGNET_EBOOK_BUCKET: z.string().min(1).optional(),
  LEAD_MAGNET_EBOOK_PATH: z.string().min(1).optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid env configuration: ${parsed.error.message}`);
}

export const env = parsed.data;
