// ============================================================
// ATS RESUME BUILDER - Multi-step builder
// ============================================================

"use client";

import { useState } from "react";
import { User, Briefcase, GraduationCap, Code2, Award, FileText, Eye, Download, Wand2, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResumeData, ATSReport } from "@/types";

// Step components (imported below definition)
import PersonalInfoStep from "@/components/resume/personal-info-step";
import ExperienceStep from "@/components/resume/experience-step";
import EducationStep from "@/components/resume/education-step";
import SkillsStep from "@/components/resume/skills-step";
import ProjectsStep from "@/components/resume/projects-step";
import ResumePreview from "@/components/resume/resume-preview";
import ATSScorePanel from "@/components/resume/ats-score-panel";

const STEPS = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Code2 },
  { id: "projects", label: "Projects", icon: Award },
  { id: "preview", label: "Preview & Export", icon: Eye },
];

const DEFAULT_RESUME: ResumeData = {
  personalInfo: { name: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "", title: "" },
  summary: "",
  experience: [],
  education: [],
  skills: { technical: [], soft: [], tools: [], languages: [] },
  projects: [],
  achievements: [],
  certifications: [],
};

export default function ResumePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState<ResumeData>(DEFAULT_RESUME);
  const [template, setTemplate] = useState<"MODERN" | "PROFESSIONAL" | "MINIMAL">("MODERN");
  const [atsReport, setAtsReport] = useState<ATSReport | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  function updateResume(section: keyof ResumeData, data: ResumeData[keyof ResumeData]) {
    setResumeData((prev) => ({ ...prev, [section]: data }));
  }

  async function analyzeATS() {
    setAtsLoading(true);
    try {
      const res = await fetch("/api/resume/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData }),
      });
      const data = await res.json();
      setAtsReport(data.report);
    } catch {
      console.error("ATS analysis failed");
    } finally {
      setAtsLoading(false);
    }
  }

  async function saveResume() {
    setSaving(true);
    try {
      await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, template }),
      });
    } finally {
      setSaving(false);
    }
  }

  const stepComponents = [
    <PersonalInfoStep key="p" data={resumeData.personalInfo} onChange={(d) => updateResume("personalInfo", d)} summary={resumeData.summary} onSummaryChange={(s) => updateResume("summary", s)} />,
    <ExperienceStep key="e" data={resumeData.experience} onChange={(d) => updateResume("experience", d)} />,
    <EducationStep key="ed" data={resumeData.education} onChange={(d) => updateResume("education", d)} />,
    <SkillsStep key="s" data={resumeData.skills} onChange={(d) => updateResume("skills", d)} />,
    <ProjectsStep key="pr" data={resumeData.projects} onChange={(d) => updateResume("projects", d)} />,
    <div key="prev" className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        {(["MODERN", "PROFESSIONAL", "MINIMAL"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTemplate(t)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
              template === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"
            )}
          >
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
        <button
          onClick={analyzeATS}
          disabled={atsLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-500 transition-colors disabled:opacity-50 ml-auto"
        >
          <Wand2 className="w-4 h-4" />
          {atsLoading ? "Analyzing..." : "Check ATS Score"}
        </button>
        <button
          onClick={saveResume}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <FileText className="w-4 h-4" />
          {saving ? "Saving..." : "Save Resume"}
        </button>
      </div>
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ResumePreview data={resumeData} template={template} />
        </div>
        <div className="lg:col-span-2">
          <ATSScorePanel report={atsReport} loading={atsLoading} />
        </div>
      </div>
    </div>,
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">ATS Resume Builder</h1>
        <p className="text-muted-foreground text-sm mt-1">Build a job-ready resume with AI assistance</p>
      </div>

      {/* Steps */}
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-0" />
        <div className="flex items-center justify-between relative">
          {STEPS.map((step, i) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(i)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all bg-background z-10",
                i < currentStep ? "bg-primary border-primary text-primary-foreground" :
                i === currentStep ? "border-primary text-primary" : "border-border text-muted-foreground"
              )}>
                {i < currentStep ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
              </div>
              <span className={cn(
                "text-xs font-medium hidden md:block",
                i === currentStep ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-card border border-border rounded-xl p-6 min-h-96">
        {stepComponents[currentStep]}
      </div>

      {/* Navigation */}
      {currentStep < STEPS.length - 1 && (
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-5 py-2.5 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button
            onClick={() => setCurrentStep((p) => Math.min(STEPS.length - 1, p + 1))}
            className="flex items-center gap-2 px-5 py-2.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
