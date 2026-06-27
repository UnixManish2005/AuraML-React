// ============================================================
// ADD BATCH MODAL
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { batchSchema, type BatchInput } from "@/lib/validators";

interface AddBatchModalProps {
  onClose: () => void;
  onAdd: (batch: unknown) => void;
}

interface Course { id: string; title: string }
interface Trainer { id: string; user: { name: string | null } }

export default function AddBatchModal({ onClose, onAdd }: AddBatchModalProps) {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<BatchInput>({
    resolver: zodResolver(batchSchema),
    defaultValues: { status: "UPCOMING", capacity: 30 },
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/courses").then((r) => r.json()),
      fetch("/api/admin/trainers").then((r) => r.json()),
    ]).then(([c, t]) => {
      setCourses(c.courses || []);
      setTrainers(t.trainers || []);
    }).catch(console.error);
  }, []);

  async function onSubmit(data: BatchInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // Safely parse — avoids "Unexpected end of JSON input" on redirect/empty responses
      const text = await res.text();
      const result = text ? JSON.parse(text) : {};

      if (!res.ok) throw new Error(String(result.error) || `Server error (${res.status})`);
      onAdd(result.batch);
      toast.success("Batch created!");
    } catch (err) {
      toast.error((err as Error).message || "Failed to create batch");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Create New Batch</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Batch Name *</label>
            <input {...register("name")} placeholder="e.g. AIML Batch A - 2025" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Course *</label>
              <select {...register("courseId")} className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none">
                <option value="">Select course</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              {errors.courseId && <p className="mt-1 text-xs text-red-500">{errors.courseId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Trainer *</label>
              <select {...register("trainerId")} className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none">
                <option value="">Select trainer</option>
                {trainers.map((t) => <option key={t.id} value={t.id}>{t.user.name}</option>)}
              </select>
              {errors.trainerId && <p className="mt-1 text-xs text-red-500">{errors.trainerId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Start Date *</label>
              <input {...register("startDate")} type="date" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">End Date *</label>
              <input {...register("endDate")} type="date" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Capacity *</label>
              <input {...register("capacity", { valueAsNumber: true })} type="number" min="1" max="500" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none" />
              {errors.capacity && <p className="mt-1 text-xs text-red-500">{errors.capacity.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <select {...register("status")} className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none">
                <option value="UPCOMING">Upcoming</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea {...register("description")} rows={2} placeholder="Optional description..." className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
