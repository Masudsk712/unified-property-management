// ============================================================================
// Next.js Middleware — Route protection for authenticated pages
// Uses Auth.js v5 `auth()` for session verification.
// ============================================================================

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that require authentication
const protectedPaths = ["/dashboard", "/properties", "/tenants", "/maintenance", "/amenities", "/bookings", "/settings"];

// Public-only paths (redirect to dashboard if already logged in)
const authPaths = ["/login", "/register"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth();
  const isLoggedIn = !!session?.user;

  console.log("[MIDDLEWARE] Path:", pathname, "| Authenticated:", isLoggedIn);
  if (isLoggedIn) {
    console.log("[MIDDLEWARE] Session user:", { id: session?.user?.id, email: session?.user?.email });
  }

  // Redirect authenticated users away from login/register
  if (isLoggedIn && authPaths.some((p) => pathname.startsWith(p))) {
    console.log("[MIDDLEWARE] Redirecting authenticated user from auth page to /dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users from protected routes
  if (!isLoggedIn && protectedPaths.some((p) => pathname.startsWith(p))) {
    const callbackUrl = encodeURIComponent(pathname);
    console.log("[MIDDLEWARE] Redirecting unauthenticated user to /login, callbackUrl:", callbackUrl);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};