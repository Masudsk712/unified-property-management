// ============================================================================
// Next.js Middleware — Route protection + Security Headers
// ============================================================================

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Paths that require authentication
const protectedPaths = ["/dashboard", "/properties", "/tenants", "/maintenance", "/amenities", "/bookings", "/settings"];

// Public-only paths (redirect to dashboard if already logged in)
const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];

// Role-based dashboard redirects
const ROLE_DASHBOARD_MAP: Record<string, string> = {
  admin: "/dashboard/admin",
  manager: "/dashboard/manager",
  tenant: "/dashboard/tenant",
};

// ── CSP Directives ─────────────────────────────────────────────────────────
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self'",
  "connect-src 'self' https://*.mongodb.net https://api.cloudinary.com wss:",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  IS_PRODUCTION ? "upgrade-insecure-requests" : "",
].filter(Boolean).join("; ");

// ── Security Headers ───────────────────────────────────────────────────────
function applySecurityHeaders(response: NextResponse): void {
  const headers = response.headers;

  headers.set("X-DNS-Prefetch-Control", "on");
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-XSS-Protection", "1; mode=block");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  headers.set("Content-Security-Policy", CSP_DIRECTIVES);
  headers.set("X-Permitted-Cross-Domain-Policies", "none");
  headers.set("Cross-Origin-Embedder-Policy", "unsafe-none");
  headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = uuidv4();
  const startTime = Date.now();

  const session = await auth();
  const isLoggedIn = !!session?.user;
  const userRole = (session?.user as any)?.role as string | undefined;

  let response: NextResponse;

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && authPaths.some((p) => pathname.startsWith(p))) {
    const redirectUrl = ROLE_DASHBOARD_MAP[userRole ?? "tenant"] || "/dashboard/tenant";
    response = NextResponse.redirect(new URL(redirectUrl, request.url));
  }
  // Role-based redirect from generic /dashboard to role-specific dashboard
  else if (isLoggedIn && (pathname === "/dashboard" || pathname === "/dashboard/")) {
    const redirectUrl = ROLE_DASHBOARD_MAP[userRole ?? "tenant"] || "/dashboard/tenant";
    response = NextResponse.redirect(new URL(redirectUrl, request.url));
  }
  // Protect role-specific dashboard routes
  else if (isLoggedIn && pathname.startsWith("/dashboard/")) {
    const requestedRole = pathname.split("/")[2];
    if (requestedRole && userRole && requestedRole !== userRole) {
      const redirectUrl = ROLE_DASHBOARD_MAP[userRole] || "/dashboard/tenant";
      response = NextResponse.redirect(new URL(redirectUrl, request.url));
    } else {
      response = NextResponse.next();
    }
  }
  // Redirect unauthenticated users from protected routes
  else if (!isLoggedIn && protectedPaths.some((p) => pathname.startsWith(p))) {
    const callbackUrl = encodeURIComponent(pathname);
    response = NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
    );
  }
  // Default: continue
  else {
    response = NextResponse.next();
  }

  // Apply security headers to all responses
  applySecurityHeaders(response);

  // Add request ID header for tracing
  response.headers.set("X-Request-ID", requestId);

  // Add server timing header (non-sensitive)
  response.headers.set("Server-Timing", `total;dur=${Date.now() - startTime}`);

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|manifest.json).*)",
  ],
};
