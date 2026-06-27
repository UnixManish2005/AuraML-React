// ============================================================
// NEXT.JS MIDDLEWARE - Route Protection
// ============================================================

import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/auth/login", "/auth/register", "/auth/forgot-password", "/api/auth", "/auth/change-password"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Force password change on first login
// AFTER — only forces TRAINER role to change password
if (
  session.user?.mustChangePassword &&
  session.user?.role === "TRAINER" &&
  pathname !== "/auth/change-password"
) {
  return NextResponse.redirect(new URL("/auth/change-password", req.url));
}

  const role = session.user?.role;

  // Role-based path protection
  if (pathname.startsWith("/admin") && !["ADMIN", "SUPER_ADMIN"].includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/trainer") && !["TRAINER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/student") && role !== "STUDENT") {
    // Admins and trainers can also view student portal for testing
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