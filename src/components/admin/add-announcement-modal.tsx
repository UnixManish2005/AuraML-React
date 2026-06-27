// ============================================================
// ADD ANNOUNCEMENT MODAL
// ============================================================

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { announcementSchema, type AnnouncementInput } from "@/lib/validators";
import { safeJson } from "@/lib/utils";

interface AddAnnouncementModalProps {
  onClose: () => void;
  onAdd: (a: unknown) => void;
}

const ROLES = ["STUDENT", "TRAINER", "ADMIN"];
const TYPES = ["NOTICE", "EVENT", "WORKSHOP", "HACKATHON", "PLACEMENT", "GENERAL"];

export default function AddAnnouncementModal({ onClose, onAdd }: AddAnnouncementModalProps) {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AnnouncementInput>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { type: "GENERAL", targetRoles: ["STUDENT"], pinned: false },
  });

  const selectedRoles = watch("targetRoles") || [];

  function toggleRole(role: string) {
    const current = selectedRoles as string[];
    const updated = current.includes(role)
      ? current.filter((r) => r !== role)
      : [...current, role];
    setValue("targetRoles", updated as ("STUDENT" | "TRAINER" | "ADMIN" | "SUPER_ADMIN")[]);
  }

  async function onSubmit(data: AnnouncementInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await safeJson(res);
      if (!res.ok) throw new Error(result.error);
      onAdd(result.announcement);
      toast.success("Announcement published!");
    } catch (err) {
      toast.error((err as Error).message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">New Announcement</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Title *</label>
            <input {...register("title")} placeholder="Announcement title..." className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50" />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Content *</label>
            <textarea {...register("content")} rows={4} placeholder="Write your announcement..." className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50 resize-none" />
            {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Type</label>
              <select {...register("type")} className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none">
                {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Expires (optional)</label>
              <input type="date" {...register("expiresAt")} className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Audience</label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selectedRoles.includes(role)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register("pinned")} className="rounded" />
            <span className="text-sm">Pin this announcement to top</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</> : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
