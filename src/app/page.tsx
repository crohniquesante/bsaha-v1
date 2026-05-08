import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-wide text-sage">Crohnique Sante</p>
        <h1 className="mt-2 text-4xl font-semibold text-dark">Bsaha - Programme 3 mois</h1>
        <p className="mt-4 max-w-2xl text-dark/80">
          Programme holistique pour les femmes musulmanes atteintes de Crohn:
          micronutrition, medecine prophetique et accompagnement lifestyle.
        </p>
        <div className="mt-6 flex gap-3">
          <form action="/api/stripe/checkout" method="post">
            <input type="hidden" name="mode" value="one_time" />
            <button className="rounded-lg bg-sage px-5 py-3 text-white" type="submit">
              Rejoindre (paiement unique)
            </button>
          </form>
          <form action="/api/stripe/checkout" method="post">
            <input type="hidden" name="mode" value="installment" />
            <button className="rounded-lg bg-gold px-5 py-3 text-white" type="submit">
              Rejoindre (3x)
            </button>
          </form>
          <Link className="rounded-lg border border-gold px-5 py-3 text-gold" href="/ebook-gratuit">
            Telecharger l'ebook gratuit
          </Link>
        </div>
      </section>
    </main>
  );
}
