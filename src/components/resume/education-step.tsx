// ============================================================
// EDUCATION STEP
// ============================================================

"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Education } from "@/types";

interface EducationStepProps { data: Education[]; onChange: (d: Education[]) => void; }

const BLANK: Education = { institution: "", degree: "", field: "", startYear: new Date().getFullYear() - 4, endYear: new Date().getFullYear(), gpa: "" };

export default function EducationStep({ data, onChange }: EducationStepProps) {
  const add = () => onChange([...data, { ...BLANK }]);
  const remove = (i: number) => onChange(data.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof Education, value: Education[keyof Education]) =>
    onChange(data.map((e, idx) => idx === i ? { ...e, [field]: value } : e));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Education</h2>
          <p className="text-sm text-muted-foreground">Your academic qualifications</p>
        </div>
        <button onClick={add} className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Education
        </button>
      </div>

      {data.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-muted-foreground text-sm mb-3">No education added</p>
          <button onClick={add} className="text-sm text-blue-500">Add your degree</button>
        </div>
      ) : (
        data.map((edu, i) => (
          <div key={i} className="bg-background border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium">{edu.institution || "Institution"}</h3>
              <button onClick={() => remove(i)} className="text-muted-foreground hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Institution *</label>
                <input value={edu.institution} onChange={(e) => update(i, "institution", e.target.value)} placeholder="IIT Bombay" className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Degree</label>
                <input value={edu.degree} onChange={(e) => update(i, "degree", e.target.value)} placeholder="B.Tech" className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Field of Study</label>
                <input value={edu.field} onChange={(e) => update(i, "field", e.target.value)} placeholder="Computer Science" className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Start Year</label>
                <input type="number" value={edu.startYear} onChange={(e) => update(i, "startYear", parseInt(e.target.value))} className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">End Year</label>
                <input type="number" value={edu.endYear} onChange={(e) => update(i, "endYear", parseInt(e.target.value))} className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">GPA / Score</label>
                <input value={edu.gpa || ""} onChange={(e) => update(i, "gpa", e.target.value)} placeholder="8.5 / 10" className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none" />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
