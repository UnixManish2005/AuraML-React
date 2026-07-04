// ============================================================
// LOGISTIC REGRESSION LAB
// Binary classification: weighted sum -> sigmoid -> probability
// ============================================================

"use client";

import { useMemo, useState } from "react";
import {
  ComposedChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import { RefreshCw, Play, Zap } from "lucide-react";

interface Point {
  x: number;
  y: number;
  label: 0 | 1;
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

function generateData(n: number, spread: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    pts.push({
      x: Math.max(2, Math.min(98, 30 + (Math.random() - 0.5) * 40 * spread)),
      y: Math.max(2, Math.min(98, 35 + (Math.random() - 0.5) * 40 * spread)),
      label: 0,
    });
    pts.push({
      x: Math.max(2, Math.min(98, 70 + (Math.random() - 0.5) * 40 * spread)),
      y: Math.max(2, Math.min(98, 65 + (Math.random() - 0.5) * 40 * spread)),
      label: 1,
    });
  }
  return pts;
}

function trainStep(data: Point[], w1: number, w2: number, b: number, lr: number) {
  let gw1 = 0, gw2 = 0, gb = 0;
  data.forEach((d) => {
    const xn = d.x / 100;
    const yn = d.y / 100;
    const p = sigmoid(w1 * xn + w2 * yn + b);
    const err = p - d.label;
    gw1 += err * xn;
    gw2 += err * yn;
    gb += err;
  });
  const n = data.length || 1;
  return {
    w1: w1 - lr * (gw1 / n),
    w2: w2 - lr * (gw2 / n),
    b: b - lr * (gb / n),
  };
}

function evaluate(data: Point[], w1: number, w2: number, b: number) {
  let loss = 0;
  let correct = 0;
  data.forEach((d) => {
    const p = sigmoid(w1 * (d.x / 100) + w2 * (d.y / 100) + b);
    const clamped = Math.min(Math.max(p, 1e-7), 1 - 1e-7);
    loss += -(d.label * Math.log(clamped) + (1 - d.label) * Math.log(1 - clamped));
    const pred = p >= 0.5 ? 1 : 0;
    if (pred === d.label) correct++;
  });
  const n = data.length || 1;
  return { loss: loss / n, accuracy: correct / n };
}

const SIGMOID_CURVE = Array.from({ length: 61 }, (_, i) => {
  const z = -6 + i * 0.2;
  return { z: Math.round(z * 10) / 10, p: sigmoid(z) };
});

const GRID_RES = 26;
const GRID_POINTS = Array.from({ length: GRID_RES }, (_, i) =>
  Array.from({ length: GRID_RES }, (_, j) => ({
    x: (i / (GRID_RES - 1)) * 100,
    y: (j / (GRID_RES - 1)) * 100,
  }))
).flat();

export default function LogisticRegressionLab() {
  const [n, setN] = useState(20);
  const [spread, setSpread] = useState(0.8);
  const [seed, setSeed] = useState(0);

  const [w1, setW1] = useState(3);
  const [w2, setW2] = useState(-2);
  const [b, setB] = useState(0);

  const data = useMemo(() => generateData(n, spread), [n, spread, seed]);
  const metrics = useMemo(() => evaluate(data, w1, w2, b), [data, w1, w2, b]);

  const gridPredicted = useMemo(
    () =>
      GRID_POINTS.map((p) => ({
        ...p,
        pred: sigmoid(w1 * (p.x / 100) + w2 * (p.y / 100) + b) >= 0.5 ? 1 : 0,
      })),
    [w1, w2, b]
  );
  const grid0 = useMemo(() => gridPredicted.filter((p) => p.pred === 0), [gridPredicted]);
  const grid1 = useMemo(() => gridPredicted.filter((p) => p.pred === 1), [gridPredicted]);

  const class0 = useMemo(() => data.filter((d) => d.label === 0), [data]);
  const class1 = useMemo(() => data.filter((d) => d.label === 1), [data]);

  const boundaryLine = useMemo(() => {
    if (Math.abs(w2) < 0.05) return null;
    const yAt = (x: number) => -100 * ((w1 * (x / 100) + b) / w2);
    return [{ x: 0, y: yAt(0) }, { x: 100, y: yAt(100) }];
  }, [w1, w2, b]);

  const handleTrainStep = () => {
    const updated = trainStep(data, w1, w2, b, 0.5);
    setW1(Math.round(updated.w1 * 1000) / 1000);
    setW2(Math.round(updated.w2 * 1000) / 1000);
    setB(Math.round(updated.b * 1000) / 1000);
  };

  const handleReset = () => {
    setSeed((s) => s + 1);
    setW1(0.2);
    setW2(-0.2);
    setB(0);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-semibold text-lg">Logistic Regression</h2>
          <p className="text-sm text-muted-foreground">Draw a line to separate two classes, then let gradient descent improve it</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
          <button onClick={handleTrainStep} className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            <Play className="w-4 h-4" /> Train Step
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-medium">Data</h3>
            {[
              { label: "Points per class", value: n, min: 5, max: 50, step: 5, onChange: setN },
              { label: "Class spread (overlap)", value: spread, min: 0.2, max: 2, step: 0.1, onChange: setSpread },
            ].map((ctrl) => (
              <div key={ctrl.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">{ctrl.label}</span>
                  <span className="font-mono font-medium">{ctrl.value}</span>
                </div>
                <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={ctrl.value}
                  onChange={(e) => ctrl.onChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-primary" />
              </div>
            ))}

            <h3 className="text-sm font-medium pt-2">Model weights (manual)</h3>
            {[
              { label: "w1 (x weight)", value: w1, min: -6, max: 6, step: 0.1, onChange: setW1 },
              { label: "w2 (y weight)", value: w2, min: -6, max: 6, step: 0.1, onChange: setW2 },
              { label: "b (bias)", value: b, min: -4, max: 4, step: 0.1, onChange: setB },
            ].map((ctrl) => (
              <div key={ctrl.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">{ctrl.label}</span>
                  <span className="font-mono font-medium">{ctrl.value}</span>
                </div>
                <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={ctrl.value}
                  onChange={(e) => ctrl.onChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-primary" />
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div className="bg-muted/30 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Performance</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Log Loss</span>
              <span className="font-mono text-sm font-bold text-red-500">{metrics.loss.toFixed(3)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Accuracy</span>
              <span className={`font-mono text-sm font-bold ${metrics.accuracy >= 0.85 ? "text-emerald-500" : metrics.accuracy >= 0.6 ? "text-amber-500" : "text-red-500"}`}>
                {(metrics.accuracy * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Click <strong className="text-foreground">Train Step</strong> repeatedly and watch loss drop as the boundary shifts on its own.
            </p>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">MODEL</h3>
            <div className="font-mono text-xs text-blue-400 leading-relaxed">
              z = {w1}·x + {w2}·y + {b}<br />
              p = sigmoid(z)<br />
              predict 1 if p ≥ 0.5
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-muted/20 rounded-xl p-4">
            <h3 className="text-sm font-medium mb-3">Decision boundary</h3>
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="x" type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis dataKey="y" type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip content={() => null} />
                {/* predicted-region backdrop */}
                <Scatter data={grid0} fill="#fca5a5" fillOpacity={0.25} />
                <Scatter data={grid1} fill="#93c5fd" fillOpacity={0.25} />
                {/* boundary line */}
                {boundaryLine && (
                  <Line data={boundaryLine} dataKey="y" stroke="#111827" strokeWidth={2} dot={false} isAnimationActive={false} legendType="none" />
                )}
                {/* actual data */}
                <Scatter data={class0} fill="#ef4444" fillOpacity={0.9} />
                <Scatter data={class1} fill="#3b82f6" fillOpacity={0.9} />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Class 0</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Class 1</div>
              <div className="flex items-center gap-1.5"><div className="w-6 h-0.5 bg-gray-900 dark:bg-gray-200" /> Decision boundary</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-300/50" /> Predicted region 0</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-300/50" /> Predicted region 1</div>
            </div>
          </div>

          <div className="bg-muted/20 rounded-xl p-4">
            <h3 className="text-sm font-medium mb-2">The sigmoid squashes any number into 0–1</h3>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={SIGMOID_CURVE} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="z" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <ReferenceLine y={0.5} stroke="#f59e0b" strokeDasharray="4 4" />
                <ReferenceLine x={0} stroke="hsl(var(--border))" />
                <Line type="monotone" dataKey="p" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Concept explanation */}
      <div className="bg-muted/20 rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">📚 How It Works</h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-muted-foreground">
          <div>
            <strong className="text-foreground">1. Weighted sum</strong>
            <p className="mt-1">Combine features: <code className="bg-muted px-1 rounded text-xs">z = w1·x + w2·y + b</code></p>
          </div>
          <div>
            <strong className="text-foreground">2. Sigmoid</strong>
            <p className="mt-1">Squash z into a probability between 0 and 1</p>
          </div>
          <div>
            <strong className="text-foreground">3. Threshold</strong>
            <p className="mt-1">Predict class 1 if p ≥ 0.5, otherwise class 0</p>
          </div>
          <div>
            <strong className="text-foreground">4. Gradient descent</strong>
            <p className="mt-1">Nudge w1, w2, b to reduce log loss on every step</p>
          </div>
        </div>
      </div>
    </div>
  );
}
