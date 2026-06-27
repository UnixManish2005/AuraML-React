// ============================================================
// STUDENT JOBS & PLACEMENT PAGE
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { Briefcase, MapPin, Clock, ExternalLink, Search, Filter, Building2, DollarSign } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  salary?: string;
  link?: string;
  deadline?: string;
  isActive: boolean;
  _count?: { applications: number };
}

const TYPE_COLORS: Record<string, string> = {
  JOB: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  INTERNSHIP: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  HACKATHON: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  FREELANCE: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

const TYPE_ICONS: Record<string, string> = {
  JOB: "💼",
  INTERNSHIP: "🎓",
  HACKATHON: "🏆",
  FREELANCE: "💻",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => { setJobs(d.jobs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function applyToJob(jobId: string, link?: string) {
    if (link) { window.open(link, "_blank"); return; }
    setApplying(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, { method: "POST" });
      if (!res.ok) throw new Error();
      setApplied((prev) => new Set([...prev, jobId]));
      toast.success("Application submitted successfully!");
    } catch {
      toast.error("Application failed. Please try again.");
    } finally {
      setApplying(null);
    }
  }

  const filtered = jobs.filter((j) => {
    const matchSearch = !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || j.type === typeFilter;
    return matchSearch && matchType && j.isActive;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Jobs & Placement</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Opportunities handpicked for AI/ML students
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs, companies..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {["ALL", "JOB", "INTERNSHIP", "HACKATHON", "FREELANCE"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                typeFilter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No opportunities found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((job) => {
            const isApplied = applied.has(job.id);
            const isApplying = applying === job.id;

            return (
              <div
                key={job.id}
                className="bg-card border border-border rounded-xl p-5 flex flex-col hover:border-border/80 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl flex-shrink-0">
                      {TYPE_ICONS[job.type] || "💼"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm leading-tight">{job.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Building2 className="w-3 h-3" />
                        {job.company}
                      </div>
                    </div>
                  </div>
                  <span className={cn(
                    "text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0",
                    TYPE_COLORS[job.type]
                  )}>
                    {job.type.charAt(0) + job.type.slice(1).toLowerCase()}
                  </span>
                </div>

                {/* Details */}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {job.location}
                  </span>
                  {job.salary && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> {job.salary}
                    </span>
                  )}
                  {job.deadline && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Apply by {formatDate(job.deadline)}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                  {job.description}
                </p>

                {/* Requirements */}
                {job.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {job.requirements.slice(0, 4).map((req) => (
                      <span key={req} className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                        {req}
                      </span>
                    ))}
                    {job.requirements.length > 4 && (
                      <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                        +{job.requirements.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Apply button */}
                <button
                  onClick={() => applyToJob(job.id, job.link)}
                  disabled={isApplied || isApplying}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                    isApplied
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 cursor-default"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  )}
                >
                  {isApplied ? (
                    "✓ Applied"
                  ) : isApplying ? (
                    "Applying..."
                  ) : job.link ? (
                    <><ExternalLink className="w-4 h-4" /> Apply Now</>
                  ) : (
                    "Apply Now"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
