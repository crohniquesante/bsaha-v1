import { z } from "zod";

export const dailyLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bristolType: z.coerce.number().int().min(1).max(7),
  stoolCount: z.enum(["1", "2", "3", "4", "5+"]),
  painLevel: z.coerce.number().int().min(0).max(5),
  fatigue: z.enum(["Aucune", "Legere", "Moderee", "Intense"]),
  mood: z.enum(["😀", "🙂", "😕", "😢"]),
  note: z.string().max(1000).optional().default("")
});

export const calendarNoteSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().min(1).max(500)
});

export const videoProgressSchema = z.object({
  videoId: z.string().uuid(),
  watchedPercent: z.coerce.number().int().min(0).max(100),
  personalNote: z.string().max(3000).optional().default("")
});

export const adminDealSchema = z.object({
  brandName: z.string().min(1).max(120),
  promoCode: z.string().min(1).max(80),
  description: z.string().min(1).max(500),
  affiliateUrl: z.string().url(),
  expiresAt: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional().default("true")
});

export const adminConsultationSchema = z.object({
  userId: z.string().uuid(),
  number: z.coerce.number().int().min(1).max(3),
  scheduledAt: z.string().optional(),
  durationMin: z.coerce.number().int().positive().max(180).optional(),
  status: z.string().min(1).max(60)
});

export const projectionWriteSchema = z.object({
  conditionText: z.string().min(1).max(500),
  actionText: z.string().min(1).max(500)
});

export const adminLiveSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().min(1).max(1000),
  scheduledAt: z.string().min(1),
  meetingUrl: z.string().url(),
  theme: z.string().min(1).max(120)
});
