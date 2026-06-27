// ============================================================
// TRAINER BATCHES PAGE
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { Users, Calendar, Search, ChevronRight, Layers } from "lucide-react";
import Link from "next/link";
import { formatDate, getBatchStatusColor, cn } from "@/lib/utils";

interface Batch {
  id: string;
  name: string;
  status: string;
  capacity: number;
  startDate: string;
  endDate: string;
  description: string | null;
  course: { title: string };
  trainer: { user: { name: string | null } };
  _count: { batchStudents: number };
}

export default function TrainerBatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/admin/batches")
      .then((r) => r.json())
      .then((d) => {
        setBatches(d.batches || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = batches.filter((b) => {
    const matchSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.course.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || b.status === filter;
    return matchSearch && matchFilter;
  });

  const statusCounts = {
    ALL: batches.length,
    ACTIVE: batches.filter((b) => b.status === "ACTIVE").length,
    UPCOMING: batches.filter((b) => b.status === "UPCOMING").length,
    COMPLETED: batches.filter((b) => b.status === "COMPLETED").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Batches</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All student groups assigned to you
        </p>
      </div>

      {/* Stat tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["ALL", "ACTIVE", "UPCOMING", "COMPLETED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-4 py-1.5 rounded-xl text-sm font-medium transition-colors",
              filter === s
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}{" "}
            <span className="ml-1 opacity-70">{statusCounts[s]}</span>
          </button>
        ))}
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

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Layers className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {search ? "No batches match your search" : "No batches assigned yet"}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((batch) => {
            const fillPercent = Math.round(
              (batch._count.batchStudents / batch.capacity) * 100
            );
            return (
              <div
                key={batch.id}
                className="bg-card border border-border rounded-xl p-5 hover:border-border/80 transition-all"
              >
                {/* Title + status */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{batch.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {batch.course.title}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full font-medium flex-shrink-0",
                      getBatchStatusColor(batch.status)
                    )}
                  >
                    {batch.status.charAt(0) + batch.status.slice(1).toLowerCase()}
                  </span>
                </div>

                {batch.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {batch.description}
                  </p>
                )}

                {/* Date row */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {formatDate(batch.startDate)} → {formatDate(batch.endDate)}
                  </span>
                </div>

                {/* Capacity bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> Students
                    </span>
                    <span>
                      {batch._count.batchStudents} / {batch.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        fillPercent >= 90
                          ? "bg-red-500"
                          : fillPercent >= 70
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      )}
                      style={{ width: `${Math.min(fillPercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* View button */}
                <Link
                  href={`/trainer/batches/${batch.id}`}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors"
                >
                  View Students <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
