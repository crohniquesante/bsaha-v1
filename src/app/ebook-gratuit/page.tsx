type Props = {
  searchParams?: { sent?: string; error?: string };
};

function banner(searchParams?: Props["searchParams"]) {
  if (searchParams?.sent === "1") {
    return (
      <p className="rounded-lg border border-sage/50 bg-sage/10 px-4 py-3 text-sm text-dark">
        Merci. Verifiez votre boite e-mail : le lien de telechargement vous a ete envoye (pensez aux courriers indesirables).
      </p>
    );
  }
  const code = searchParams?.error;
  const msg =
    code === "invalid"
      ? "Adresse e-mail invalide."
      : code === "config"
        ? "Configuration serveur incomplet (ebook / stockage)."
        : code === "server"
          ? "Une erreur est survenue. Reessayez plus tard."
          : null;
  if (!msg) return null;
  return (
    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
      {msg}
    </p>
  );
}

export default function EbookGratuitPage({ searchParams }: Props) {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-semibold">Ebook gratuit : Stopper la crise</h1>
      <p className="mt-2 text-dark/80">
        Laissez votre e-mail pour recevoir le PDF « Stopper la crise de Crohn » (lien de telechargement securise par e-mail).
      </p>
      <div className="mt-4">{banner(searchParams)}</div>
      <form action="/api/lead-magnet/ebook" method="post" className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium">
          Votre e-mail
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="vous@exemple.com"
            className="mt-1 w-full rounded-lg border border-dark/15 p-3"
          />
        </label>
        <button className="rounded-lg bg-sage px-5 py-3 text-white" type="submit">
          Recevoir le PDF
        </button>
      </form>
    </main>
  );
}
