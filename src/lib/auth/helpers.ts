// ============================================================
// AUTH HELPERS - Role Guards & Permission Checks
// ============================================================

import { auth } from "./config";
import { redirect } from "next/navigation";
import type { Role } from "@/types";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  return user;
}

export async function requireRole(...roles: Role[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role as Role)) {
    redirect("/unauthorized");
  }
  return user;
}

export async function requireAdmin() {
  return requireRole("ADMIN", "SUPER_ADMIN");
}

export async function requireTrainer() {
  return requireRole("ADMIN", "SUPER_ADMIN", "TRAINER");
}

export async function requireStudent() {
  return requireRole("STUDENT");
}

// ---- CLIENT SIDE PERMISSION HELPERS ----

export function canManageStudents(role: string) {
  return ["ADMIN", "SUPER_ADMIN"].includes(role);
}

export function canManageTrainers(role: string) {
  return ["ADMIN", "SUPER_ADMIN"].includes(role);
}

export function canCreateQuiz(role: string) {
  return ["ADMIN", "SUPER_ADMIN", "TRAINER"].includes(role);
}

export function canViewAnalytics(role: string) {
  return ["ADMIN", "SUPER_ADMIN", "TRAINER"].includes(role);
}

export function getDashboardPath(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "/admin";
    case "TRAINER":
      return "/trainer";
    case "STUDENT":
      return "/student";
    default:
      return "/";
  }
}
