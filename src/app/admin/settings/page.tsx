// ============================================================
// ADMIN SETTINGS PAGE
// ============================================================

"use client";

import { useState } from "react";
import { Settings, Bell, Shield, Database, Palette } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [notifications, setNotifications] = useState({
    newStudent: true,
    quizCompleted: false,
    lowAttendance: true,
    jobPosted: true,
  });

  function handleSave() {
    toast.success("Settings saved");
  }

  const sections = [
    {
      icon: Bell,
      title: "Notifications",
      description: "Control which events trigger admin alerts",
      content: (
        <div className="space-y-3">
          {[
            { key: "newStudent", label: "New student registration" },
            { key: "quizCompleted", label: "Quiz submission" },
            { key: "lowAttendance", label: "Low attendance alert" },
            { key: "jobPosted", label: "Job application received" },
          ].map((item) => (
            <label key={item.key} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm">{item.label}</span>
              <button
                onClick={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    [item.key]: !prev[item.key as keyof typeof prev],
                  }))
                }
                className={`relative w-9 h-5 rounded-full transition-colors ${
                  notifications[item.key as keyof typeof notifications]
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    notifications[item.key as keyof typeof notifications]
                      ? "translate-x-4"
                      : ""
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
      ),
    },
    {
      icon: Shield,
      title: "Security",
      description: "Auth and access control settings",
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Powered by NextAuth.js — configure providers in <code className="font-mono text-xs">src/lib/auth/config.ts</code>.</p>
          <p>Role-based middleware is active in <code className="font-mono text-xs">src/middleware.ts</code>.</p>
        </div>
      ),
    },
    {
      icon: Database,
      title: "Database",
      description: "Prisma ORM + PostgreSQL",
      content: (
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Schema: <code className="font-mono text-xs">prisma/schema.prisma</code></p>
          <p>Run <code className="font-mono text-xs">npx prisma studio</code> to browse your data.</p>
          <p>Seed: <code className="font-mono text-xs">npx prisma db seed</code></p>
        </div>
      ),
    },
    {
      icon: Palette,
      title: "Appearance",
      description: "Theme and branding",
      content: (
        <div className="text-sm text-muted-foreground">
          <p>Theme tokens are in <code className="font-mono text-xs">src/styles/globals.css</code>. Dark/light toggle is handled by the ThemeProvider in your layout.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform configuration and preferences</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {sections.map((s) => (
          <div key={s.title} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <s.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium text-sm">{s.title}</div>
                <div className="text-xs text-muted-foreground">{s.description}</div>
              </div>
            </div>
            {s.content}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Settings className="w-4 h-4" /> Save Settings
        </button>
      </div>
    </div>
  );
}
