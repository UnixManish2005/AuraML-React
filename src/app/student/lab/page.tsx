// ============================================================
// ML LEARNING LAB
// ============================================================

"use client";

import { useState } from "react";
import { Beaker, TrendingUp, GitBranch, Circle, BarChart2, Layers, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import LinearRegressionLab from "@/components/lab/linear-regression";
import KMeansLab from "@/components/lab/kmeans";
import DecisionTreeLab from "@/components/lab/decision-tree";

const LABS = [
  { id: "linear-regression", name: "Linear Regression", icon: TrendingUp, color: "from-blue-500 to-blue-600", desc: "Visualize how the model fits a line to data" },
  { id: "kmeans", name: "K-Means Clustering", icon: Circle, color: "from-violet-500 to-violet-600", desc: "Watch clusters form in real-time" },
  { id: "decision-tree", name: "Decision Tree", icon: GitBranch, color: "from-emerald-500 to-emerald-600", desc: "Explore decision boundaries interactively" },
  { id: "logistic", name: "Logistic Regression", icon: BarChart2, color: "from-amber-500 to-amber-600", desc: "Binary classification visualization" },
  { id: "neural", name: "Neural Network", icon: Layers, color: "from-rose-500 to-rose-600", desc: "See how layers learn representations" },
];

export default function MLLabPage() {
  const [activeLabId, setActiveLabId] = useState("linear-regression");

  const ActiveLab = {
    "linear-regression": <LinearRegressionLab />,
    "kmeans": <KMeansLab />,
    "decision-tree": <DecisionTreeLab />,
  }[activeLabId] || (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="text-4xl mb-3">🚧</div>
        <p className="text-muted-foreground text-sm">This lab is coming soon!</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
          <Beaker className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI/ML Learning Lab</h1>
          <p className="text-muted-foreground text-sm">Interactive visual experiments — adjust parameters and see results live</p>
        </div>
      </div>

      {/* Lab selector */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {LABS.map((lab) => (
          <button
            key={lab.id}
            onClick={() => setActiveLabId(lab.id)}
            className={cn(
              "flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
              activeLabId === lab.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-border/80 hover:bg-muted/50"
            )}
          >
            <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0", lab.color)}>
              <lab.icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className={cn("text-sm font-medium", activeLabId === lab.id && "text-primary")}>{lab.name}</div>
              <div className="text-xs text-muted-foreground hidden md:block">{lab.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Active Lab */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {ActiveLab}
      </div>
    </div>
  );
}
