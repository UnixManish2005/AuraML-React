// ============================================================
// NEURAL NETWORK LAB
// A tiny feedforward network you can poke at: change inputs,
// activation function, and weights, and watch values flow
// through the network live.
// ============================================================

"use client";

import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceDot, ResponsiveContainer } from "recharts";
import { Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

type Activation = "sigmoid" | "relu" | "tanh";

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}
function relu(z: number): number {
  return Math.max(0, z);
}
function applyActivation(fn: Activation, z: number): number {
  if (fn === "sigmoid") return sigmoid(z);
  if (fn === "relu") return relu(z);
  return Math.tanh(z);
}

function randomWeight() {
  return Math.round((Math.random() * 2 - 1) * 100) / 100;
}

function layerYPositions(count: number, height: number): number[] {
  const spacing = height / (count + 1);
  return Array.from({ length: count }, (_, i) => spacing * (i + 1));
}

const ACTIVATION_CURVE: Record<Activation, { z: number; a: number }[]> = {
  sigmoid: Array.from({ length: 61 }, (_, i) => {
    const z = -6 + i * 0.2;
    return { z: Math.round(z * 10) / 10, a: sigmoid(z) };
  }),
  relu: Array.from({ length: 61 }, (_, i) => {
    const z = -6 + i * 0.2;
    return { z: Math.round(z * 10) / 10, a: relu(z) };
  }),
  tanh: Array.from({ length: 61 }, (_, i) => {
    const z = -6 + i * 0.2;
    return { z: Math.round(z * 10) / 10, a: Math.tanh(z) };
  }),
};

const VIEW_W = 640;
const VIEW_H = 320;
const INPUT_X = 70;
const HIDDEN_X = 320;
const OUTPUT_X = 570;

export default function NeuralNetworkLab() {
  const [x1, setX1] = useState(0.6);
  const [x2, setX2] = useState(-0.4);
  const [hiddenSize, setHiddenSize] = useState(3);
  const [activation, setActivation] = useState<Activation>("sigmoid");
  const [seed, setSeed] = useState(0);

  const weights = useMemo(() => {
    const w1 = Array.from({ length: 2 }, () => Array.from({ length: hiddenSize }, randomWeight));
    const b1 = Array.from({ length: hiddenSize }, randomWeight);
    const w2 = Array.from({ length: hiddenSize }, randomWeight);
    const b2 = randomWeight();
    return { w1, b1, w2, b2 };
  }, [hiddenSize, seed]);

  const forward = useMemo(() => {
    const inputs = [x1, x2];
    const hiddenPre = Array.from({ length: hiddenSize }, (_, j) =>
      inputs.reduce((sum, xi, i) => sum + xi * weights.w1[i][j], 0) + weights.b1[j]
    );
    const hiddenAct = hiddenPre.map((z) => applyActivation(activation, z));
    const outputPre = hiddenAct.reduce((sum, a, j) => sum + a * weights.w2[j], 0) + weights.b2;
    const output = sigmoid(outputPre);
    return { inputs, hiddenPre, hiddenAct, outputPre, output };
  }, [x1, x2, hiddenSize, activation, weights]);

  const inputYs = useMemo(() => layerYPositions(2, VIEW_H), []);
  const hiddenYs = useMemo(() => layerYPositions(hiddenSize, VIEW_H), [hiddenSize]);
  const outputYs = useMemo(() => layerYPositions(1, VIEW_H), []);

  const normFor = (act: Activation, v: number): number => {
    if (act === "sigmoid") return v;
    if (act === "tanh") return (v + 1) / 2;
    return Math.min(1, Math.max(0, v / 2)); // relu — clamp for display color only
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-semibold text-lg">Neural Network</h2>
          <p className="text-sm text-muted-foreground">Watch a value travel through weights, biases, and an activation function</p>
        </div>
        <button onClick={() => setSeed((s) => s + 1)} className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
          <Shuffle className="w-4 h-4" /> Randomize Weights
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-medium">Inputs</h3>
            {[
              { label: "x1", value: x1, onChange: setX1 },
              { label: "x2", value: x2, onChange: setX2 },
            ].map((ctrl) => (
              <div key={ctrl.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">{ctrl.label}</span>
                  <span className="font-mono font-medium">{ctrl.value.toFixed(2)}</span>
                </div>
                <input type="range" min={-1} max={1} step={0.05} value={ctrl.value}
                  onChange={(e) => ctrl.onChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-primary" />
              </div>
            ))}

            <h3 className="text-sm font-medium pt-2">Hidden neurons</h3>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Count</span>
                <span className="font-mono font-medium">{hiddenSize}</span>
              </div>
              <input type="range" min={2} max={5} step={1} value={hiddenSize}
                onChange={(e) => setHiddenSize(Number(e.target.value))}
                className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-primary" />
            </div>

            <h3 className="text-sm font-medium pt-2">Activation function</h3>
            <div className="flex gap-2">
              {(["sigmoid", "relu", "tanh"] as Activation[]).map((fn) => (
                <button key={fn} onClick={() => setActivation(fn)}
                  className={cn(
                    "flex-1 text-xs px-2 py-1.5 rounded-lg border capitalize transition-colors",
                    activation === fn ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:bg-muted"
                  )}>
                  {fn}
                </button>
              ))}
            </div>
          </div>

          {/* Activation curve */}
          <div className="bg-muted/30 rounded-xl p-4">
            <h3 className="text-sm font-medium mb-2 capitalize">{activation} curve</h3>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={ACTIVATION_CURVE[activation]} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="z" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Line type="monotone" dataKey="a" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                {forward.hiddenPre.map((z, i) => (
                  <ReferenceDot key={i} x={Math.round(z * 10) / 10} y={applyActivation(activation, z)} r={4} fill="#f97316" stroke="none" />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-muted-foreground mt-1">
              Orange dots show where each hidden neuron&apos;s weighted sum lands on the curve right now.
            </p>
          </div>

          {/* Output */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">NETWORK OUTPUT</div>
            <div className="text-3xl font-bold text-blue-500">{forward.output.toFixed(3)}</div>
            <p className="text-xs text-muted-foreground mt-1">sigmoid applied at the output for a 0–1 result</p>
          </div>
        </div>

        {/* Network diagram */}
        <div className="lg:col-span-2 bg-muted/20 rounded-xl p-4">
          <h3 className="text-sm font-medium mb-2">Forward pass</h3>
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-auto">
            {/* edges: input -> hidden */}
            {inputYs.map((iy, i) =>
              hiddenYs.map((hy, j) => {
                const w = weights.w1[i][j];
                return (
                  <line key={`ih-${i}-${j}`} x1={INPUT_X} y1={iy} x2={HIDDEN_X} y2={hy}
                    stroke={w >= 0 ? "#3b82f6" : "#ef4444"}
                    strokeWidth={Math.min(4, 0.5 + Math.abs(w) * 3)}
                    strokeOpacity={0.35 + Math.min(0.4, Math.abs(w) * 0.3)} />
                );
              })
            )}
            {/* edges: hidden -> output */}
            {hiddenYs.map((hy, j) => {
              const w = weights.w2[j];
              return (
                <line key={`ho-${j}`} x1={HIDDEN_X} y1={hy} x2={OUTPUT_X} y2={outputYs[0]}
                  stroke={w >= 0 ? "#3b82f6" : "#ef4444"}
                  strokeWidth={Math.min(4, 0.5 + Math.abs(w) * 3)}
                  strokeOpacity={0.35 + Math.min(0.4, Math.abs(w) * 0.3)} />
              );
            })}

            {/* input nodes */}
            {inputYs.map((iy, i) => (
              <g key={`in-${i}`}>
                <circle cx={INPUT_X} cy={iy} r={22} fill="#7c3aed" fillOpacity={0.15 + 0.8 * Math.min(1, Math.max(0, (forward.inputs[i] + 1) / 2))} stroke="#7c3aed" strokeWidth={1.5} />
                <text x={INPUT_X} y={iy + 4} textAnchor="middle" fontSize={12} fontWeight={600} fill="currentColor">{forward.inputs[i].toFixed(2)}</text>
                <text x={INPUT_X} y={iy - 30} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.6}>x{i + 1}</text>
              </g>
            ))}

            {/* hidden nodes */}
            {hiddenYs.map((hy, j) => (
              <g key={`hid-${j}`}>
                <circle cx={HIDDEN_X} cy={hy} r={22} fill="#3b82f6" fillOpacity={0.15 + 0.8 * normFor(activation, forward.hiddenAct[j])} stroke="#3b82f6" strokeWidth={1.5} />
                <text x={HIDDEN_X} y={hy + 4} textAnchor="middle" fontSize={12} fontWeight={600} fill="currentColor">{forward.hiddenAct[j].toFixed(2)}</text>
                <text x={HIDDEN_X} y={hy - 30} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.6}>z={forward.hiddenPre[j].toFixed(2)}</text>
              </g>
            ))}

            {/* output node */}
            {outputYs.map((oy, i) => (
              <g key={`out-${i}`}>
                <circle cx={OUTPUT_X} cy={oy} r={24} fill="#10b981" fillOpacity={0.15 + 0.8 * forward.output} stroke="#10b981" strokeWidth={1.5} />
                <text x={OUTPUT_X} y={oy + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor">{forward.output.toFixed(2)}</text>
                <text x={OUTPUT_X} y={oy - 32} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.6}>output</text>
              </g>
            ))}
          </svg>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5"><div className="w-6 h-0.5 bg-blue-500" /> Positive weight</div>
            <div className="flex items-center gap-1.5"><div className="w-6 h-0.5 bg-red-500" /> Negative weight</div>
            <span>Line thickness = weight magnitude · Node fill = activation strength</span>
          </div>
        </div>
      </div>

      {/* Concept explanation */}
      <div className="bg-muted/20 rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">📚 How It Works</h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-muted-foreground">
          <div>
            <strong className="text-foreground">1. Weighted sum</strong>
            <p className="mt-1">Each hidden neuron computes <code className="bg-muted px-1 rounded text-xs">z = Σ(xᵢ·wᵢ) + b</code></p>
          </div>
          <div>
            <strong className="text-foreground">2. Activation</strong>
            <p className="mt-1">z is squashed/shaped by a nonlinear function so the network can learn curves, not just lines</p>
          </div>
          <div>
            <strong className="text-foreground">3. Layers stack</strong>
            <p className="mt-1">Hidden activations become the inputs to the next layer&apos;s weighted sum</p>
          </div>
          <div>
            <strong className="text-foreground">4. Output</strong>
            <p className="mt-1">The final layer turns everything into a prediction — here, a probability</p>
          </div>
        </div>
      </div>
    </div>
  );
}
