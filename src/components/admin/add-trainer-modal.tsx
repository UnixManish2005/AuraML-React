// ============================================================
// ADD TRAINER MODAL
// ============================================================

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trainerSchema, type TrainerInput } from "@/lib/validators";
import { safeJson } from "@/lib/utils";

interface AddTrainerModalProps {
  onClose: () => void;
  onAdd: (trainer: unknown) => void;
}

export default function AddTrainerModal({ onClose, onAdd }: AddTrainerModalProps) {
  const [loading, setLoading] = useState(false);
  const [expertiseInput, setExpertiseInput] = useState("");
  const [expertiseList, setExpertiseList] = useState<string[]>([]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TrainerInput>({
    resolver: zodResolver(trainerSchema),
    defaultValues: { expertise: [], experience: 0 },
  });

  function addExpertise() {
    const val = expertiseInput.trim();
    if (!val || expertiseList.includes(val)) return;
    const updated = [...expertiseList, val];
    setExpertiseList(updated);
    setValue("expertise", updated);
    setExpertiseInput("");
  }

  function removeExpertise(tag: string) {
    const updated = expertiseList.filter((e) => e !== tag);
    setExpertiseList(updated);
    setValue("expertise", updated);
  }

  async function onSubmit(data: TrainerInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, expertise: expertiseList }),
      });
      const result = await safeJson(res);
      if (!res.ok) throw new Error(String(result.error ?? "Unknown error"));
      onAdd(result.trainer);
      toast.success("Trainer added! Default password: Trainer@123");
    } catch (err) {
      toast.error((err as Error).message || "Failed to add trainer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Add New Trainer</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5">Full Name *</label>
              <input
                {...register("name")}
                placeholder="Dr. Ravi Kumar"
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5">Email *</label>
              <input
                {...register("email")}
                type="email"
                placeholder="trainer@example.com"
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Phone</label>
              <input
                {...register("phone")}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Experience (years)</label>
              <input
                {...register("experience", { valueAsNumber: true })}
                type="number"
                min="0"
                max="50"
                placeholder="5"
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5">Bio</label>
              <textarea
                {...register("bio")}
                rows={3}
                placeholder="Short professional bio..."
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>

            {/* Expertise tags */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5">Expertise</label>
              <div className="flex gap-2">
                <input
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addExpertise(); } }}
                  placeholder="e.g. Python, Machine Learning"
                  className="flex-1 px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50"
                />
                <button
                  type="button"
                  onClick={addExpertise}
                  className="p-2.5 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {expertiseList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {expertiseList.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full"
                    >
                      {tag}
                      <button type="button" onClick={() => removeExpertise(tag)}>
                        <Trash2 className="w-3 h-3 hover:text-red-500" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
            Default password will be <code className="font-mono">Trainer@123</code>. The trainer should change it on first login.
          </p>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : "Add Trainer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
