import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { requireUser } from "@/server/auth";

export default async function CommunautePage() {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const nowIso = new Date().toISOString();
  const { data: upcoming } = await supabase
    .from("lives")
    .select("id,title,description,scheduled_at,meeting_url,theme")
    .gte("scheduled_at", nowIso)
    .order("scheduled_at", { ascending: true });

  const discordUrl = env.NEXT_PUBLIC_DISCORD_INVITE_URL;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Communaute</h1>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium">Discord</h2>
        <p className="mt-2 text-sm text-dark/80">
          Acces au serveur prive (invitation individuelle lorsque disponible dans votre dashboard).
        </p>
        {discordUrl ? (
          <Link
            href={discordUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-4 inline-block rounded-lg bg-sage px-4 py-2 text-white"
          >
            Rejoindre Discord
          </Link>
        ) : (
          <p className="mt-3 text-sm text-dark/60">
            Configurez <code className="text-xs">NEXT_PUBLIC_DISCORD_INVITE_URL</code> pour afficher le bouton.
          </p>
        )}
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium">Prochains lives</h2>
        <p className="mt-1 text-sm text-dark/70">Thematiques prevues: regulation SNS, emotions, FAQ, partages.</p>
        <div className="mt-4 space-y-4">
          {(upcoming ?? []).length === 0 ? (
            <p className="text-sm text-dark/60">Aucun live a venir programme.</p>
          ) : (
            (upcoming ?? []).map((live) => (
              <article key={live.id} className="rounded-lg border border-dark/10 p-4">
                <p className="font-semibold">{live.title}</p>
                <p className="text-xs uppercase tracking-wide text-sage">{live.theme}</p>
                <p className="mt-2 text-sm text-dark/80">{live.description}</p>
                <p className="mt-2 text-xs text-dark/60">{new Date(live.scheduled_at).toLocaleString("fr-FR")}</p>
                <Link
                  href={live.meeting_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-2 inline-block text-sm text-gold underline"
                >
                  Acceder au live
                </Link>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
