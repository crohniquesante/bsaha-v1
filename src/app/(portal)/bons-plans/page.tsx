import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/server/auth";

export default async function BonsPlansPage() {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: dealsRaw } = await supabase
    .from("deals")
    .select("id,brand_name,promo_code,description,affiliate_url,expires_at,is_active")
    .order("created_at", { ascending: false });

  const now = Date.now();
  const deals =
    dealsRaw?.filter((d) => {
      if (!d.is_active) return false;
      if (!d.expires_at) return true;
      return new Date(d.expires_at).getTime() > now;
    }) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Bons plans</h1>
      <p className="text-dark/80">Codes promo et collaborations partenaires (offres actives uniquement).</p>
      <div className="grid gap-4 md:grid-cols-2">
        {deals.length === 0 ? (
          <p className="rounded-xl bg-white p-6 shadow-sm text-dark/70">Aucun bon plan pour le moment.</p>
        ) : (
          deals.map((deal) => (
            <article key={deal.id} className="rounded-xl border border-gold/30 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-sage">{deal.brand_name}</h2>
              <p className="mt-2 font-mono text-lg text-gold">{deal.promo_code}</p>
              <p className="mt-2 text-sm text-dark/80">{deal.description}</p>
              <p className="mt-1 text-xs text-dark/60">
                {deal.expires_at ? `Expire le ${new Date(deal.expires_at).toLocaleDateString("fr-FR")}` : "Sans date d expiration"}
              </p>
              <a
                href={deal.affiliate_url}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-3 inline-block rounded-lg bg-sage px-4 py-2 text-sm text-white"
              >
                Voir l&apos;offre
              </a>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
