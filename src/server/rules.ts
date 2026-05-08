export function computeVideoComplete(watchedPercent: number) {
  return watchedPercent >= 80;
}

export function colorForPainLevel(painLevel: number) {
  if (painLevel <= 1) return "green";
  if (painLevel <= 3) return "orange";
  return "red";
}

export function buildDailyLogConflictKey() {
  return "user_id,date";
}
