"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function QuizListActions({
  quizId,
  isPublished: initial,
}: {
  quizId: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [isPublished, setIsPublished] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function togglePublish() {
    setLoading(true);
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      if (!res.ok) throw new Error("Failed");
      setIsPublished((p) => !p);
      toast.success(!isPublished ? "Quiz is now live!" : "Quiz moved to draft");
      router.refresh();
    } catch {
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  }

  async function deleteQuiz() {
    if (!confirm("Delete this quiz? All attempts will also be deleted.")) return;
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Quiz deleted");
      router.refresh();
    } catch {
      toast.error("Delete failed");
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Link href={`/admin/quizzes/${quizId}`}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        title="Edit quiz">
        <Edit className="w-3.5 h-3.5" />
      </Link>
      <button onClick={togglePublish} disabled={loading}
        title={isPublished ? "Unpublish" : "Publish"}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-40">
        {isPublished
          ? <ToggleRight className="w-3.5 h-3.5 text-emerald-500" />
          : <ToggleLeft className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      <button onClick={deleteQuiz}
        title="Delete quiz"
        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-red-500">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}