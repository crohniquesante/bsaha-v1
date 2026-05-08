import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = {
  searchParams?: {
    q?: string;
  };
};

export default async function AdminConsultationsPage({ searchParams }: Props) {
  const supabase = await createSupabaseServerClient();
  const search = (searchParams?.q ?? "").trim().toLowerCase();

  const [{ data: users }, { data: consultationsRaw }] = await Promise.all([
    supabase.from("users").select("id,email").order("created_at", { ascending: false }),
    supabase
      .from("consultations")
      .select("id,user_id,number,status,scheduled_at,notes_pdf_path")
      .order("created_at", { ascending: false })
  ]);
  const emailById = new Map((users ?? []).map((u) => [u.id, u.email]));
  const consultations = (consultationsRaw ?? []).filter((c) => {
    if (!search) return true;
    const email = (emailById.get(c.user_id) ?? "").toLowerCase();
    return email.includes(search);
  });

  return (
    <div className="space-y-5">
      <form method="get" className="rounded-xl bg-white p-4 shadow-sm">
        <input
          className="w-full rounded border p-2"
          name="q"
          defaultValue={searchParams?.q ?? ""}
          placeholder="Rechercher par email membre"
        />
      </form>

      <form
        action="/api/admin/consultations"
        method="post"
        encType="multipart/form-data"
        className="grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2"
      >
        <select className="rounded border p-2 md:col-span-2" name="userId" required>
          <option value="">Selectionner une utilisatrice</option>
          {(users ?? []).map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
        <select className="rounded border p-2" name="number" defaultValue="1">
          <option value="1">Consultation 1</option>
          <option value="2">Consultation 2</option>
          <option value="3">Consultation 3</option>
        </select>
        <input className="rounded border p-2" name="status" placeholder="Statut" defaultValue="A venir" required />
        <input className="rounded border p-2" type="datetime-local" name="scheduledAt" />
        <input className="rounded border p-2" type="number" name="durationMin" placeholder="Duree (min)" />
        <input className="rounded border p-2 md:col-span-2" type="file" name="notesPdf" accept="application/pdf" />
        <button className="rounded bg-sage px-4 py-2 text-white md:col-span-2">Creer la consultation</button>
      </form>

      <div className="space-y-3">
        {(consultations ?? []).map((consultation) => (
          <article key={consultation.id} className="rounded-xl bg-white p-4 shadow-sm">
            <p className="font-medium">
              Utilisatrice: {emailById.get(consultation.user_id) ?? consultation.user_id} - Consultation {consultation.number}
            </p>
            <p className="text-sm text-dark/70">
              Statut: {consultation.status} | Date: {consultation.scheduled_at ?? "Non planifiee"}
            </p>
            <p className="text-xs">PDF: {consultation.notes_pdf_path ?? "Aucun"}</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <form
                action={`/api/admin/consultations/${consultation.id}`}
                method="post"
                encType="multipart/form-data"
                className="grid gap-2 md:col-span-2 md:grid-cols-4"
              >
                <input type="hidden" name="intent" value="update" />
                <input className="rounded border p-2" name="status" defaultValue={consultation.status} />
                <input className="rounded border p-2" name="scheduledAt" type="datetime-local" />
                <input className="rounded border p-2" name="durationMin" type="number" placeholder="Duree (min)" />
                <input className="rounded border p-2" name="notesPdf" type="file" accept="application/pdf" />
                <button className="rounded border px-3 py-1 text-sm md:col-span-4">Mettre a jour</button>
              </form>
              <form action={`/api/admin/consultations/${consultation.id}`} method="post">
                <input type="hidden" name="intent" value="delete" />
                <button className="rounded border px-3 py-1 text-sm">Supprimer</button>
              </form>
              {consultation.notes_pdf_path ? (
                <a
                  href={`/api/consultations/${consultation.id}/notes`}
                  className="rounded border px-3 py-1 text-sm"
                >
                  Ouvrir PDF (signed URL)
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
