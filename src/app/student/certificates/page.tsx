// ============================================================
// STUDENT CERTIFICATES PAGE
// ============================================================

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Award, Download, ExternalLink, Calendar, QrCode } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

async function getCertificates(userId: string) {
  return db.certificate.findMany({
    where: { userId },
    include: { course: { select: { title: true, level: true } } },
    orderBy: { issuedAt: "desc" },
  });
}

const TYPE_CONFIG = {
  COURSE_COMPLETION: { label: "Course Completion", color: "from-blue-500 to-violet-500", icon: "🎓" },
  QUIZ_COMPLETION: { label: "Quiz Achievement", color: "from-emerald-500 to-teal-500", icon: "✅" },
  PROJECT_COMPLETION: { label: "Project Certificate", color: "from-amber-500 to-orange-500", icon: "🏗️" },
};

export const metadata = { title: "My Certificates" };

export default async function CertificatesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const certificates = await getCertificates(session.user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">My Certificates</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your earned certificates and achievements
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-xl font-semibold mb-2">No certificates yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Complete courses, pass quizzes, and finish projects to earn certificates that you can share with employers.
          </p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Earned", value: certificates.length },
              { label: "Courses", value: certificates.filter((c) => c.type === "COURSE_COMPLETION").length },
              { label: "Projects", value: certificates.filter((c) => c.type === "PROJECT_COMPLETION").length },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Certificates grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {certificates.map((cert) => {
              const config = TYPE_CONFIG[cert.type];
              return (
                <div key={cert.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  {/* Certificate header */}
                  <div className={cn("p-6 bg-gradient-to-r text-white", config.color)}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-2xl mb-2">{config.icon}</div>
                        <div className="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">
                          {config.label}
                        </div>
                        <h3 className="font-bold text-lg leading-tight">{cert.title}</h3>
                      </div>
                      <div className="text-right">
                        <Award className="w-8 h-8 opacity-60 mb-1" />
                        <div className="text-xs opacity-70">VERIFIED</div>
                      </div>
                    </div>

                    {cert.course && (
                      <div className="mt-3 text-sm opacity-80">
                        {cert.course.title} • {cert.course.level}
                      </div>
                    )}
                  </div>

                  {/* Certificate body */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Issued Date
                        </div>
                        <div className="font-medium">{formatDate(cert.issuedAt)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <QrCode className="w-3 h-3" /> Certificate ID
                        </div>
                        <div className="font-mono text-xs font-medium truncate">{cert.certificateId}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-border rounded-xl text-sm hover:bg-muted transition-colors">
                        <Download className="w-4 h-4" /> Download PDF
                      </button>
                      <button className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-xl text-sm hover:bg-muted transition-colors">
                        <ExternalLink className="w-4 h-4" /> Share
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
