// ============================================================
// ADMIN TRAINERS PAGE — fixes 404 on /admin/trainers
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Star, Users, BookOpen, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import AddTrainerModal from "@/components/admin/add-trainer-modal";

interface Trainer {
  id: string;
  bio: string | null;
  experience: number;
  expertise: string[];
  rating: number;
  _count: { batches: number };
  user: {
    id: string;
    name: string | null;
    email: string;
    status: string;
    image: string | null;
  };
  courses: { course: { title: string } }[];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/trainers")
      .then((r) => r.json())
      .then((d) => {
        setTrainers(d.trainers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function deleteTrainer(id: string) {
    if (!confirm("Remove this trainer? Their account will be deactivated.")) return;
    try {
      const res = await fetch(`/api/admin/trainers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setTrainers((prev) => prev.filter((t) => t.id !== id));
      toast.success("Trainer removed");
    } catch {
      toast.error("Failed to remove trainer");
    }
  }

  const filtered = trainers.filter(
    (t) =>
      t.user.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.user.email.toLowerCase().includes(search.toLowerCase()) ||
      t.expertise.some((e) => e.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trainers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your teaching staff
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Trainer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Trainers", value: trainers.length },
          { label: "Active", value: trainers.filter((t) => t.user.status === "ACTIVE").length },
          { label: "Total Batches", value: trainers.reduce((s, t) => s + t._count.batches, 0) },
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
          placeholder="Search trainers..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <UserCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {search ? "No trainers match your search" : "No trainers yet. Add your first trainer!"}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((trainer) => (
            <div
              key={trainer.id}
              className="bg-card border border-border rounded-xl p-5 hover:border-border/80 transition-all"
            >
              {/* Avatar + name */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {initials(trainer.user.name || "TR")}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{trainer.user.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                      {trainer.user.email}
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    trainer.user.status === "ACTIVE"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {trainer.user.status}
                </span>
              </div>

              {/* Bio */}
              {trainer.bio && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{trainer.bio}</p>
              )}

              {/* Expertise tags */}
              {trainer.expertise.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {trainer.expertise.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {trainer.expertise.length > 3 && (
                    <span className="text-xs text-muted-foreground px-1">
                      +{trainer.expertise.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {trainer._count.batches} batch{trainer._count.batches !== 1 ? "es" : ""}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {trainer.courses.length} course{trainer.courses.length !== 1 ? "s" : ""}
                </span>
                {trainer.experience > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" />
                    {trainer.experience}y exp
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => deleteTrainer(trainer.id)}
                  className="p-2 border border-border rounded-lg text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {addOpen && (
        <AddTrainerModal
          onClose={() => setAddOpen(false)}
          onAdd={(t) => {
            setTrainers((prev) => [t as Trainer, ...prev]);
            setAddOpen(false);
          }}
        />
      )}
    </div>
  );
}
