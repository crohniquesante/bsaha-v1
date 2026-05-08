import { describe, expect, it } from "vitest";
import { mapStoolCountToNumber, reminderWindowUtcIso } from "@/server/live-reminders";

describe("live-reminders helpers", () => {
  it("defines a ~1 hour window in UTC ISO", () => {
    const t0 = new Date("2026-08-08T14:00:00.000Z").getTime();
    const { fromIso, toIso } = reminderWindowUtcIso(t0);
    const fromMs = Date.parse(fromIso);
    const toMs = Date.parse(toIso);
    expect(toMs - fromMs).toBe(10 * 60 * 1000);
    expect(fromMs).toBe(t0 + 55 * 60 * 1000);
    expect(toMs).toBe(t0 + 65 * 60 * 1000);
  });

  it("maps stool count", () => {
    expect(mapStoolCountToNumber("5+")).toBe(5);
    expect(mapStoolCountToNumber("3")).toBe(3);
  });
});
