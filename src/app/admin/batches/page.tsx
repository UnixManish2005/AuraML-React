// ============================================================
// ADMIN BATCHES PAGE
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Users, Calendar, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDate, getBatchStatusColor, cn } from "@/lib/utils";
import AddBatchModal from "@/components/admin/add-batch-modal";

interface Batch {
  id: string;
  name: string;
  status: string;
  capacity: number;
  startDate: string;
  endDate: string;
  course: { title: string };
  trainer: { user: { name: string | null } };
  _count: { batchStudents: number };
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/batches")
      .then((r) => r.json())
      .then((d) => { setBatches(d.batches || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function deleteBatch(id: string) {
    if (!confirm("Delete this batch?")) return;
    try {
      await fetch(`/api/admin/batches/${id}`, { method: "DELETE" });
      setBatches((prev) => prev.filter((b) => b.id !== id));
      toast.success("Batch deleted");
    } catch { toast.error("Delete failed"); }
  }

  const filtered = batches.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.course.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Batches</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage student groups and schedules</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Batch
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search batches..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:border-primary/50"
        />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No batches found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((batch) => {
            const fillPercent = Math.round((batch._count.batchStudents / batch.capacity) * 100);
            return (
              <div key={batch.id} className="bg-card border border-border rounded-xl p-5 hover:border-border/80 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{batch.name}</h3>
                    <p className="text-sm text-muted-foreground">{batch.course.title}</p>
                  </div>
                  <span className={cn("text-xs px-2 py-1 rounded-full font-medium", getBatchStatusColor(batch.status))}>
                    {batch.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    <span>{batch.trainer.user.name || "Unassigned"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(batch.startDate)} → {formatDate(batch.endDate)}</span>
                  </div>
                </div>

                {/* Capacity bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Students</span>
                    <span>{batch._count.batchStudents}/{batch.capacity}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className={cn("h-1.5 rounded-full", fillPercent >= 90 ? "bg-red-500" : fillPercent >= 70 ? "bg-amber-500" : "bg-emerald-500")}
                      style={{ width: `${Math.min(fillPercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/batches/${batch.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-border rounded-lg text-xs hover:bg-muted transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => deleteBatch(batch.id)}
                    className="p-2 border border-border rounded-lg text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href={`/admin/batches/${batch.id}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs hover:bg-primary/90 transition-colors"
                  >
                    View <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {addOpen && (
        <AddBatchModal
          onClose={() => setAddOpen(false)}
          onAdd={(b) => { setBatches((prev) => [b as Batch, ...prev]); setAddOpen(false); }}
        />
      )}
    </div>
  );
}
