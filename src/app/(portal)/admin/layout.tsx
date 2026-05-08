import Link from "next/link";
import { requireAdmin } from "@/server/auth";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Administration</h1>
      <nav className="flex gap-3 text-sm">
        <Link href="/admin/deals" className="rounded border px-3 py-1">
          Deals
        </Link>
        <Link href="/admin/consultations" className="rounded border px-3 py-1">
          Consultations
        </Link>
        <Link href="/admin/lives" className="rounded border px-3 py-1">
          Lives
        </Link>
      </nav>
      {children}
    </div>
  );
}
