// ============================================================
// ADD STUDENT MODAL
// ============================================================

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { studentSchema, type StudentInput } from "@/lib/validators";
import { safeJson } from "@/lib/utils";



interface AddStudentModalProps {
  onClose: () => void;
  onAdd: (student: unknown) => void;
}

export default function AddStudentModal({ onClose, onAdd }: AddStudentModalProps) {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
  });

  async function onSubmit(data: StudentInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await safeJson(res);
      if (!res.ok) throw new Error(result.error);
      onAdd(result.data);
      toast.success("Student added successfully");
    } catch (err) {
      toast.error((err as Error).message || "Failed to add student");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Add New Student</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5">Full Name *</label>
              <input {...register("name")} placeholder="John Doe" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5">Email *</label>
              <input {...register("email")} type="email" placeholder="student@example.com" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Phone</label>
              <input {...register("phone")} placeholder="+91 98765 43210" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Year of Study</label>
              <input {...register("yearOfStudy", { valueAsNumber: true })} type="number" placeholder="2" min="1" max="6" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5">College</label>
              <input {...register("college")} placeholder="IIT Bombay" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
