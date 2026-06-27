// ============================================================
// ADMIN ANALYTICS PAGE
// ============================================================

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/helpers";
import AnalyticsDashboard from "@/components/admin/analytics-dashboard";

async function getAnalyticsData() {
  const [
    totalStudents,
    totalTrainers,
    totalCourses,
    totalBatches,
    quizAttempts,
    certificates,
    passedAttempts,
    recentAttempts,
  ] = await Promise.all([
    db.user.count({ where: { role: "STUDENT", status: "ACTIVE" } }),
    db.user.count({ where: { role: "TRAINER" } }),
    db.course.count({ where: { isPublished: true } }),
    db.batch.count({ where: { status: "ACTIVE" } }),
    db.quizAttempt.count({ where: { status: "COMPLETED" } }),
    db.certificate.count(),
    db.quizAttempt.count({ where: { status: "COMPLETED", passed: true } }),
    db.quizAttempt.findMany({
      where: { status: "COMPLETED" },
      select: { percentage: true, passed: true, completedAt: true },
      orderBy: { completedAt: "desc" },
      take: 100,
    }),
  ]);

  const passRate = quizAttempts > 0 ? Math.round((passedAttempts / quizAttempts) * 100) : 0;
  const avgScore = recentAttempts.length > 0
    ? Math.round(recentAttempts.reduce((s, a) => s + a.percentage, 0) / recentAttempts.length)
    : 0;

  // Score distribution
  const scoreRanges = [
    { range: "0-20%", count: recentAttempts.filter((a) => a.percentage < 20).length },
    { range: "20-40%", count: recentAttempts.filter((a) => a.percentage >= 20 && a.percentage < 40).length },
    { range: "40-60%", count: recentAttempts.filter((a) => a.percentage >= 40 && a.percentage < 60).length },
    { range: "60-80%", count: recentAttempts.filter((a) => a.percentage >= 60 && a.percentage < 80).length },
    { range: "80-100%", count: recentAttempts.filter((a) => a.percentage >= 80).length },
  ];

  return {
    overview: { totalStudents, totalTrainers, totalCourses, totalBatches, quizAttempts, certificates, passRate, avgScore },
    scoreRanges,
  };
}

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  await requireAdmin();
  const data = await getAnalyticsData();
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform performance and insights</p>
      </div>
      <AnalyticsDashboard data={data} />
    </div>
  );
}
