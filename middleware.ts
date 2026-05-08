import { NextResponse, type NextRequest } from "next/server";
import { CookieOptions, createServerClient } from "@supabase/ssr";

const protectedPaths = [
  "/dashboard",
  "/videos",
  "/ebooks",
  "/suivi",
  "/calendrier",
  "/consultations",
  "/objectifs",
  "/communaute",
  "/bons-plans",
  "/profil",
  "/admin"
];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }

  if (isProtected && user) {
    const { data: profile } = await supabase
      .from("users")
      .select("consent_signed_at,is_admin")
      .eq("id", user.id)
      .single();
    if (!profile?.consent_signed_at && pathname !== "/consentement") {
      return NextResponse.redirect(new URL("/consentement", request.url));
    }
    if (pathname.startsWith("/admin") && !profile?.is_admin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/webhooks/stripe|api/cron/).*)"]
};
