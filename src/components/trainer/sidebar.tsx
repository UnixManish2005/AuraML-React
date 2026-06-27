// ============================================================
// TRAINER SIDEBAR
// ============================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Brain, LayoutDashboard, Layers, HelpCircle, BookOpen, BarChart3, LogOut, ChevronRight, Menu, X ,Settings} from "lucide-react";
import { cn, initials } from "@/lib/utils";


const navItems = [
  { label: "Dashboard", href: "/trainer", icon: LayoutDashboard },
  { label: "My Batches", href: "/trainer/batches", icon: Layers },
  { label: "Quizzes", href: "/trainer/quizzes", icon: HelpCircle },
  { label: "Content", href: "/trainer/content", icon: BookOpen },
  { label: "Analytics", href: "/trainer/analytics", icon: BarChart3 },
  { label: "Settings", href: "/trainer/settings", icon: Settings },
];

export default function TrainerSidebar({ user }: { user: { name?: string | null; role: string } }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const Content = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
          <span className="text-lg">🐬</span>
        </div>
        <div>
          <div className="font-bold text-sm">AuraML</div>
          <div className="text-xs text-muted-foreground">Trainer Portal</div>
        </div>
      </div>

      <nav className="flex-1 py-3 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/trainer" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
            {initials(user.name || "T")}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs text-muted-foreground">Trainer</div>
          </div>
        </div>
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
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
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
