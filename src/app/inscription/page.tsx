import { signUpAction } from "@/app/actions/auth";

type Props = {
  searchParams?: {
    error?: string;
  };
};

export default function InscriptionPage({ searchParams }: Props) {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <form action={signUpAction} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Finaliser votre inscription</h1>
        {searchParams?.error === "signup" ? (
          <p className="rounded bg-cream p-2 text-sm">
            Impossible de creer le compte pour le moment. Reessayez.
          </p>
        ) : null}
        <input className="w-full rounded-lg border p-3" type="email" name="email" required placeholder="Email" />
        <input className="w-full rounded-lg border p-3" type="password" name="password" required placeholder="Mot de passe" minLength={8} />
        <button className="rounded-lg bg-sage px-5 py-3 text-white" type="submit">Creer mon compte</button>
      </form>
    </main>
  );
}
