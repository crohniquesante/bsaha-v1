import { describe, expect, it } from "vitest";
import {
  buildDailyLogConflictKey,
  colorForPainLevel,
  computeVideoComplete
} from "@/server/rules";

describe("business rules", () => {
  it("marks video as complete at 80 percent", () => {
    expect(computeVideoComplete(79)).toBe(false);
    expect(computeVideoComplete(80)).toBe(true);
  });

  it("maps pain level to expected color", () => {
    expect(colorForPainLevel(1)).toBe("green");
    expect(colorForPainLevel(2)).toBe("orange");
    expect(colorForPainLevel(5)).toBe("red");
  });

  it("enforces one daily log per date key", () => {
    expect(buildDailyLogConflictKey()).toBe("user_id,date");
  });
});
