import Link from "next/link";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/server/auth";

export default async function ConsultationsPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: consultations } = await supabase
    .from("consultations")
    .select("id,number,status,scheduled_at,duration_min,notes_pdf_path")
    .eq("user_id", user.id)
    .order("number", { ascending: true });

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Consultations</h1>
      {env.NEXT_PUBLIC_CALENDLY_URL ? (
        <p className="rounded-xl bg-white p-4 shadow-sm text-sm text-dark/80">
          Planifier un creneau:{" "}
          <Link href={env.NEXT_PUBLIC_CALENDLY_URL} className="font-medium text-sage underline" target="_blank" rel="noreferrer">
            Ouvrir Calendly
          </Link>
        </p>
      ) : null}
      <div className="space-y-3">
        {(consultations ?? []).map((consultation) => (
          <article key={consultation.id} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="font-medium">Consultation {consultation.number}</p>
            <p className="text-sm text-dark/70">
              Statut: {consultation.status} | Date: {consultation.scheduled_at ?? "Non planifiee"} | Duree: {consultation.duration_min ?? "-"} min
            </p>
            {consultation.notes_pdf_path ? (
              <Link
                href={`/api/consultations/${consultation.id}/notes`}
                className="mt-3 inline-block rounded border border-sage px-3 py-1 text-sm text-sage"
              >
                Ouvrir mon bilan PDF (lien temporaire)
              </Link>
            ) : (
              <p className="mt-2 text-sm text-dark/60">Bilan PDF non disponible.</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
