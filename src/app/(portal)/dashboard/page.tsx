import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { computeProgressionScore } from "@/server/progression-score";
import { requireUser } from "@/server/auth";

const LOG_PROGRESSION_WINDOW_DAYS = 14;

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  x.setDate(diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function utcWindowStartInclusive(isoEnd: string, daysInclusive: number) {
  const d = new Date(`${isoEnd}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - (daysInclusive - 1));
  return d.toISOString().slice(0, 10);
}

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);
  const weekStart = startOfWeek(new Date()).toISOString().slice(0, 10);
  const logWindowStart = utcWindowStartInclusive(today, LOG_PROGRESSION_WINDOW_DAYS);

  const [
    { data: todayLog },
    { data: videoStats },
    { data: downloads },
    { data: weekLogs },
    { data: projections },
    { count: videosTotalCount },
    { count: ebooksTotalCount },
    { data: progressionLogs },
    { data: ebooksRows }
  ] = await Promise.all([
    supabase.from("daily_logs").select("id").eq("user_id", user.id).eq("date", today).maybeSingle(),
    supabase.from("video_progress").select("is_complete").eq("user_id", user.id),
    supabase.from("ebook_downloads").select("ebook_id").eq("user_id", user.id),
    supabase
      .from("daily_logs")
      .select("pain_level,date")
      .eq("user_id", user.id)
      .gte("date", weekStart)
      .lte("date", today),
    supabase
      .from("projections")
      .select("id,condition_text,action_text")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(5),
    supabase.from("videos").select("id", { count: "exact", head: true }),
    supabase.from("ebooks").select("id", { count: "exact", head: true }),
    supabase
      .from("daily_logs")
      .select("date")
      .eq("user_id", user.id)
      .gte("date", logWindowStart)
      .lte("date", today),
    supabase.from("ebook_downloads").select("ebook_id").eq("user_id", user.id)
  ]);

  const completedVideos = videoStats?.filter((v) => v.is_complete).length ?? 0;
  const downloadedRows = ebooksRows ?? [];
  const ebooksDownloadDistinct = new Set(downloadedRows.map((d) => d.ebook_id)).size;
  const logs = weekLogs ?? [];
  const painAvg =
    logs.length > 0 ? logs.reduce((s, l) => s + l.pain_level, 0) / logs.length : null;

  const distinctLogDaysLastWindow = new Set((progressionLogs ?? []).map((r) => r.date)).size;

  const videosTotalSafe = videosTotalCount ?? 0;
  const ebooksTotalSafe = ebooksTotalCount ?? 0;
  const prog = computeProgressionScore({
    videosTotal: videosTotalSafe,
    videosComplete: completedVideos,
    ebooksTotal: ebooksTotalSafe,
    ebooksDownloadDistinct,
    logDaysInWindow: distinctLogDaysLastWindow,
    windowDays: LOG_PROGRESSION_WINDOW_DAYS
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Dashboard</h1>

      <article className="rounded-xl border border-dark/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-sm text-dark/65">Score de progression</h2>
            <p className="mt-2 text-4xl font-semibold text-sage">{prog.total}</p>
            <p className="text-xs text-dark/55">
              Sur 100 — derniers {LOG_PROGRESSION_WINDOW_DAYS} jours (max 1 releve par jour UTC, dedupe), videos
              completees et ebooks telecharges (titres distincts)
            </p>
          </div>
          <div className="text-right text-sm text-dark/70">
            <div>Videos : +{prog.breakdown.videos} / 40</div>
            <div>Ebooks : +{prog.breakdown.ebooks} / 30</div>
            <div>Releves : +{prog.breakdown.logs} / 30</div>
          </div>
        </div>
        <div className="mt-4 grid gap-2">
          <div className="h-3 overflow-hidden rounded-full bg-dark/10">
            <div
              className="h-full bg-gradient-to-r from-sage via-gold to-sage transition-all"
              style={{ width: `${prog.total}%` }}
            />
          </div>
        </div>
        <Link href="/suivi" className="mt-3 inline-block text-sm text-sage underline">
          Voir graphes detail sur Mon suivi
        </Link>
      </article>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-sm text-dark/70">Releve du jour</h2>
          <p className="mt-2 text-2xl">{todayLog ? "Complete" : "A completer"}</p>
        </article>
        <article className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-sm text-dark/70">Videos completees</h2>
          <p className="mt-2 text-2xl">{completedVideos}</p>
          <p className="mt-1 text-xs text-dark/55">{videosTotalSafe ? `${completedVideos}/${videosTotalSafe}` : "—"}</p>
        </article>
        <article className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-sm text-dark/70">Ebooks telecharges</h2>
          <p className="mt-2 text-2xl">{downloadedRows.length}</p>
          <p className="mt-1 text-xs text-dark/55">
            Distinct titres : {ebooksDownloadDistinct}
            {ebooksTotalSafe ? ` / ${ebooksTotalSafe}` : ""}
          </p>
        </article>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium text-dark/70">Semaine en cours</h2>
          <p className="mt-2 text-2xl">{logs.length}</p>
          <p className="text-xs text-dark/60">Releves enregistres (lun. - aujourd&apos;hui)</p>
          <p className="mt-3 text-sm text-dark/80">
            Douleur moyenne: {painAvg !== null ? painAvg.toFixed(1) : "—"} / 5
          </p>
        </article>
        <article className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium text-dark/70">Raccourcis</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link className="rounded bg-sage px-3 py-1 text-sm text-white" href="/suivi">
              Releve + graphes
            </Link>
            <Link className="rounded border border-sage px-3 py-1 text-sm text-sage" href="/calendrier">
              Calendrier
            </Link>
            <Link className="rounded border border-gold px-3 py-1 text-sm text-gold" href="/objectifs">
              Objectifs
            </Link>
          </div>
        </article>
      </div>

      {(projections ?? []).length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-medium">Mes projections</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {(projections ?? []).map((p) => (
              <article
                key={p.id}
                className="rounded-xl border border-gold/35 bg-gradient-to-br from-gold/12 to-cream p-4 shadow-sm"
              >
                <p className="text-sm text-dark">
                  Quand <strong>{p.condition_text}</strong>, je ferai <strong>{p.action_text}</strong>.
                </p>
              </article>
            ))}
          </div>
          <Link href="/objectifs" className="mt-2 inline-block text-sm text-sage underline">
            Gerer mes projections
          </Link>
        </section>
      ) : null}

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-dark/80">Actions rapides</p>
        <div className="mt-3 flex gap-3">
          <Link className="rounded bg-sage px-4 py-2 text-white" href="/suivi">
            Releve quotidien
          </Link>
          <Link className="rounded border border-sage px-4 py-2 text-sage" href="/videos">
            Continuer mes videos
          </Link>
        </div>
      </div>
    </div>
  );
}
