import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const links = [
  ["Dashboard", "/dashboard"],
  ["Videos", "/videos"],
  ["Ebooks", "/ebooks"],
  ["Suivi", "/suivi"],
  ["Calendrier", "/calendrier"],
  ["Consultations", "/consultations"],
  ["Objectifs", "/objectifs"],
  ["Communaute", "/communaute"],
  ["Bons plans", "/bons-plans"],
  ["Profil", "/profil"]
] as const;

export default async function PortalLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
    isAdmin = Boolean(data?.is_admin);
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 p-4">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="text-sm text-dark/80 hover:text-dark">
              {label}
            </Link>
          ))}
          {isAdmin ? (
            <Link href="/admin/deals" className="text-sm font-medium text-gold hover:text-dark">
              Admin
            </Link>
          ) : null}
          <form action={signOutAction} className="ml-auto">
            <button type="submit" className="rounded border px-3 py-1 text-sm">
              Se deconnecter
            </button>
          </form>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
