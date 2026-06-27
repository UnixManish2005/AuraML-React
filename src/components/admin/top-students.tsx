// ============================================================
// TOP STUDENTS COMPONENT
// ============================================================

"use client";

import { Trophy } from "lucide-react";
import { initials, formatNumber } from "@/lib/utils";

interface TopStudentsProps {
  students: Array<{
    id: string;
    totalPoints: number;
    user: { name: string | null; email: string; image: string | null };
  }>;
}

const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

export function TopStudents({ students }: TopStudentsProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-4 h-4 text-amber-500" />
        <h3 className="font-semibold">Top Students</h3>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">No data yet</div>
      ) : (
        <div className="space-y-3">
          {students.map((student, i) => (
            <div key={student.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="text-xl w-7 text-center">{medals[i] || (i + 1)}</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials(student.user.name || "S")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{student.user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{student.user.email}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-blue-500">{formatNumber(student.totalPoints)}</div>
                <div className="text-xs text-muted-foreground">pts</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TopStudents;
