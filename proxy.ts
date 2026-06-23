import { NextRequest, NextResponse } from "next/server";
import { JWT_COOKIE_NAME, verifyToken } from "@/lib/auth";

// Routes anyone (logged in or not) can hit
const PUBLIC_ROUTES = ["/login", "/signup"];

// Public routes that should bounce a logged-in user away (to /dashboard)
const AUTH_ONLY_PUBLIC_ROUTES = ["/login", "/signup"];

// Routes that require a specific role on top of being logged in
// ⚠️ role string casing must match what you store, e.g. "ADMIN" if your
// seed/signup writes uppercase roles
const ROLE_PROTECTED_ROUTES: { prefix: string; role: string }[] = [
  { prefix: "/admin", role: "ADMIN" },
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(JWT_COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Not logged in
  if (!session && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    const res = NextResponse.redirect(loginUrl);

    if (token) res.cookies.delete(JWT_COOKIE_NAME);
    return res;
  }

  // Already logged in → prevent login/signup access
  if (session && AUTH_ONLY_PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute && session && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // pass headers
  const res = NextResponse.next();

  if (session) {
    res.headers.set("x-user-id", String(session.userId));
    res.headers.set("x-user-role", session.role);
  }

  return res;
}
export const config = {
  matcher: [
    /*
     * Run on everything except:
     * - /api routes
     * - Next.js internals (_next/static, _next/image)
     * - common static files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
