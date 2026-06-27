// ============================================================
// K-MEANS CLUSTERING LAB
// ============================================================

"use client";

import { useState, useMemo } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Play, RefreshCw } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#7c3aed", "#06b6d4", "#ec4899"];

function generateClusters(k: number, n: number) {
  const centers = Array.from({ length: k }, () => ({
    cx: Math.random() * 80 + 10,
    cy: Math.random() * 80 + 10,
  }));
  return Array.from({ length: n }, () => {
    const ci = Math.floor(Math.random() * k);
    return {
      x: centers[ci].cx + (Math.random() - 0.5) * 25,
      y: centers[ci].cy + (Math.random() - 0.5) * 25,
      cluster: -1,
    };
  });
}

function assignClusters(data: { x: number; y: number; cluster: number }[], centroids: { x: number; y: number }[]) {
  return data.map((pt) => {
    let minDist = Infinity;
    let cluster = 0;
    centroids.forEach((c, i) => {
      const d = Math.sqrt(Math.pow(pt.x - c.x, 2) + Math.pow(pt.y - c.y, 2));
      if (d < minDist) { minDist = d; cluster = i; }
    });
    return { ...pt, cluster };
  });
}

function computeCentroids(data: { x: number; y: number; cluster: number }[], k: number) {
  return Array.from({ length: k }, (_, i) => {
    const pts = data.filter((d) => d.cluster === i);
    if (pts.length === 0) return { x: Math.random() * 100, y: Math.random() * 100 };
    return { x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length };
  });
}

export default function KMeansLab() {
  const [k, setK] = useState(3);
  const [n, setN] = useState(80);
  const [iteration, setIteration] = useState(0);
  const [seed, setSeed] = useState(0);

  const rawData = useMemo(() => generateClusters(k, n), [k, n, seed]);

  const { data, centroids } = useMemo(() => {
    let pts = rawData.map((p) => ({ ...p }));
    let cents = Array.from({ length: k }, () => ({
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
    }));

    for (let i = 0; i < iteration; i++) {
      pts = assignClusters(pts, cents);
      cents = computeCentroids(pts, k);
    }

    return { data: pts, centroids: cents };
  }, [rawData, k, iteration]);

  // Group by cluster for rendering
  const clusterGroups = useMemo(() =>
    Array.from({ length: k }, (_, i) => data.filter((d) => d.cluster === i || iteration === 0)),
    [data, k, iteration]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">K-Means Clustering</h2>
          <p className="text-sm text-muted-foreground">Watch clusters form as the algorithm iterates</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setSeed((s) => s + 1); setIteration(0); }} className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted">
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
          <button onClick={() => setIteration((i) => Math.min(i + 1, 20))} className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            <Play className="w-4 h-4" /> Step
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-xl p-4 space-y-4">
            {[
              { label: `K (clusters) = ${k}`, value: k, min: 2, max: 7, onChange: (v: number) => { setK(v); setIteration(0); setSeed((s) => s + 1); } },
              { label: `Points (n) = ${n}`, value: n, min: 20, max: 200, step: 10, onChange: (v: number) => { setN(v); setIteration(0); } },
            ].map((ctrl) => (
              <div key={ctrl.label}>
                <div className="text-xs text-muted-foreground mb-1.5">{ctrl.label}</div>
                <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step || 1} value={ctrl.value}
                  onChange={(e) => ctrl.onChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-primary" />
              </div>
            ))}
          </div>
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-primary">{iteration}</div>
            <div className="text-xs text-muted-foreground">Iteration{iteration !== 1 ? "s" : ""}</div>
            <div className="mt-2 text-xs">{iteration === 0 ? "Click Step to start" : iteration < 5 ? "Still converging..." : "Nearly converged ✓"}</div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="x" type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis dataKey="y" type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip content={() => null} />
              {Array.from({ length: k }, (_, i) => (
                <Scatter key={i} data={data.filter((d) => d.cluster === i || iteration === 0)}
                  fill={COLORS[i % COLORS.length]} fillOpacity={0.7} />
              ))}
              {/* Centroids */}
              {iteration > 0 && (
                <Scatter data={centroids.map((c, i) => ({ ...c, i }))}
                  fill="white" shape="star" />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-muted/20 rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">📚 K-Means Algorithm Steps</h3>
        <div className="grid md:grid-cols-4 gap-3 text-xs text-muted-foreground">
          {[
            { step: "1", title: "Initialize", desc: "Randomly place K centroids" },
            { step: "2", title: "Assign", desc: "Each point joins nearest centroid" },
            { step: "3", title: "Update", desc: "Move centroid to cluster mean" },
            { step: "4", title: "Repeat", desc: "Until centroids stop moving" },
          ].map((s) => (
            <div key={s.step} className="flex gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 font-bold">{s.step}</div>
              <div><div className="font-medium text-foreground">{s.title}</div><p className="mt-0.5">{s.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
