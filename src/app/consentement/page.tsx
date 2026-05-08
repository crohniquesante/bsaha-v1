import { signConsentAction } from "@/app/actions/consent";

export default function ConsentementPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <form action={signConsentAction} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Decharge medicale</h1>
        <p className="text-dark/80">
          Bsaha est un programme d&apos;accompagnement vers le mieux-etre. Il
          ne constitue pas un acte medical et ne remplace pas l&apos;avis d&apos;un
          professionnel de sante qualifie.
        </p>
        <label className="flex items-start gap-3">
          <input name="accepted" type="checkbox" required className="mt-1" />
          <span>J&apos;accepte et j&apos;accede au programme.</span>
        </label>
        <button className="rounded-lg bg-sage px-5 py-3 text-white" type="submit">
          J&apos;accepte et accede au programme
        </button>
      </form>
    </main>
  );
}
