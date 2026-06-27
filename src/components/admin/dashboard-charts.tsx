// ============================================================
// DASHBOARD CHARTS
// ============================================================

"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const quizData = [
  { month: "Jul", attempts: 145, passed: 98, failed: 47 },
  { month: "Aug", attempts: 198, passed: 145, failed: 53 },
  { month: "Sep", attempts: 234, passed: 178, failed: 56 },
  { month: "Oct", attempts: 312, passed: 245, failed: 67 },
  { month: "Nov", attempts: 289, passed: 220, failed: 69 },
  { month: "Dec", attempts: 378, passed: 298, failed: 80 },
];

const enrollmentData = [
  { month: "Jul", students: 42 },
  { month: "Aug", students: 67 },
  { month: "Sep", students: 89 },
  { month: "Oct", students: 134 },
  { month: "Nov", students: 112 },
  { month: "Dec", students: 156 },
];

const courseData = [
  { name: "Python", value: 35, color: "#3b82f6" },
  { name: "ML", value: 28, color: "#7c3aed" },
  { name: "Deep Learning", value: 18, color: "#06b6d4" },
  { name: "Data Science", value: 12, color: "#10b981" },
  { name: "Other", value: 7, color: "#f59e0b" },
];

interface DashboardChartsProps {
  attempts: Array<{
    user: { name: string | null };
    quiz: { title: string };
    score: number;
    passed: boolean;
    completedAt: Date | null;
  }>;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-xl">
        <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardCharts({ attempts }: DashboardChartsProps) {
  return (
    <div className="space-y-6">
      {/* Quiz Performance Chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold">Quiz Performance</h3>
            <p className="text-sm text-muted-foreground">Monthly attempts and pass rates</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" />Attempts</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500" />Passed</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" />Failed</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={quizData}>
            <defs>
              <linearGradient id="attempts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="passed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="attempts" stroke="#3b82f6" strokeWidth={2} fill="url(#attempts)" name="Attempts" />
            <Area type="monotone" dataKey="passed" stroke="#10b981" strokeWidth={2} fill="url(#passed)" name="Passed" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Enrollment Trend */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Monthly Enrollments</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="students" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Course Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={courseData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {courseData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {courseData.map((c) => (
              <div key={c.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                {c.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
