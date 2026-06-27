// ============================================================
// PERSONAL INFO STEP
// ============================================================

"use client";

import { useState } from "react";
import { Wand2, Loader2, User, Mail, Phone, MapPin, Linkedin, Github, Globe, Briefcase } from "lucide-react";
import { toast } from "sonner";
import type { PersonalInfo } from "@/types";

interface PersonalInfoStepProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
  summary: string | undefined;
  onSummaryChange: (summary: string) => void;
}

const FIELD_CONFIG = [
  { key: "name", label: "Full Name", icon: User, placeholder: "John Doe", required: true },
  { key: "title", label: "Professional Title", icon: Briefcase, placeholder: "Data Scientist | ML Engineer" },
  { key: "email", label: "Email", icon: Mail, placeholder: "john@example.com", required: true },
  { key: "phone", label: "Phone", icon: Phone, placeholder: "+91 98765 43210", required: true },
  { key: "location", label: "Location", icon: MapPin, placeholder: "Mumbai, India", required: true },
  { key: "linkedin", label: "LinkedIn URL", icon: Linkedin, placeholder: "linkedin.com/in/johndoe" },
  { key: "github", label: "GitHub URL", icon: Github, placeholder: "github.com/johndoe" },
  { key: "portfolio", label: "Portfolio URL", icon: Globe, placeholder: "johndoe.dev" },
];

export default function PersonalInfoStep({ data, onChange, summary, onSummaryChange }: PersonalInfoStepProps) {
  const [genLoading, setGenLoading] = useState(false);

  function handleChange(field: keyof PersonalInfo, value: string) {
    onChange({ ...data, [field]: value });
  }

  async function generateSummary() {
    if (!data.name || !data.title) {
      toast.error("Please fill in your name and title first");
      return;
    }
    setGenLoading(true);
    try {
      const res = await fetch("/api/ai/resume-write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "summary",
          context: { name: data.name, title: data.title },
        }),
      });
      const result = await res.json();
      onSummaryChange(result.content);
      toast.success("Summary generated!");
    } catch {
      toast.error("Generation failed. Check API keys.");
    } finally {
      setGenLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Personal Information</h2>
        <p className="text-sm text-muted-foreground">Your contact details and professional identity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELD_CONFIG.map((field) => {
          const IconComp = field.icon;
          return (
            <div key={field.key} className={field.key === "name" || field.key === "title" ? "md:col-span-2" : ""}>
              <label className="block text-sm font-medium mb-1.5">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <IconComp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={data[field.key as keyof PersonalInfo] || ""}
                  onChange={(e) => handleChange(field.key as keyof PersonalInfo, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Professional Summary */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium">Professional Summary</label>
          <button
            onClick={generateSummary}
            disabled={genLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors disabled:opacity-50"
          >
            {genLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
            AI Generate
          </button>
        </div>
        <textarea
          value={summary || ""}
          onChange={(e) => onSummaryChange(e.target.value)}
          rows={4}
          placeholder="A results-driven Data Scientist with 2+ years of experience in machine learning and Python development..."
          className="w-full px-4 py-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50 transition-colors resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {(summary || "").length}/500 characters • 3-5 sentences recommended for ATS optimization
        </p>
      </div>
    </div>
  );
}
