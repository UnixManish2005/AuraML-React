// ============================================================
// ADMIN REPORTS PAGE
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Users, BookOpen, HelpCircle, TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ReportStats {
  totalStudents: number;
  totalTrainers: number;
  totalCourses: number;
  totalBatches: number;
  totalQuizAttempts: number;
  passRate: number;
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from analytics or aggregate from multiple endpoints
    Promise.all([
      fetch("/api/admin/students").then((r) => r.json()),
      fetch("/api/admin/trainers").then((r) => r.json()),
      fetch("/api/admin/courses").then((r) => r.json()),
      fetch("/api/admin/batches").then((r) => r.json()),
    ])
      .then(([students, trainers, courses, batches]) => {
        setStats({
          totalStudents: students.users?.length ?? 0,
          totalTrainers: trainers.trainers?.length ?? 0,
          totalCourses: courses.courses?.length ?? 0,
          totalBatches: batches.batches?.length ?? 0,
          totalQuizAttempts: 0,
          passRate: 0,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const reportCards = [
    {
      icon: Users,
      label: "Student Enrollment Report",
      description: "Full list of enrolled students with batch and status info",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      icon: BookOpen,
      label: "Course Completion Report",
      description: "Progress tracking across all active courses and modules",
      color: "text-violet-500 bg-violet-500/10",
    },
    {
      icon: HelpCircle,
      label: "Quiz Performance Report",
      description: "Scores, pass/fail rates and attempts per student",
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      icon: TrendingUp,
      label: "Placement Report",
      description: "Job applications, interview outcomes and offer status",
      color: "text-emerald-500 bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Export and review platform analytics — generated as of {formatDate(new Date().toISOString())}
        </p>
      </div>

      {/* Summary stats */}
      {!loading && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Students", value: stats.totalStudents, icon: Users },
            { label: "Trainers", value: stats.totalTrainers, icon: Users },
            { label: "Courses", value: stats.totalCourses, icon: BookOpen },
            { label: "Batches", value: stats.totalBatches, icon: BookOpen },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Report type cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {reportCards.map((r) => (
          <div
            key={r.label}
            className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 hover:border-border/80 transition-all"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${r.color}`}>
              <r.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{r.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{r.description}</div>
            </div>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs hover:bg-muted transition-colors flex-shrink-0"
              onClick={() => alert("Export feature — connect to your data export API")}
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        ))}
      </div>

      {/* Placeholder notice */}
      <div className="bg-muted/50 border border-border rounded-xl p-5 flex items-start gap-3">
        <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-medium text-sm">Export Integration</div>
          <p className="text-xs text-muted-foreground mt-1">
            Connect the Export buttons to your backend CSV/PDF generation endpoints under{" "}
            <code className="font-mono text-xs">/api/admin/reports</code>. Each report type can stream a
            download response using <code className="font-mono text-xs">Content-Disposition: attachment</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
