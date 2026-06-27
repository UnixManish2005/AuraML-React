// ============================================================
// LINEAR REGRESSION LAB
// ============================================================

"use client";

import { useState, useMemo, useCallback } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine } from "recharts";
import { RefreshCw, Plus } from "lucide-react";

function generateDataset(n: number, noise: number, slope: number, intercept: number) {
  return Array.from({ length: n }, (_, i) => {
    const x = (i / n) * 100;
    const y = slope * x + intercept + (Math.random() - 0.5) * noise * 100;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  });
}

function computeRegression(data: { x: number; y: number }[]) {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0, r2: 0 };

  const sumX = data.reduce((s, d) => s + d.x, 0);
  const sumY = data.reduce((s, d) => s + d.y, 0);
  const sumXY = data.reduce((s, d) => s + d.x * d.y, 0);
  const sumX2 = data.reduce((s, d) => s + d.x * d.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const meanY = sumY / n;
  const ssTot = data.reduce((s, d) => s + Math.pow(d.y - meanY, 2), 0);
  const ssRes = data.reduce((s, d) => s + Math.pow(d.y - (slope * d.x + intercept), 2), 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { slope: Math.round(slope * 1000) / 1000, intercept: Math.round(intercept * 100) / 100, r2: Math.round(r2 * 1000) / 1000 };
}

export default function LinearRegressionLab() {
  const [n, setN] = useState(30);
  const [noise, setNoise] = useState(0.3);
  const [trueSlope, setTrueSlope] = useState(2);
  const [trueIntercept, setTrueIntercept] = useState(10);
  const [seed, setSeed] = useState(0);

  const data = useMemo(() => generateDataset(n, noise, trueSlope, trueIntercept), [n, noise, trueSlope, trueIntercept, seed]);
  const regression = useMemo(() => computeRegression(data), [data]);

  const regressionLine = useMemo(() =>
    [{ x: 0, y: regression.intercept }, { x: 100, y: regression.slope * 100 + regression.intercept }],
    [regression]
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">Linear Regression</h2>
          <p className="text-sm text-muted-foreground">Adjust parameters to see how the model fits your data</p>
        </div>
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> New Data
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-medium">Data Parameters</h3>

            {[
              { label: "Sample Size (n)", value: n, min: 10, max: 200, step: 10, onChange: setN },
              { label: "Noise Level", value: noise, min: 0, max: 1, step: 0.05, onChange: setNoise },
            ].map((ctrl) => (
              <div key={ctrl.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">{ctrl.label}</span>
                  <span className="font-mono font-medium">{ctrl.value}</span>
                </div>
                <input
                  type="range"
                  min={ctrl.min}
                  max={ctrl.max}
                  step={ctrl.step}
                  value={ctrl.value}
                  onChange={(e) => ctrl.onChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
            ))}

            <h3 className="text-sm font-medium pt-2">True Relationship</h3>

            {[
              { label: "True Slope (m)", value: trueSlope, min: -5, max: 5, step: 0.1, onChange: setTrueSlope },
              { label: "True Intercept (b)", value: trueIntercept, min: -50, max: 100, step: 5, onChange: setTrueIntercept },
            ].map((ctrl) => (
              <div key={ctrl.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">{ctrl.label}</span>
                  <span className="font-mono font-medium">{ctrl.value}</span>
                </div>
                <input
                  type="range"
                  min={ctrl.min}
                  max={ctrl.max}
                  step={ctrl.step}
                  value={ctrl.value}
                  onChange={(e) => ctrl.onChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
            ))}
          </div>

          {/* Results */}
          <div className="bg-muted/30 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-medium">Learned Parameters</h3>
            {[
              { label: "Slope (m̂)", value: regression.slope, trueVal: trueSlope },
              { label: "Intercept (b̂)", value: regression.intercept, trueVal: trueIntercept },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{r.label}</span>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-blue-500">{r.value}</span>
                  <span className="text-xs text-muted-foreground ml-2">(true: {r.trueVal})</span>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">R² Score</span>
                <span className={`font-mono text-sm font-bold ${regression.r2 >= 0.8 ? "text-emerald-500" : regression.r2 >= 0.5 ? "text-amber-500" : "text-red-500"}`}>
                  {regression.r2}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {regression.r2 >= 0.8 ? "Excellent fit! 🎯" : regression.r2 >= 0.5 ? "Moderate fit 📊" : "Poor fit — try less noise 📉"}
              </p>
            </div>
          </div>

          {/* Equation */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">REGRESSION EQUATION</h3>
            <div className="font-mono text-sm text-blue-400">
              ŷ = {regression.slope}x + {regression.intercept}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2">
          <div className="bg-muted/20 rounded-xl p-4">
            <h3 className="text-sm font-medium mb-4">Scatter Plot with Regression Line</h3>
            <ResponsiveContainer width="100%" height={380}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  label={{ value: "Feature (X)", position: "insideBottom", offset: -5, fontSize: 11 }}
                />
                <YAxis
                  dataKey="y"
                  type="number"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  label={{ value: "Target (Y)", angle: -90, position: "insideLeft", fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="bg-card border border-border rounded-lg p-2 text-xs">
                          <p>X: {payload[0]?.value}</p>
                          <p>Y: {payload[1]?.value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={data} fill="#3b82f6" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>

            {/* Regression line overlay */}
            <div className="mt-2">
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={regressionLine}>
                  <XAxis dataKey="x" domain={[0, 100]} hide />
                  <YAxis hide />
                  <Line type="linear" dataKey="y" stroke="#ef4444" strokeWidth={2} dot={false} name="Regression Line" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500/60" /> Data Points</div>
                <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-red-500" /> Regression Line</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Concept explanation */}
      <div className="bg-muted/20 rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">📚 How It Works</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div>
            <strong className="text-foreground">1. Hypothesis</strong>
            <p className="mt-1">We assume a linear relationship: <code className="bg-muted px-1 rounded text-xs">ŷ = mx + b</code></p>
          </div>
          <div>
            <strong className="text-foreground">2. Cost Function</strong>
            <p className="mt-1">Mean Squared Error minimizes <code className="bg-muted px-1 rounded text-xs">Σ(y - ŷ)²</code></p>
          </div>
          <div>
            <strong className="text-foreground">3. R² Score</strong>
            <p className="mt-1">Measures how well the model explains variance. 1.0 = perfect fit.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
