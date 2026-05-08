import { resetPasswordAction, signInAction } from "@/app/actions/auth";

type Props = {
  searchParams?: {
    error?: string;
    reset?: string;
  };
};

function getMessage(error?: string, reset?: string) {
  if (reset === "sent") return "Un email de reinitialisation a ete envoye.";
  if (error === "signin") return "Email ou mot de passe invalide.";
  if (error === "reset") return "Impossible d'envoyer l'email de reinitialisation.";
  return null;
}

export default function ConnexionPage({ searchParams }: Props) {
  const message = getMessage(searchParams?.error, searchParams?.reset);
  return (
    <main className="mx-auto grid max-w-3xl gap-6 p-8 md:grid-cols-2">
      <form action={signInAction} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Connexion</h1>
        {message ? <p className="rounded bg-cream p-2 text-sm">{message}</p> : null}
        <input className="w-full rounded-lg border p-3" type="email" name="email" required placeholder="Email" />
        <input className="w-full rounded-lg border p-3" type="password" name="password" required placeholder="Mot de passe" />
        <button className="rounded-lg bg-sage px-5 py-3 text-white" type="submit">Se connecter</button>
      </form>
      <form action={resetPasswordAction} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Mot de passe oublie</h2>
        <input className="w-full rounded-lg border p-3" type="email" name="email" required placeholder="Email" />
        <button className="rounded-lg border border-sage px-5 py-3 text-sage" type="submit">Envoyer le lien</button>
      </form>
    </main>
  );
}
