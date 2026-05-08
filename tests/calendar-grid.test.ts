import { describe, expect, it } from "vitest";
import { calendarDateParis, daysInUtcMonth, parseYearMonthYm, utcMonthCells } from "@/server/calendar-grid";

describe("utcMonthCells", () => {
  it("pads leading empties starting Monday", () => {
    const cells = utcMonthCells(2026, 1);
    expect(cells[0]?.kind === "empty" || cells.slice(0, 3).some((c) => c.kind === "empty")).toBeTruthy();
    const dayCells = cells.filter((c) => c.kind === "day");
    expect(dayCells).toHaveLength(daysInUtcMonth(2026, 1));
  });
});

describe("parseYearMonthYm", () => {
  it("validates yyyy-mm", () => {
    expect(parseYearMonthYm("2026-05").ok).toBe(true);
    expect(parseYearMonthYm("2026-13").ok).toBe(false);
  });
});

describe("calendarDateParis", () => {
  it("formats as YYYY-MM-DD", () => {
    const s = calendarDateParis(new Date(Date.UTC(2026, 0, 8, 12, 0, 0)).getTime());
    expect(/^\d{4}-\d{2}-\d{2}$/.test(s)).toBeTruthy();
  });
});
