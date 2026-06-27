// ============================================================
// UTILITY FUNCTIONS
// ============================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---- DATE UTILS ----
export function formatDate(date: Date | string) {
  return format(new Date(date), "MMM dd, yyyy");
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "MMM dd, yyyy HH:mm");
}

export function timeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// ---- STRING UTILS ----
export function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export function truncate(str: string, length: number) {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ---- NUMBER UTILS ----
export function formatNumber(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatSeconds(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function percentage(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// ---- COLOR UTILS ----
export function getScoreColor(score: number) {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  return "text-red-500";
}

export function getScoreBg(score: number) {
  if (score >= 80) return "bg-green-100 text-green-800";
  if (score >= 60) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

export function getBatchStatusColor(status: string) {
  const colors: Record<string, string> = {
    UPCOMING: "bg-blue-100 text-blue-800",
    ACTIVE: "bg-green-100 text-green-800",
    COMPLETED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getUserStatusColor(status: string) {
  const colors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    INACTIVE: "bg-gray-100 text-gray-800",
    SUSPENDED: "bg-red-100 text-red-800",
    PENDING: "bg-yellow-100 text-yellow-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

// ---- ROLE UTILS ----
export function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    TRAINER: "Trainer",
    STUDENT: "Student",
  };
  return labels[role] || role;
}

export function getRoleBadgeColor(role: string) {
  const colors: Record<string, string> = {
    SUPER_ADMIN: "bg-red-100 text-red-800",
    ADMIN: "bg-purple-100 text-purple-800",
    TRAINER: "bg-blue-100 text-blue-800",
    STUDENT: "bg-green-100 text-green-800",
  };
  return colors[role] || "bg-gray-100 text-gray-800";
}

// ---- FILE UTILS ----
export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function getFileExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() || "";
}

// ---- CERTIFICATE ID ----
export function generateCertificateId() {
  const prefix = "CERT";
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
}

// ---- PAGINATION ----
export function getPaginationRange(current: number, total: number, delta = 2) {
  const range = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  if (left > 2) range.push(-1); // ellipsis
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push(-1); // ellipsis
  if (total > 1) range.push(total);

  return range;
}

// ---- Safe JSON response parser ----
// Prevents "Unexpected end of JSON input" when the server returns
// a redirect (e.g. middleware sending /auth/login) or an empty body.
export async function safeJson<T = Record<string, unknown>>(
  res: Response
): Promise<T> {
  const text = await res.text();
  if (!text) throw new Error(`Empty response (${res.status})`);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Unexpected server response (${res.status})`);
  }
}
