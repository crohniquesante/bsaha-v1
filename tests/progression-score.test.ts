import { describe, expect, it } from "vitest";
import { computeProgressionScore } from "@/server/progression-score";

describe("computeProgressionScore", () => {
  it("returns 100 when fully complete", () => {
    expect(
      computeProgressionScore({
        videosTotal: 10,
        videosComplete: 10,
        ebooksTotal: 6,
        ebooksDownloadDistinct: 6,
        logDaysInWindow: 14,
        windowDays: 14
      }).total
    ).toBe(100);
  });

  it("caps ratios at 1 when above totals", () => {
    expect(
      computeProgressionScore({
        videosTotal: 5,
        videosComplete: 100,
        ebooksTotal: 2,
        ebooksDownloadDistinct: 50,
        logDaysInWindow: 99,
        windowDays: 10
      }).total
    ).toBe(100);
  });

  it("handles zero denominators gracefully", () => {
    const payload = computeProgressionScore({
      videosTotal: 0,
      videosComplete: 0,
      ebooksTotal: 0,
      ebooksDownloadDistinct: 0,
      logDaysInWindow: 3,
      windowDays: 7
    });
    const expectedLogs = Math.round(30 * (3 / 7));
    expect(payload.breakdown.logs).toBe(expectedLogs);
    expect(payload.total).toBe(expectedLogs);
  });
});
