import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = {
  searchParams?: {
    q?: string;
  };
};

export default async function AdminDealsPage({ searchParams }: Props) {
  const supabase = await createSupabaseServerClient();
  const { data: dealsRaw } = await supabase
    .from("deals")
    .select("*")
    .order("created_at", { ascending: false });
  const search = (searchParams?.q ?? "").trim().toLowerCase();
  const deals = (dealsRaw ?? []).filter((deal) => {
    if (!search) return true;
    return (
      deal.brand_name.toLowerCase().includes(search) ||
      deal.promo_code.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-5">
      <form method="get" className="rounded-xl bg-white p-4 shadow-sm">
        <input
          className="w-full rounded border p-2"
          name="q"
          defaultValue={searchParams?.q ?? ""}
          placeholder="Rechercher par marque ou code promo"
        />
      </form>

      <form action="/api/admin/deals" method="post" className="grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2">
        <input className="rounded border p-2" name="brandName" placeholder="Marque" required />
        <input className="rounded border p-2" name="promoCode" placeholder="Code promo" required />
        <input className="rounded border p-2 md:col-span-2" name="affiliateUrl" placeholder="Lien affilie" required />
        <textarea className="rounded border p-2 md:col-span-2" name="description" placeholder="Description" required />
        <input className="rounded border p-2" type="datetime-local" name="expiresAt" />
        <select className="rounded border p-2" name="isActive" defaultValue="true">
          <option value="true">Actif</option>
          <option value="false">Inactif</option>
        </select>
        <button className="rounded bg-sage px-4 py-2 text-white md:col-span-2">Ajouter le deal</button>
      </form>

      <div className="space-y-3">
        {(deals ?? []).map((deal) => (
          <article key={deal.id} className="rounded-xl bg-white p-4 shadow-sm">
            <p className="font-medium">{deal.brand_name} - {deal.promo_code}</p>
            <p className="text-sm text-dark/70">{deal.description}</p>
            <p className="text-xs">Actif: {deal.is_active ? "Oui" : "Non"}</p>
            <p className="text-xs">{deal.affiliate_url}</p>
            <div className="mt-2 flex gap-2">
              <form action={`/api/admin/deals/${deal.id}`} method="post">
                <input type="hidden" name="intent" value="toggle" />
                <button className="rounded border px-3 py-1 text-sm">Activer/Desactiver</button>
              </form>
              <form action={`/api/admin/deals/${deal.id}`} method="post">
                <input type="hidden" name="intent" value="delete" />
                <button className="rounded border px-3 py-1 text-sm">Supprimer</button>
              </form>
            </div>
            <form action={`/api/admin/deals/${deal.id}`} method="post" className="mt-3 grid gap-2 md:grid-cols-2">
              <input type="hidden" name="intent" value="update" />
              <input className="rounded border p-2" name="brandName" defaultValue={deal.brand_name} />
              <input className="rounded border p-2" name="promoCode" defaultValue={deal.promo_code} />
              <input className="rounded border p-2 md:col-span-2" name="affiliateUrl" defaultValue={deal.affiliate_url} />
              <textarea className="rounded border p-2 md:col-span-2" name="description" defaultValue={deal.description} />
              <input className="rounded border p-2" type="datetime-local" name="expiresAt" />
              <button className="rounded border px-3 py-1 text-sm">Mettre a jour</button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
