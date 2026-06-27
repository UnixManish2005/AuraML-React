// ============================================================
// SKILLS STEP
// ============================================================

"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import type { Skills } from "@/types";

interface SkillsStepProps { data: Skills; onChange: (d: Skills) => void; }

const SKILL_CATEGORIES = [
  { key: "technical", label: "Technical Skills", placeholder: "Python, TensorFlow, SQL...", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { key: "tools", label: "Tools & Frameworks", placeholder: "Git, Docker, AWS, Jupyter...", color: "bg-violet-500/10 text-violet-600 border-violet-500/20" },
  { key: "soft", label: "Soft Skills", placeholder: "Leadership, Communication...", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  { key: "languages", label: "Languages", placeholder: "English (Fluent), Hindi...", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
];

const POPULAR_SKILLS = {
  technical: ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "SQL", "R", "Keras", "OpenCV", "NLP", "Computer Vision"],
  tools: ["Git", "Docker", "Jupyter", "VS Code", "AWS", "GCP", "Azure", "Tableau", "Power BI", "MongoDB", "PostgreSQL", "Apache Spark"],
  soft: ["Problem Solving", "Team Leadership", "Communication", "Critical Thinking", "Project Management", "Agile"],
  languages: ["English", "Hindi", "Python", "JavaScript"],
};

export default function SkillsStep({ data, onChange }: SkillsStepProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({ technical: "", tools: "", soft: "", languages: "" });

  function addSkill(category: keyof Skills, skill: string) {
    const trimmed = skill.trim();
    if (!trimmed || (data[category] as string[]).includes(trimmed)) return;
    onChange({ ...data, [category]: [...(data[category] as string[]), trimmed] });
    setInputs((prev) => ({ ...prev, [category]: "" }));
  }

  function removeSkill(category: keyof Skills, skill: string) {
    onChange({ ...data, [category]: (data[category] as string[]).filter((s) => s !== skill) });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Skills</h2>
        <p className="text-sm text-muted-foreground">Add your technical and soft skills — these are heavily weighted by ATS systems</p>
      </div>

      {SKILL_CATEGORIES.map((cat) => {
        const category = cat.key as keyof Skills;
        const skills = (data[category] || []) as string[];
        const popular = POPULAR_SKILLS[cat.key as keyof typeof POPULAR_SKILLS] || [];

        return (
          <div key={cat.key} className="space-y-3">
            <label className="block text-sm font-medium">{cat.label}</label>

            {/* Input */}
            <div className="flex gap-2">
              <input
                value={inputs[cat.key] || ""}
                onChange={(e) => setInputs((prev) => ({ ...prev, [cat.key]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(category, inputs[cat.key] || ""))}
                placeholder={cat.placeholder}
                className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={() => addSkill(category, inputs[cat.key] || "")}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Current skills */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill} className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${cat.color}`}>
                    {skill}
                    <button onClick={() => removeSkill(category, skill)} className="hover:opacity-70">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Popular suggestions */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Popular:</p>
              <div className="flex flex-wrap gap-1.5">
                {popular.filter((s) => !skills.includes(s)).slice(0, 8).map((s) => (
                  <button
                    key={s}
                    onClick={() => addSkill(category, s)}
                    className="px-2.5 py-1 text-xs border border-dashed border-border rounded-full hover:bg-muted transition-colors text-muted-foreground"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
