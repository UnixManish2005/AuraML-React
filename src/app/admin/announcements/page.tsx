// ============================================================
// ADMIN ANNOUNCEMENTS PAGE
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { Plus, Bell, Edit, Trash2, Pin, PinOff, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";
import AddAnnouncementModal from "@/components/admin/add-announcement-modal";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  targetRoles: string[];
  isPublished: boolean;
  pinned: boolean;
  createdAt: string;
  author: { name: string | null };
}

const TYPE_COLORS: Record<string, string> = {
  NOTICE: "bg-blue-500/10 text-blue-600",
  EVENT: "bg-emerald-500/10 text-emerald-600",
  WORKSHOP: "bg-violet-500/10 text-violet-600",
  HACKATHON: "bg-amber-500/10 text-amber-600",
  PLACEMENT: "bg-cyan-500/10 text-cyan-600",
  GENERAL: "bg-muted text-muted-foreground",
};

const TYPE_ICONS: Record<string, string> = {
  NOTICE: "📋", EVENT: "🎉", WORKSHOP: "🔧", HACKATHON: "🏆", PLACEMENT: "💼", GENERAL: "📢",
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/announcements")
      .then((r) => r.json())
      .then((d) => { setAnnouncements(d.announcements || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function deleteAnnouncement(id: string) {
    if (!confirm("Delete this announcement?")) return;
    try {
      await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      toast.success("Deleted");
    } catch { toast.error("Delete failed"); }
  }

  async function togglePin(id: string, pinned: boolean) {
    try {
      await fetch(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !pinned }),
      });
      setAnnouncements((prev) => prev.map((a) => a.id === id ? { ...a, pinned: !pinned } : a));
    } catch { toast.error("Update failed"); }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-sm text-muted-foreground mt-1">Publish notices, events, and updates</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Pinned first */}
          {[...announcements].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map((ann) => (
            <div
              key={ann.id}
              className={cn(
                "bg-card border rounded-xl p-5",
                ann.pinned ? "border-primary/30 bg-primary/[0.02]" : "border-border"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">{TYPE_ICONS[ann.type] || "📢"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-sm">{ann.title}</h3>
                      {ann.pinned && (
                        <span className="text-xs text-primary flex items-center gap-0.5">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", TYPE_COLORS[ann.type])}>
                        {ann.type.charAt(0) + ann.type.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{ann.content}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>By {ann.author.name}</span>
                      <span>•</span>
                      <span>{formatDate(ann.createdAt)}</span>
                      <span>•</span>
                      <span>To: {ann.targetRoles.join(", ")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => togglePin(ann.id, ann.pinned)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                    title={ann.pinned ? "Unpin" : "Pin"}
                  >
                    {ann.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(ann.id)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {addOpen && (
        <AddAnnouncementModal
          onClose={() => setAddOpen(false)}
          onAdd={(a) => { setAnnouncements((prev) => [a as Announcement, ...prev]); setAddOpen(false); }}
        />
      )}
    </div>
  );
}
