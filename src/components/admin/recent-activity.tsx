// ============================================================
// RECENT ACTIVITY
// ============================================================

"use client";

import { UserPlus, CheckCircle, XCircle } from "lucide-react";
import { timeAgo, getScoreBg } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  students: Array<{ id: string; name: string | null; email: string; createdAt: Date; status: string }>;
  attempts: Array<{
    id: string;
    user: { name: string | null };
    quiz: { title: string };
    score: number;
    passed: boolean;
    completedAt: Date | null;
  }>;
}

export default function RecentActivity({ students, attempts }: RecentActivityProps) {
  // Merge and sort activities
  const activities = [
    ...students.map((s) => ({
      id: s.id,
      type: "signup" as const,
      title: `${s.name} joined the platform`,
      subtitle: s.email,
      time: s.createdAt,
      meta: null,
    })),
    ...attempts.map((a) => ({
      id: a.id,
      type: a.passed ? "pass" : "fail" as const,
      title: `${a.user.name} completed "${a.quiz.title}"`,
      subtitle: `Score: ${a.score}%`,
      time: a.completedAt || new Date(),
      meta: a.score,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

  const icons = {
    signup: { icon: UserPlus, color: "text-blue-500 bg-blue-500/10" },
    pass: { icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10" },
    fail: { icon: XCircle, color: "text-red-500 bg-red-500/10" },
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-semibold mb-5">Recent Activity</h3>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">No recent activity</div>
      ) : (
        <div className="space-y-1">
          {activities.map((activity) => {
            const { icon: Icon, color } = icons[activity.type];
            return (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{activity.title}</div>
                  <div className="text-xs text-muted-foreground">{activity.subtitle}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {activity.meta !== null && (
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", getScoreBg(activity.meta))}>
                      {activity.meta}%
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{timeAgo(activity.time)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
