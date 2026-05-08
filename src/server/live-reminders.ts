/** Fenetre d envoi du rappel: le live commence dans ~1h (±5 min). */
export function reminderWindowUtcIso(nowMs: number = Date.now()) {
  const startMs = nowMs + 55 * 60 * 1000;
  const endMs = nowMs + 65 * 60 * 1000;
  return {
    fromIso: new Date(startMs).toISOString(),
    toIso: new Date(endMs).toISOString()
  };
}

export function mapStoolCountToNumber(raw: string): number {
  if (raw === "5+") return 5;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : 1;
}
