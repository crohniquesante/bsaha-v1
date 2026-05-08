import { describe, expect, it } from "vitest";
import {
  calendarNoteSchema,
  dailyLogSchema,
  videoProgressSchema
} from "@/server/validators";

describe("validators", () => {
  it("accepts valid daily log payload", () => {
    const result = dailyLogSchema.safeParse({
      date: "2026-05-08",
      bristolType: "4",
      stoolCount: "2",
      painLevel: "3",
      fatigue: "Moderee",
      mood: "🙂",
      note: "RAS"
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid daily log payload", () => {
    const result = dailyLogSchema.safeParse({
      date: "08/05/2026",
      bristolType: "9",
      stoolCount: "10",
      painLevel: "-1",
      fatigue: "none",
      mood: "ok"
    });
    expect(result.success).toBe(false);
  });

  it("validates calendar notes", () => {
    expect(calendarNoteSchema.safeParse({ date: "2026-05-08", note: "Bonne journee" }).success).toBe(true);
    expect(calendarNoteSchema.safeParse({ date: "x", note: "" }).success).toBe(false);
  });

  it("validates video progress", () => {
    expect(
      videoProgressSchema.safeParse({
        videoId: "550e8400-e29b-41d4-a716-446655440000",
        watchedPercent: "80",
        personalNote: "Termine"
      }).success
    ).toBe(true);
    expect(
      videoProgressSchema.safeParse({
        videoId: "not-a-uuid",
        watchedPercent: "101"
      }).success
    ).toBe(false);
  });
});
