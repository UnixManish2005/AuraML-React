// ============================================================
// EXPERIENCE STEP
// ============================================================

"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Experience } from "@/types";

interface ExperienceStepProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

const BLANK_EXP: Experience = {
  company: "", role: "", startDate: "", endDate: "", isCurrent: false, location: "", bullets: [""],
};

export default function ExperienceStep({ data, onChange }: ExperienceStepProps) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const [genLoading, setGenLoading] = useState<number | null>(null);

  function add() {
    onChange([...data, { ...BLANK_EXP, bullets: [""] }]);
    setExpanded(data.length);
  }

  function remove(i: number) {
    onChange(data.filter((_, idx) => idx !== i));
  }

  function update(i: number, field: keyof Experience, value: Experience[keyof Experience]) {
    onChange(data.map((e, idx) => idx === i ? { ...e, [field]: value } : e));
  }

  function updateBullet(ei: number, bi: number, value: string) {
    onChange(data.map((e, idx) => {
      if (idx !== ei) return e;
      const bullets = [...e.bullets];
      bullets[bi] = value;
      return { ...e, bullets };
    }));
  }

  function addBullet(ei: number) {
    onChange(data.map((e, idx) => idx === ei ? { ...e, bullets: [...e.bullets, ""] } : e));
  }

  function removeBullet(ei: number, bi: number) {
    onChange(data.map((e, idx) => idx === ei ? { ...e, bullets: e.bullets.filter((_, i) => i !== bi) } : e));
  }

  async function generateBullets(i: number) {
    const exp = data[i];
    if (!exp.role || !exp.company) { toast.error("Fill in role and company first"); return; }
    setGenLoading(i);
    try {
      const res = await fetch("/api/ai/resume-write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "experience_bullets", context: { role: exp.role, company: exp.company } }),
      });
      const result = await res.json();
      const bullets = Array.isArray(result.content) ? result.content : [result.content];
      update(i, "bullets", bullets);
      toast.success("Bullets generated!");
    } catch { toast.error("Generation failed"); }
    finally { setGenLoading(null); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Work Experience</h2>
          <p className="text-sm text-muted-foreground">Add your internships and work experience</p>
        </div>
        <button onClick={add} className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Experience
        </button>
      </div>

      {data.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-muted-foreground text-sm mb-3">No experience added yet</p>
          <button onClick={add} className="text-sm text-blue-500 hover:text-blue-400">Add your first experience</button>
        </div>
      ) : (
        data.map((exp, i) => (
          <div key={i} className="bg-background border border-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpanded(expanded === i ? null : i)}>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{exp.role || "New Experience"}</div>
                <div className="text-xs text-muted-foreground">{exp.company || "Company"} {exp.startDate && `• ${exp.startDate}`}</div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={(e) => { e.stopPropagation(); remove(i); }} className="p-1 text-muted-foreground hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                {expanded === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </div>

            {expanded === i && (
              <div className="p-4 border-t border-border space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Job Title *</label>
                    <input value={exp.role} onChange={(e) => update(i, "role", e.target.value)} placeholder="Data Scientist Intern" className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Company *</label>
                    <input value={exp.company} onChange={(e) => update(i, "company", e.target.value)} placeholder="Tech Corp" className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Start Date</label>
                    <input type="month" value={exp.startDate} onChange={(e) => update(i, "startDate", e.target.value)} className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">End Date</label>
                    <input type="month" value={exp.endDate} onChange={(e) => update(i, "endDate", e.target.value)} disabled={exp.isCurrent} className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none disabled:opacity-50" />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={exp.isCurrent} onChange={(e) => update(i, "isCurrent", e.target.checked)} className="rounded" />
                      <span className="text-sm">Currently working here</span>
                    </label>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-muted-foreground">Key Achievements / Responsibilities</label>
                    <button onClick={() => generateBullets(i)} disabled={genLoading === i} className="flex items-center gap-1 px-2 py-1 text-xs bg-violet-600 text-white rounded hover:bg-violet-500 transition-colors disabled:opacity-50">
                      {genLoading === i ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      AI Generate
                    </button>
                  </div>
                  <div className="space-y-2">
                    {exp.bullets.map((bullet, bi) => (
                      <div key={bi} className="flex items-start gap-2">
                        <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        <input
                          value={bullet}
                          onChange={(e) => updateBullet(i, bi, e.target.value)}
                          placeholder="Developed ML model achieving 94% accuracy..."
                          className="flex-1 px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none"
                        />
                        {exp.bullets.length > 1 && (
                          <button onClick={() => removeBullet(i, bi)} className="mt-2 text-muted-foreground hover:text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => addBullet(i)} className="text-xs text-blue-500 hover:text-blue-400 mt-1">
                      + Add bullet point
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
