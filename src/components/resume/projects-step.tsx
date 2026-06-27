// ============================================================
// PROJECTS STEP
// ============================================================

"use client";

import { Plus, Trash2, Wand2, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Project } from "@/types";

interface ProjectsStepProps { data: Project[]; onChange: (d: Project[]) => void; }

const BLANK: Project = { name: "", description: "", techStack: [], link: "", github: "", bullets: [""] };

export default function ProjectsStep({ data, onChange }: ProjectsStepProps) {
  const [genLoading, setGenLoading] = useState<number | null>(null);
  const [techInput, setTechInput] = useState<Record<number, string>>({});

  const add = () => { onChange([...data, { ...BLANK, bullets: [""] }]); };
  const remove = (i: number) => onChange(data.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof Project, val: Project[keyof Project]) =>
    onChange(data.map((p, idx) => idx === i ? { ...p, [field]: val } : p));

  function addTech(i: number) {
    const val = (techInput[i] || "").trim();
    if (!val) return;
    const current = data[i].techStack;
    if (!current.includes(val)) update(i, "techStack", [...current, val]);
    setTechInput((prev) => ({ ...prev, [i]: "" }));
  }

  function removeTech(pi: number, tech: string) {
    update(pi, "techStack", data[pi].techStack.filter((t) => t !== tech));
  }

  async function generateProjectDesc(i: number) {
    const proj = data[i];
    if (!proj.name) { toast.error("Enter project name first"); return; }
    setGenLoading(i);
    try {
      const res = await fetch("/api/ai/resume-write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "project_description", context: { name: proj.name, techStack: proj.techStack } }),
      });
      const result = await res.json();
      update(i, "description", result.content);
      toast.success("Description generated!");
    } catch { toast.error("Generation failed"); }
    finally { setGenLoading(null); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Projects</h2>
          <p className="text-sm text-muted-foreground">Showcase your ML/AI projects</p>
        </div>
        <button onClick={add} className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {data.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-muted-foreground text-sm mb-3">No projects added</p>
          <button onClick={add} className="text-sm text-blue-500">Add your first project</button>
        </div>
      ) : (
        data.map((proj, i) => (
          <div key={i} className="bg-background border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">{proj.name || `Project ${i + 1}`}</h3>
              <button onClick={() => remove(i)} className="text-muted-foreground hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Project Name *</label>
                <input value={proj.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="House Price Predictor" className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">GitHub URL</label>
                <input value={proj.github || ""} onChange={(e) => update(i, "github", e.target.value)} placeholder="github.com/user/repo" className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Live Link</label>
                <input value={proj.link || ""} onChange={(e) => update(i, "link", e.target.value)} placeholder="project-demo.vercel.app" className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Tech Stack</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={techInput[i] || ""}
                  onChange={(e) => setTechInput((p) => ({ ...p, [i]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech(i))}
                  placeholder="Python, Scikit-learn..."
                  className="flex-1 px-3 py-1.5 text-sm bg-card border border-border rounded-lg focus:outline-none"
                />
                <button onClick={() => addTech(i)} className="px-3 py-1.5 bg-muted rounded-lg hover:bg-muted/80 text-sm">Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {proj.techStack.map((t) => (
                  <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded text-xs">
                    {t} <button onClick={() => removeTech(i, t)}><X className="w-2.5 h-2.5" /></button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <button onClick={() => generateProjectDesc(i)} disabled={genLoading === i} className="flex items-center gap-1 px-2 py-1 text-xs bg-violet-600 text-white rounded hover:bg-violet-500 disabled:opacity-50">
                  {genLoading === i ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                  AI Generate
                </button>
              </div>
              <textarea value={proj.description} onChange={(e) => update(i, "description", e.target.value)} rows={3} placeholder="Developed a machine learning model to predict house prices..." className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none resize-none" />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
