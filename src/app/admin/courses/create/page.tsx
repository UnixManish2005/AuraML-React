"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { courseSchema, type CourseInput } from "@/lib/validators";
import { safeJson } from "@/lib/utils";
import { cn } from "@/lib/utils";

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export default function CreateCoursePage() {
  const router = useRouter();
  const [tagInput, setTagInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      level: "BEGINNER",
      duration: 4,
      isFree: true,
      tags: [],
      skills: [],
    },
  });

  const tags = watch("tags") ?? [];
  const skills = watch("skills") ?? [];
  const isFree = watch("isFree");

  function addTag() {
    const v = tagInput.trim();
    if (v && !tags.includes(v)) setValue("tags", [...tags, v]);
    setTagInput("");
  }

  function removeTag(t: string) {
    setValue("tags", tags.filter((x) => x !== t));
  }

  function addSkill() {
    const v = skillInput.trim();
    if (v && !skills.includes(v)) setValue("skills", [...skills, v]);
    setSkillInput("");
  }

  function removeSkill(s: string) {
    setValue("skills", skills.filter((x) => x !== s));
  }

  async function onSubmit(data: CourseInput) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await safeJson<{ course: { id: string }; error?: string }>(res);
      if (!res.ok) throw new Error(result.error ?? "Failed to create course");
      toast.success("Course created!");
      router.push(`/admin/courses/${result.course.id}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/courses"
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Create Course</h1>
          <p className="text-sm text-muted-foreground">Fill in the details to add a new course</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Title */}
        <div>
          <label className="text-sm font-medium block mb-1.5">Title *</label>
          <input
            {...register("title")}
            placeholder="e.g. Full Stack Web Development"
            className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50"
          />
          {errors.title && (
            <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium block mb-1.5">Description *</label>
          <textarea
            {...register("description")}
            rows={4}
            placeholder="What will students learn in this course?"
            className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50 resize-none"
          />
          {errors.description && (
            <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Level + Duration row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Level *</label>
            <select
              {...register("level")}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l.charAt(0) + l.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Duration (weeks) *</label>
            <input
              type="number"
              min={1}
              {...register("duration", { valueAsNumber: true })}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50"
            />
            {errors.duration && (
              <p className="text-xs text-destructive mt-1">{errors.duration.message}</p>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div>
          <label className="text-sm font-medium block mb-2">Pricing</label>
          <div className="flex gap-3">
            {[true, false].map((val) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => setValue("isFree", val)}
                className={cn(
                  "flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors",
                  isFree === val
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                {val ? "Free" : "Paid"}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-sm font-medium block mb-1.5">Tags</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {tags.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-muted text-sm rounded-full"
              >
                {t}
                <button type="button" onClick={() => removeTag(t)}>
                  <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              placeholder="Add a tag and press Enter"
              className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="text-sm font-medium block mb-1.5">Skills Students Will Gain</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {skills.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-sm rounded-full"
              >
                {s}
                <button type="button" onClick={() => removeSkill(s)}>
                  <X className="w-3 h-3 hover:text-primary/70" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
              placeholder="Add a skill and press Enter"
              className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/admin/courses"
            className="flex-1 py-2.5 text-sm font-medium text-center border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? "Creating..." : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
}
