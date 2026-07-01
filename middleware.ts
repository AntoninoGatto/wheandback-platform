import createMiddleware from "next-intl/middleware";
import { routing } from "./src/lib/i18n/routing";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const intlMiddleware = createMiddleware(routing);

const protectedRoutes: Record<string, string[]> = {
  "/dashboard": ["customer", "seller", "admin"],
  "/seller": ["seller", "admin"],
  "/admin": ["admin"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix to check protected routes
  const pathnameWithoutLocale = pathname.replace(/^\/(it|en|fr|es|de)/, "");

  const isProtected = Object.keys(protectedRoutes).some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  if (isProtected) {
    const response = NextResponse.next();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const locale = pathname.split("/")[1] || "it";
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
