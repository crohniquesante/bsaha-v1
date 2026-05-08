import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/server/auth";

const MAX = 5;

type Props = {
  searchParams?: { error?: string };
};

function errorMessage(code?: string) {
  switch (code) {
    case "limit":
      return `Vous pouvez avoir au maximum ${MAX} projections actives. Supprimez-en une avant d'en ajouter.`;
    case "validation":
      return "Verifiez les champs: condition et action sont obligatoires (max 500 caracteres).";
    case "server":
      return "Une erreur est survenue. Reessayez plus tard.";
    default:
      return null;
  }
}

export default async function ObjectifsPage({ searchParams }: Props) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: projections } = await supabase
    .from("projections")
    .select("id,condition_text,action_text,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const msg = errorMessage(searchParams?.error);
  const count = projections?.length ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Objectifs et projections</h1>
      <p className="text-dark/80">
        Formulation: « Quand [condition], je ferai [action] ». Maximum recommande: {MAX} cartes actives ({count}/{MAX}).
      </p>
      {msg ? (
        <p className="rounded-lg border border-gold/60 bg-gold/10 px-4 py-2 text-sm text-dark">{msg}</p>
      ) : null}

      <form action="/api/projections" method="post" className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium">Ajouter une projection</h2>
        <label className="mt-4 block text-sm">
          Condition (quand…)
          <input className="mt-1 w-full rounded-lg border border-dark/15 p-2" name="conditionText" maxLength={500} required />
        </label>
        <label className="mt-3 block text-sm">
          Action (je ferai…)
          <input className="mt-1 w-full rounded-lg border border-dark/15 p-2" name="actionText" maxLength={500} required />
        </label>
        <button
          className="mt-4 rounded-lg bg-sage px-4 py-2 text-white disabled:opacity-40"
          type="submit"
          disabled={count >= MAX}
        >
          Ajouter
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {(projections ?? []).map((p) => (
          <article
            key={p.id}
            className="rounded-xl border border-gold/40 bg-gradient-to-br from-gold/15 to-cream p-5 shadow-sm"
          >
            <p className="text-sm font-medium uppercase tracking-wide text-gold">Projection</p>
            <p className="mt-2 text-dark">
              Quand <strong>{p.condition_text}</strong>, je ferai <strong>{p.action_text}</strong>.
            </p>
            <form action={`/api/projections/${p.id}`} method="post" className="mt-4 space-y-2">
              <input type="hidden" name="intent" value="update" />
              <input className="w-full rounded border p-2 text-sm" name="conditionText" defaultValue={p.condition_text} maxLength={500} required />
              <input className="w-full rounded border p-2 text-sm" name="actionText" defaultValue={p.action_text} maxLength={500} required />
              <div className="flex gap-2">
                <button className="rounded bg-sage px-3 py-1 text-xs text-white" type="submit">
                  Mettre a jour
                </button>
              </div>
            </form>
            <form action={`/api/projections/${p.id}`} method="post" className="mt-2">
              <input type="hidden" name="intent" value="delete" />
              <button className="text-xs text-dark/70 underline" type="submit">
                Supprimer
              </button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
