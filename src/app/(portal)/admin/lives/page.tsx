import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminLivesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: lives } = await supabase
    .from("lives")
    .select("*")
    .order("scheduled_at", { ascending: true });

  return (
    <div className="space-y-5">
      <form action="/api/admin/lives" method="post" className="grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2">
        <input className="rounded border p-2 md:col-span-2" name="title" placeholder="Titre du live" required />
        <textarea className="min-h-24 rounded border p-2 md:col-span-2" name="description" placeholder="Description" required />
        <input className="rounded border p-2" type="datetime-local" name="scheduledAt" required />
        <input className="rounded border p-2" name="meetingUrl" placeholder="Lien Youtube / replay" required />
        <input className="rounded border p-2 md:col-span-2" name="theme" placeholder="Theme (ex. regulation SNS, emotions)" required />
        <button className="rounded bg-sage px-4 py-2 text-white md:col-span-2" type="submit">
          Ajouter un live
        </button>
      </form>

      <div className="space-y-3">
        {(lives ?? []).map((live) => (
          <article key={live.id} className="rounded-xl bg-white p-4 shadow-sm">
            <p className="font-medium">{live.title}</p>
            <p className="text-sm text-dark/70">{live.description}</p>
            <p className="mt-1 text-xs text-dark/60">
              {new Date(live.scheduled_at).toLocaleString("fr-FR")} — {live.theme}
            </p>
            <a href={live.meeting_url} className="mt-2 inline-block text-sm text-sage" target="_blank" rel="noreferrer">
              Ouvrir le lien
            </a>
            <div className="mt-3 space-y-2">
              <form action={`/api/admin/lives/${live.id}`} method="post" className="grid gap-2 md:grid-cols-2">
                <input type="hidden" name="intent" value="update" />
                <input className="rounded border p-2 md:col-span-2" name="title" defaultValue={live.title} />
                <textarea className="min-h-20 rounded border p-2 md:col-span-2" name="description" defaultValue={live.description} />
                <input className="rounded border p-2" type="datetime-local" name="scheduledAt" defaultValue={toLocalInput(live.scheduled_at)} />
                <input className="rounded border p-2" name="meetingUrl" defaultValue={live.meeting_url} />
                <input className="rounded border p-2 md:col-span-2" name="theme" defaultValue={live.theme} />
                <button className="rounded border px-3 py-1 text-sm md:col-span-2" type="submit">
                  Mettre a jour
                </button>
              </form>
              <form action={`/api/admin/lives/${live.id}`} method="post">
                <input type="hidden" name="intent" value="delete" />
                <button className="rounded border px-3 py-1 text-sm" type="submit">
                  Supprimer
                </button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
