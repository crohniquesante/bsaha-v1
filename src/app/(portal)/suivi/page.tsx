import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapStoolCountToNumber } from "@/server/live-reminders";
import { requireUser } from "@/server/auth";
import { SuiviCharts, type ChartRow } from "./SuiviCharts";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function last30Days(): string[] {
  const out: string[] = [];
  const end = new Date();
  for (let i = 29; i >= 0; i--) {
    const x = new Date(end);
    x.setDate(end.getDate() - i);
    out.push(isoDate(x));
  }
  return out;
}

export default async function SuiviPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);
  const rangeStart = last30Days()[0]!;

  const [{ data: log }, { data: logs30 }] = await Promise.all([
    supabase.from("daily_logs").select("*").eq("user_id", user.id).eq("date", today).maybeSingle(),
    supabase
      .from("daily_logs")
      .select("date,pain_level,bristol_type,stool_count")
      .eq("user_id", user.id)
      .gte("date", rangeStart)
      .lte("date", today)
      .order("date", { ascending: true })
  ]);

  const byDate = new Map((logs30 ?? []).map((l) => [l.date, l]));
  const chartData: ChartRow[] = last30Days().map((d) => {
    const row = byDate.get(d);
    if (!row) {
      return { date: d.slice(5), pain: null, bristol: null, stools: null };
    }
    return {
      date: d.slice(5),
      pain: row.pain_level,
      bristol: row.bristol_type,
      stools: mapStoolCountToNumber(row.stool_count)
    };
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">Mon suivi</h1>

      <SuiviCharts data={chartData} />

      <form method="post" action="/api/daily-logs" className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-medium">Releve quotidien</h2>
        <input type="hidden" name="date" value={today} />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Type Bristol
            <input
              className="mt-1 w-full rounded border p-2"
              type="number"
              min={1}
              max={7}
              name="bristolType"
              defaultValue={log?.bristol_type ?? 4}
            />
          </label>
          <label className="text-sm">
            Nombre de selles
            <select className="mt-1 w-full rounded border p-2" name="stoolCount" defaultValue={log?.stool_count ?? "1"}>
              {["1", "2", "3", "4", "5+"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Douleur (0-5)
            <input
              className="mt-1 w-full rounded border p-2"
              type="number"
              min={0}
              max={5}
              name="painLevel"
              defaultValue={log?.pain_level ?? 0}
            />
          </label>
          <label className="text-sm">
            Fatigue
            <select className="mt-1 w-full rounded border p-2" name="fatigue" defaultValue={log?.fatigue ?? "Aucune"}>
              {["Aucune", "Legere", "Moderee", "Intense"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Humeur
            <select className="mt-1 w-full rounded border p-2" name="mood" defaultValue={log?.mood ?? "🙂"}>
              {["😀", "🙂", "😕", "😢"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-3 block text-sm">
          Note libre
          <textarea className="mt-1 min-h-24 w-full rounded border p-2" name="note" defaultValue={log?.note ?? ""} />
        </label>
        <button className="mt-3 rounded bg-sage px-4 py-2 text-white" type="submit">
          {log ? "Modifier le releve du jour" : "Enregistrer le releve du jour"}
        </button>
      </form>
    </div>
  );
}
