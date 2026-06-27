// ============================================================
// DASHBOARD STATS - KPI Cards
// ============================================================

"use client";

import { Users, UserCheck, BookOpen, Layers, Trophy, ClipboardList, TrendingUp, TrendingDown } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface StatsProps {
  stats: {
    totalStudents: number;
    totalTrainers: number;
    totalCourses: number;
    totalBatches: number;
    quizAttempts: number;
    certificates: number;
  };
}

const statConfig = [
  {
    key: "totalStudents",
    label: "Total Students",
    icon: Users,
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    growth: 12.5,
  },
  {
    key: "totalTrainers",
    label: "Total Trainers",
    icon: UserCheck,
    color: "from-violet-500 to-violet-600",
    bg: "bg-violet-500/10",
    iconColor: "text-violet-500",
    growth: 4.2,
  },
  {
    key: "totalCourses",
    label: "Total Courses",
    icon: BookOpen,
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    growth: 8.1,
  },
  {
    key: "totalBatches",
    label: "Active Batches",
    icon: Layers,
    color: "from-amber-500 to-amber-600",
    bg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    growth: -2.3,
  },
  {
    key: "quizAttempts",
    label: "Quiz Attempts",
    icon: ClipboardList,
    color: "from-cyan-500 to-cyan-600",
    bg: "bg-cyan-500/10",
    iconColor: "text-cyan-500",
    growth: 23.8,
  },
  {
    key: "certificates",
    label: "Certificates Issued",
    icon: Trophy,
    color: "from-rose-500 to-rose-600",
    bg: "bg-rose-500/10",
    iconColor: "text-rose-500",
    growth: 15.6,
  },
];

export default function DashboardStats({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statConfig.map((config) => {
        const value = stats[config.key as keyof typeof stats];
        const isPositive = config.growth >= 0;

        return (
          <div
            key={config.key}
            className="stat-card bg-card border border-border rounded-xl p-5"
          >
            {/* Icon */}
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4", config.bg)}>
              <config.icon className={cn("w-5 h-5", config.iconColor)} />
            </div>

            {/* Value */}
            <div className="text-2xl font-bold mb-1">{formatNumber(value)}</div>

            {/* Label */}
            <div className="text-xs text-muted-foreground mb-3">{config.label}</div>

            {/* Growth indicator */}
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              isPositive ? "text-emerald-500" : "text-red-500"
            )}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(config.growth)}% this month
            </div>
          </div>
        );
      })}
    </div>
  );
}
