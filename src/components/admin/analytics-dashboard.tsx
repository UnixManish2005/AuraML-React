// ============================================================
// ANALYTICS DASHBOARD COMPONENT
// ============================================================

"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, Users, BookOpen, Award, BarChart3, Target } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface AnalyticsData {
  overview: {
    totalStudents: number;
    totalTrainers: number;
    totalCourses: number;
    totalBatches: number;
    quizAttempts: number;
    certificates: number;
    passRate: number;
    avgScore: number;
  };
  scoreRanges: { range: string; count: number }[];
}

const MONTHLY_ACTIVITY = [
  { month: "Jul", logins: 342, quizzes: 145, completions: 23 },
  { month: "Aug", logins: 478, quizzes: 198, completions: 34 },
  { month: "Sep", logins: 523, quizzes: 234, completions: 41 },
  { month: "Oct", logins: 612, quizzes: 312, completions: 58 },
  { month: "Nov", logins: 589, quizzes: 289, completions: 52 },
  { month: "Dec", logins: 734, quizzes: 378, completions: 67 },
];

const COURSE_COMPLETION = [
  { name: "Python Basics", completion: 78, students: 234 },
  { name: "ML Fundamentals", completion: 65, students: 189 },
  { name: "Deep Learning", completion: 52, students: 145 },
  { name: "Data Science", completion: 71, students: 201 },
  { name: "NLP Basics", completion: 44, students: 98 },
];

const RADIAL_DATA = [
  { name: "Pass Rate", value: 0, fill: "#10b981" },
  { name: "Avg Score", value: 0, fill: "#3b82f6" },
];

export default function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const { overview, scoreRanges } = data;

  const kpis = [
    { label: "Active Students", value: overview.totalStudents, icon: Users, color: "text-blue-500 bg-blue-500/10", trend: "+12%" },
    { label: "Pass Rate", value: `${overview.passRate}%`, icon: Target, color: "text-emerald-500 bg-emerald-500/10", trend: "+5%" },
    { label: "Avg Quiz Score", value: `${overview.avgScore}%`, icon: BarChart3, color: "text-violet-500 bg-violet-500/10", trend: "+3%" },
    { label: "Certificates Issued", value: overview.certificates, icon: Award, color: "text-amber-500 bg-amber-500/10", trend: "+18%" },
    { label: "Active Courses", value: overview.totalCourses, icon: BookOpen, color: "text-cyan-500 bg-cyan-500/10", trend: "+2%" },
    { label: "Total Batches", value: overview.totalBatches, icon: Users, color: "text-rose-500 bg-rose-500/10", trend: "Active" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-5">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", kpi.color)}>
              <kpi.icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold">{typeof kpi.value === "number" ? formatNumber(kpi.value) : kpi.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{kpi.label}</div>
            <div className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {kpi.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly activity */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-5">Monthly Platform Activity</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={MONTHLY_ACTIVITY} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }}
                labelStyle={{ color: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <Bar dataKey="logins" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Logins" />
              <Bar dataKey="quizzes" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Quizzes" />
              <Bar dataKey="completions" fill="#10b981" radius={[4, 4, 0, 0]} name="Completions" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-500" /> Logins</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-violet-600" /> Quizzes</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500" /> Completions</div>
          </div>
        </div>

        {/* Score distribution */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-5">Quiz Score Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={scoreRanges} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="range" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={50} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Students">
                {scoreRanges.map((_, i) => (
                  <Cell key={i} fill={["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e"][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Course completion table */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-5">Course Completion Rates</h3>
        <div className="space-y-4">
          {COURSE_COMPLETION.map((course) => (
            <div key={course.name} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium truncate">{course.name}</span>
                  <span className="text-muted-foreground ml-2">{course.students} students</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      course.completion >= 70 ? "bg-emerald-500" :
                      course.completion >= 50 ? "bg-amber-500" : "bg-red-500"
                    )}
                    style={{ width: `${course.completion}%` }}
                  />
                </div>
              </div>
              <div className={cn(
                "text-sm font-bold w-12 text-right",
                course.completion >= 70 ? "text-emerald-500" :
                course.completion >= 50 ? "text-amber-500" : "text-red-500"
              )}>
                {course.completion}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
