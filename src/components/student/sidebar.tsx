// ============================================================
// STUDENT SIDEBAR
// ============================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Brain, LayoutDashboard, BookOpen, HelpCircle, FileText,
  Code2, Award, Briefcase, MessageCircle, Beaker, LogOut,
  ChevronRight, Menu, X, Flame, Star
} from "lucide-react";
import { cn, initials } from "@/lib/utils";

interface StudentSidebarProps {
  user: { name?: string | null; email?: string | null };
}

const navItems = [
  { label: "Dashboard", href: "/student", icon: LayoutDashboard },
  { label: "My Courses", href: "/student/courses", icon: BookOpen },
  { label: "Quizzes", href: "/student/quizzes", icon: HelpCircle },
  { label: "AI Tutor", href: "/student/ai-tutor", icon: MessageCircle },
  { label: "ML Lab", href: "/student/lab", icon: Beaker },
  { label: "Resume Builder", href: "/student/resume", icon: FileText },
  { label: "Projects", href: "/student/projects", icon: Code2 },
  { label: "Certificates", href: "/student/certificates", icon: Award },
  { label: "Jobs & Internships", href: "/student/jobs", icon: Briefcase },
];

export default function StudentSidebar({ user }: StudentSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const Content = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
          <span className="text-lg">🐬</span>
        </div>
        <span className="font-bold text-sm">AuraML</span>
      </div>

      {/* Student quick stats */}
      <div className="mx-3 my-3 p-3 rounded-xl bg-gradient-to-br from-blue-600/10 to-violet-600/10 border border-blue-500/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
            {initials(user.name || "S")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{user.name}</div>
            <div className="text-xs text-muted-foreground">Student</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1 text-amber-500">
            <Flame className="w-3 h-3" />
            <span>7 day streak</span>
          </div>
          <div className="flex items-center gap-1 text-blue-400">
            <Star className="w-3 h-3" />
            <span>1,240 pts</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-2 px-3 overflow-y-auto scrollbar-thin">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/student" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="fixed top-4 left-4 z-40 lg:hidden p-2 rounded-lg bg-card border border-border">
        <Menu className="w-4 h-4" />
      </button>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1 rounded hover:bg-muted">
              <X className="w-4 h-4" />
            </button>
            <Content />
          </div>
        </div>
      )}
      <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[260px] bg-card border-r border-border flex-col z-30">
        <Content />
      </div>
    </>
  );
}
