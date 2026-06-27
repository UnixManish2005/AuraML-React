// ============================================================
// ADMIN JOBS & PLACEMENT PAGE
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { Plus, Briefcase, Trash2, ExternalLink, Users, Search, Calendar } from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  salary: string | null;
  link: string | null;
  deadline: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { applications: number };
}

const TYPE_COLORS: Record<string, string> = {
  JOB: "bg-blue-500/10 text-blue-600",
  INTERNSHIP: "bg-violet-500/10 text-violet-600",
  HACKATHON: "bg-amber-500/10 text-amber-600",
  FREELANCE: "bg-emerald-500/10 text-emerald-600",
};

const TYPE_ICONS: Record<string, string> = {
  JOB: "💼", INTERNSHIP: "🎓", HACKATHON: "🏆", FREELANCE: "🚀",
};

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "", company: "", location: "", type: "JOB",
    description: "", salary: "", link: "", deadline: "", requirements: "",
  });

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => { setJobs(d.jobs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handlePost() {
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        requirements: form.requirements.split(",").map((s) => s.trim()).filter(Boolean),
        salary: form.salary || undefined,
        link: form.link || undefined,
        deadline: form.deadline || undefined,
      };
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(String(data.error ?? "Server error"));
      setJobs((prev) => [{ ...data.job, _count: { applications: 0 } }, ...prev]);
      setShowForm(false);
      setForm({ title: "", company: "", location: "", type: "JOB", description: "", salary: "", link: "", deadline: "", requirements: "" });
      toast.success("Job posted!");
    } catch (err) {
      toast.error((err as Error).message || "Failed to post job");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteJob(id: string) {
    if (!confirm("Delete this job posting?")) return;
    try {
      await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      setJobs((prev) => prev.filter((j) => j.id !== id));
      toast.success("Job removed");
    } catch { toast.error("Delete failed"); }
  }

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs & Placement</h1>
          <p className="text-sm text-muted-foreground mt-1">Post opportunities for your students</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Post Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Postings", value: jobs.length },
          { label: "Active", value: jobs.filter((j) => j.isActive).length },
          { label: "Applications", value: jobs.reduce((s, j) => s + j._count.applications, 0) },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jobs..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Job list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No job postings yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <div key={job.id} className="bg-card border border-border rounded-xl p-5 hover:border-border/80 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{TYPE_ICONS[job.type] || "💼"}</div>
                  <div>
                    <div className="font-semibold">{job.title}</div>
                    <div className="text-sm text-muted-foreground">{job.company} · {job.location}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", TYPE_COLORS[job.type])}>
                        {job.type}
                      </span>
                      {job.salary && (
                        <span className="text-xs text-muted-foreground">💰 {job.salary}</span>
                      )}
                      {job.deadline && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDate(job.deadline)}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" /> {job._count.applications} applied
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {job.link && (
                    <a href={job.link} target="_blank" rel="noopener noreferrer"
                      className="p-2 border border-border rounded-lg text-xs hover:bg-muted transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => deleteJob(job.id)}
                    className="p-2 border border-border rounded-lg text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Job Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-5">Post New Opportunity</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-sm font-medium block mb-1">Job Title *</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Software Engineer Intern" className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Company *</label>
                  <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Acme Corp" className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Location *</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Remote / Pune" className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none">
                    {["JOB", "INTERNSHIP", "HACKATHON", "FREELANCE"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Salary / Stipend</label>
                  <input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    placeholder="₹15,000/month" className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Deadline</label>
                  <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Apply Link</label>
                  <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="https://..." className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium block mb-1">Requirements (comma-separated)</label>
                  <input value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                    placeholder="Python, SQL, React" className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium block mb-1">Description *</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4} placeholder="Job description..." className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button onClick={handlePost} disabled={submitting} className="flex-1 px-4 py-2.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {submitting ? "Posting..." : "Post Job"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
