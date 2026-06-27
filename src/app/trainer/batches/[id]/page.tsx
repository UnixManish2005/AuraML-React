// ============================================================
// NEXT.JS MIDDLEWARE - Route Protection
// ============================================================

import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/auth/login", "/auth/register", "/auth/forgot-password", "/api/auth"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // ── API routes handle their own authentication ──
  // Never redirect API routes — they return JSON 401 when unauthenticated.
  // Redirecting them sends an HTML login page which breaks res.json() on the client.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Allow public page paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const role = session.user?.role;

  // Role-based path protection (page routes only)
  if (pathname.startsWith("/admin") && !["ADMIN", "SUPER_ADMIN"].includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/trainer") && !["TRAINER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/student") && role !== "STUDENT") {
    if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
