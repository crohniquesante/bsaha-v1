import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/server/auth";
import {
  formatYm,
  parseYearMonthYm,
  shiftYmMonths,
  utcMonthCells,
  utcRangeForYm,
  ymFromParisToday
} from "@/server/calendar-grid";
import { colorForPainLevel } from "@/server/rules";

function cellBgPain(p?: number | null) {
  if (p === null || p === undefined) return "bg-cream/80 text-dark";
  const c = colorForPainLevel(p);
  if (c === "green") return "bg-green-100 text-green-900 border border-green-200";
  if (c === "orange") return "bg-orange-100 text-orange-900 border border-orange-200";
  return "bg-red-100 text-red-900 border border-red-200";
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

type Props = {
  searchParams?: { m?: string; detail?: string };
};

export default async function CalendrierPage({ searchParams }: Props) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const parsedYm = parseYearMonthYm(searchParams?.m);
  const ymBase = ymFromParisToday();
  const year = parsedYm.ok ? parsedYm.year : ymBase.year;
  const month = parsedYm.ok ? parsedYm.month : ymBase.month;

  const ym = formatYm(year, month);
  const { start: rangeStart, end: rangeEnd } = utcRangeForYm(year, month);
  const prev = shiftYmMonths(year, month, -1);
  const next = shiftYmMonths(year, month, 1);

  const [{ data: logs }, { data: noteRows }] = await Promise.all([
    supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", rangeStart)
      .lte("date", rangeEnd)
      .order("date", { ascending: true }),
    supabase
      .from("calendar_notes")
      .select("id,date,note,created_at")
      .eq("user_id", user.id)
      .gte("date", rangeStart)
      .lte("date", rangeEnd)
      .order("created_at", { ascending: true })
  ]);

  const logByIso = new Map((logs ?? []).map((r) => [String(r.date), r]));
  const noteCountByIso = new Map<string, number>();
  for (const n of noteRows ?? []) {
    const k = String(n.date);
    noteCountByIso.set(k, (noteCountByIso.get(k) ?? 0) + 1);
  }

  const detailRaw = searchParams?.detail ?? "";
  const detailOk = /^\d{4}-\d{2}-\d{2}$/.test(detailRaw);

  let detailLog = detailOk ? logByIso.get(detailRaw) ?? null : null;

  let detailNotes: { id: string; date: string; note: string; created_at: string }[] = [];
  if (detailOk) {
    if (!detailLog) {
      const found = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", detailRaw)
        .maybeSingle();
      detailLog = found.data ?? null;
    }

    const filteredMonth = (noteRows ?? []).filter((n) => String(n.date) === detailRaw);
    if (filteredMonth.length) {
      detailNotes = [...filteredMonth].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    } else {
      const extra = await supabase
        .from("calendar_notes")
        .select("id,date,note,created_at")
        .eq("user_id", user.id)
        .eq("date", detailRaw)
        .order("created_at", { ascending: false });

      detailNotes =
        extra.data?.map((n) => ({
          id: String(n.id),
          date: String(n.date),
          note: String(n.note),
          created_at: String(n.created_at)
        })) ?? [];
    }
  }

  const cells = utcMonthCells(year, month);

  const monthFormatter = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris"
  });
  const monthTitle = monthFormatter.format(new Date(Date.UTC(year, month - 1, 1)));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold">Calendrier</h1>
        <div className="flex gap-2">
          <Link
            href={`/calendrier?m=${formatYm(prev.year, prev.month)}`}
            className="rounded border border-dark/15 px-3 py-2 text-sm"
          >
            Mois précédent
          </Link>
          <Link
            href={`/calendrier?m=${formatYm(next.year, next.month)}`}
            className="rounded border border-dark/15 px-3 py-2 text-sm"
          >
            Mois suivant
          </Link>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-medium capitalize">{monthTitle}</p>
            <p className="text-xs text-dark/55">
              Sélection grille : <code className="text-xs">{ym}</code>
            </p>
          </div>
          <Link href="/calendrier" className="text-sm text-sage underline">
            Revenir au mois courant
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-2 py-1 text-xs font-semibold text-dark/60">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {cells.map((c, idx) => {
            if (c.kind === "empty") {
              return <div key={`e-${idx}`} className="min-h-[5.75rem]" />;
            }
            const iso = c.iso;
            const row = logByIso.get(iso);
            const pain = row?.pain_level ?? null;
            const noteDots = noteCountByIso.get(iso) ?? 0;
            const hasLogNote = Boolean(row?.note && String(row.note).trim());

            const hrefDetail = `/calendrier?m=${ym}&detail=${iso}`;

            return (
              <Link
                key={iso}
                href={hrefDetail}
                scroll={false}
                className={`min-h-[5.75rem] rounded-xl p-2 text-left transition hover:ring-2 hover:ring-sage ${cellBgPain(pain)}`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-sm font-semibold">{c.dom}</span>
                  {(noteDots > 0 || hasLogNote) && (
                    <span className="inline-block h-2 w-2 rounded-full bg-dark/55" aria-label="Notes" />
                  )}
                </div>
                <div className="mt-2 text-[11px] leading-snug opacity-85">
                  {row ? (
                    <>
                      <div>Bristol : {row.bristol_type}</div>
                      <div>Douleur : {pain}</div>
                      <div>Selles : {row.stool_count}</div>
                    </>
                  ) : (
                    <span className="text-dark/50">Pas de relevé</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-4 border-t border-dark/10 pt-4 text-xs text-dark/70">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-green-100 ring-2 ring-green-200" /> Douleur ≤1
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-orange-100 ring-2 ring-orange-200" /> Douleur 2–3
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-red-100 ring-2 ring-red-200" /> Douleur ≥4
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-dark/55" /> Annotation / note présente
          </span>
        </div>
      </div>

      {detailOk ? (
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Journée sélectionnée : {detailRaw}</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <article className="rounded-lg border border-dark/10 p-4">
              <h3 className="font-medium text-dark">Relevé quotidien</h3>
              {detailLog ? (
                <ul className="mt-3 space-y-1 text-sm text-dark/85">
                  <li>Bristol : {detailLog.bristol_type}</li>
                  <li>Selles : {detailLog.stool_count}</li>
                  <li>Douleur : {detailLog.pain_level}</li>
                  <li>Fatigue : {detailLog.fatigue}</li>
                  <li>Humeur : {detailLog.mood}</li>
                  {detailLog.note ? (
                    <li className="pt-2 text-dark">
                      Note : <span className="italic">{detailLog.note}</span>
                    </li>
                  ) : (
                    <li className="pt-2 text-dark/55">Pas de note sur le relevé.</li>
                  )}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-dark/70">
                  Pas de relevé pour ce jour. Ajoute-le depuis{" "}
                  <Link className="text-sage underline" href="/suivi">
                    Mon suivi
                  </Link>
                  .
                </p>
              )}
            </article>

            <article className="rounded-lg border border-dark/10 p-4">
              <h3 className="font-medium text-dark">Annotations</h3>

              <div className="mt-3 space-y-3">
                {detailNotes.length ? (
                  detailNotes.map((n) => (
                    <p key={n.id} className="rounded border border-dark/10 bg-cream px-3 py-2 text-sm">
                      {n.note}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-dark/60">Aucune annotation calendrier.</p>
                )}

                <form className="mt-4 space-y-2" action="/api/calendar-notes" method="post">
                  <input type="hidden" name="date" value={detailRaw} />
                  <label className="block text-xs text-dark/70">
                    Nouvelle annotation
                    <textarea className="mt-1 min-h-[5rem] w-full rounded border p-2" name="note" required />
                  </label>
                  <button className="rounded bg-sage px-4 py-2 text-white" type="submit">
                    Ajouter
                  </button>
                </form>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      <aside className="rounded-xl bg-white p-5 shadow-sm text-sm text-dark/75">
        <p className="font-medium text-dark">Lecture rapide</p>
        <p className="mt-2">
          Clique une journée pour voir détail relevé et annotations (le dot indique présence de note / annotation).
        </p>
      </aside>
    </div>
  );
}
