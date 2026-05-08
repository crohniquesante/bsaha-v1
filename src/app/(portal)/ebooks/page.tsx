import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/server/auth";
import { ebooks as fallbackEbooks } from "@/server/content";

export default async function EbooksPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const [{ data: dbEbooks }, { data: downloads }] = await Promise.all([
    supabase.from("ebooks").select("*").order("order_index"),
    supabase.from("ebook_downloads").select("ebook_id").eq("user_id", user.id)
  ]);

  const downloaded = new Set(downloads?.map((d) => d.ebook_id));
  const list = dbEbooks?.length
    ? dbEbooks
    : fallbackEbooks.map((e, i) => ({ id: `fallback-${i}`, order_index: i + 1, ...e }));

  return (
    <div>
      <h1 className="text-3xl font-semibold">Ebooks</h1>
      <div className="mt-6 space-y-4">
        {list.map((ebook: any) => (
          <article key={ebook.id} className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold">{ebook.title}</h2>
            <p className="text-sm text-dark/70">{ebook.description}</p>
            <p className="mt-2 text-sm">Statut: {downloaded.has(ebook.id) ? "Telecharge" : "Non telecharge"}</p>
            <form className="mt-3" method="post" action="/api/ebooks/download">
              <input type="hidden" name="ebookId" value={ebook.id} />
              <button className="rounded bg-sage px-4 py-2 text-white">Telecharger</button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
