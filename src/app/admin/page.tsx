// ============================================================
// ADMIN DASHBOARD
// ============================================================

import { Suspense } from "react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/helpers";
import DashboardStats from "@/components/admin/dashboard-stats";
import DashboardCharts from "@/components/admin/dashboard-charts";
import RecentActivity from "@/components/admin/recent-activity";
import TopStudents from "@/components/admin/top-students";
import { Skeleton } from "@/components/ui/skeleton";

async function getDashboardData() {
  const [
    totalStudents,
    totalTrainers,
    totalCourses,
    totalBatches,
    quizAttempts,
    certificates,
    recentStudents,
    topStudents,
    recentAttempts,
  ] = await Promise.all([
    db.user.count({ where: { role: "STUDENT" } }),
    db.user.count({ where: { role: "TRAINER" } }),
    db.course.count(),
    db.batch.count(),
    db.quizAttempt.count({ where: { status: "COMPLETED" } }),
    db.certificate.count(),
    db.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true, status: true },
    }),
    db.student.findMany({
      orderBy: { totalPoints: "desc" },
      take: 5,
      include: { user: { select: { name: true, email: true, image: true } } },
    }),
    db.quizAttempt.findMany({
      where: { status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take: 8,
      include: {
        user: { select: { name: true } },
        quiz: { select: { title: true } },
      },
    }),
  ]);

  // Monthly signups for chart (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlySignups = await db.user.groupBy({
    by: ["createdAt"],
    where: { createdAt: { gte: sixMonthsAgo }, role: "STUDENT" },
    _count: true,
  });

  return {
    stats: { totalStudents, totalTrainers, totalCourses, totalBatches, quizAttempts, certificates },
    recentStudents,
    topStudents,
    recentAttempts,
    monthlySignups,
  };
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Platform overview and key metrics
        </p>
      </div>

      {/* KPI Stats */}
      <Suspense fallback={<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>}>
        <DashboardStats stats={data.stats} />
      </Suspense>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<Skeleton className="h-80 rounded-xl" />}>
            <DashboardCharts attempts={data.recentAttempts} />
          </Suspense>
        </div>
        <Suspense fallback={<Skeleton className="h-80 rounded-xl" />}>
          <TopStudents students={data.topStudents} />
        </Suspense>
      </div>

      {/* Recent activity */}
      <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>
        <RecentActivity students={data.recentStudents} attempts={data.recentAttempts} />
      </Suspense>
    </div>
  );
}
