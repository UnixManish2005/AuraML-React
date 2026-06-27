// ============================================================
// RESUME PREVIEW
// ============================================================

"use client";

import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";
import type { ResumeData } from "@/types";
import { cn } from "@/lib/utils";

interface ResumePreviewProps {
  data: ResumeData;
  template: "MODERN" | "PROFESSIONAL" | "MINIMAL";
}

export default function ResumePreview({ data, template }: ResumePreviewProps) {
  const { personalInfo, summary, experience, education, skills, projects } = data;

  const themeClasses = {
    MODERN: { header: "bg-gradient-to-r from-blue-700 to-violet-700 text-white", accent: "text-blue-700", border: "border-blue-700" },
    PROFESSIONAL: { header: "bg-gray-900 text-white", accent: "text-gray-900", border: "border-gray-900" },
    MINIMAL: { header: "bg-white border-b-2 border-gray-200 text-gray-900", accent: "text-gray-800", border: "border-gray-300" },
  }[template];

  return (
    <div className="bg-white text-gray-900 rounded-xl shadow-lg overflow-hidden text-xs" style={{ fontFamily: "Georgia, serif" }}>
      {/* Header */}
      <div className={cn("p-6", themeClasses.header)}>
        <h1 className="text-2xl font-bold">{personalInfo.name || "Your Name"}</h1>
        {personalInfo.title && <p className="text-sm opacity-90 mt-1">{personalInfo.title}</p>}
        <div className="flex flex-wrap gap-4 mt-3 text-xs opacity-80">
          {personalInfo.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{personalInfo.email}</span>}
          {personalInfo.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{personalInfo.phone}</span>}
          {personalInfo.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{personalInfo.location}</span>}
          {personalInfo.linkedin && <span className="flex items-center gap-1"><Linkedin className="w-3 h-3" />{personalInfo.linkedin}</span>}
          {personalInfo.github && <span className="flex items-center gap-1"><Github className="w-3 h-3" />{personalInfo.github}</span>}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Summary */}
        {summary && (
          <section>
            <h2 className={cn("text-sm font-bold uppercase tracking-wider pb-1 border-b mb-2", themeClasses.accent, themeClasses.border)}>
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h2 className={cn("text-sm font-bold uppercase tracking-wider pb-1 border-b mb-3", themeClasses.accent, themeClasses.border)}>
              Experience
            </h2>
            <div className="space-y-3">
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-gray-900">{exp.role}</div>
                      <div className={cn("font-medium", themeClasses.accent)}>{exp.company}</div>
                    </div>
                    <div className="text-gray-500 text-right">
                      {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                    </div>
                  </div>
                  {exp.bullets.filter(Boolean).length > 0 && (
                    <ul className="mt-1.5 space-y-0.5">
                      {exp.bullets.filter(Boolean).map((b, bi) => (
                        <li key={bi} className="flex gap-2 text-gray-700">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <h2 className={cn("text-sm font-bold uppercase tracking-wider pb-1 border-b mb-3", themeClasses.accent, themeClasses.border)}>
              Projects
            </h2>
            <div className="space-y-2">
              {projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{proj.name}</span>
                    {proj.techStack.length > 0 && (
                      <span className="text-gray-500">| {proj.techStack.join(", ")}</span>
                    )}
                  </div>
                  {proj.description && <p className="text-gray-700 mt-0.5">{proj.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section>
            <h2 className={cn("text-sm font-bold uppercase tracking-wider pb-1 border-b mb-3", themeClasses.accent, themeClasses.border)}>
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <div className="font-bold text-gray-900">{edu.institution}</div>
                    <div className="text-gray-600">{edu.degree} in {edu.field} {edu.gpa && `• ${edu.gpa}`}</div>
                  </div>
                  <div className="text-gray-500">{edu.startYear} – {edu.endYear}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {(skills.technical?.length > 0 || skills.tools?.length > 0) && (
          <section>
            <h2 className={cn("text-sm font-bold uppercase tracking-wider pb-1 border-b mb-3", themeClasses.accent, themeClasses.border)}>
              Skills
            </h2>
            <div className="space-y-1">
              {skills.technical?.length > 0 && <div><span className="font-medium">Technical: </span><span className="text-gray-700">{skills.technical.join(" • ")}</span></div>}
              {skills.tools?.length > 0 && <div><span className="font-medium">Tools: </span><span className="text-gray-700">{skills.tools.join(" • ")}</span></div>}
              {skills.soft?.length > 0 && <div><span className="font-medium">Soft Skills: </span><span className="text-gray-700">{skills.soft.join(" • ")}</span></div>}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ATS SCORE PANEL
// ============================================================

import type { ATSReport } from "@/types";
import { CheckCircle, XCircle, AlertCircle, TrendingUp } from "lucide-react";

interface ATSScorePanelProps { report: ATSReport | null; loading: boolean; }

export function ATSScorePanel({ report, loading }: ATSScorePanelProps) {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Analyzing your resume...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-2">ATS Score</h3>
        <p className="text-sm text-muted-foreground mb-4">Click "Check ATS Score" to analyze your resume against Applicant Tracking Systems</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          {["Keywords match", "Formatting check", "Section completeness", "Skills relevance"].map((item) => (
            <div key={item} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <AlertCircle className="w-3 h-3" /> {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const scoreColor = report.score >= 80 ? "text-emerald-500" : report.score >= 60 ? "text-amber-500" : "text-red-500";
  const scoreBg = report.score >= 80 ? "bg-emerald-500" : report.score >= 60 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
      {/* Score circle */}
      <div className="text-center">
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <circle cx="50" cy="50" r="40" fill="none" strokeWidth="8"
              stroke={report.score >= 80 ? "#10b981" : report.score >= 60 ? "#f59e0b" : "#ef4444"}
              strokeLinecap="round"
              strokeDasharray={`${report.score * 2.51} 251`}
            />
          </svg>
          <div className="absolute text-center">
            <div className={cn("text-2xl font-bold", scoreColor)}>{report.score}</div>
            <div className="text-xs text-muted-foreground">/ 100</div>
          </div>
        </div>
        <p className={cn("text-sm font-medium mt-2", scoreColor)}>
          {report.score >= 80 ? "Excellent ATS Score!" : report.score >= 60 ? "Good — Needs Improvement" : "Needs Significant Work"}
        </p>
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Score Breakdown</h4>
        {Object.entries(report.breakdown).map(([key, val]) => (
          <div key={key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="capitalize">{key.replace(/_/g, " ")}</span>
              <span className="font-medium">{val}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div className={cn("h-1.5 rounded-full", scoreBg)} style={{ width: `${val}%`, opacity: 0.7 + (val / 300) }} />
            </div>
          </div>
        ))}
      </div>

      {/* Keywords */}
      <div>
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Keywords</h4>
        <div className="space-y-2">
          {report.keywords.found.slice(0, 5).map((kw) => (
            <div key={kw} className="flex items-center gap-2 text-xs text-emerald-600">
              <CheckCircle className="w-3 h-3" /> {kw}
            </div>
          ))}
          {report.keywords.missing.slice(0, 5).map((kw) => (
            <div key={kw} className="flex items-center gap-2 text-xs text-red-500">
              <XCircle className="w-3 h-3" /> Missing: {kw}
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {report.suggestions.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Suggestions</h4>
          <div className="space-y-2">
            {report.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
