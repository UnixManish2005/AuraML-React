// ============================================================
// CNN & COMPUTER VISION LAB
// Real, live pixel-level convolution + pooling running in the
// browser (no fake animation) — plus an architecture walkthrough
// and an interactive transfer learning / fine-tuning explorer.
// ============================================================

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Grid3x3, Layers, ArrowLeftRight, Lock, Unlock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------

const IMG_SIZE = 48; // internal resolution used for real math
const KERNEL_DISPLAY = 168;
const MAP_DISPLAY = 108;

type SampleId = "shapes" | "checkerboard" | "smiley" | "digit";

const SAMPLES: { id: SampleId; name: string }[] = [
  { id: "smiley", name: "Smiley" },
  { id: "shapes", name: "Shapes" },
  { id: "checkerboard", name: "Checkerboard" },
  { id: "digit", name: "Digit" },
];

type KernelId = "identity" | "edge" | "sharpen" | "blur" | "emboss" | "sobelX" | "sobelY" | "custom";

const KERNELS: Record<Exclude<KernelId, "custom">, { name: string; matrix: number[][]; desc: string }> = {
  identity: { name: "Identity", matrix: [[0, 0, 0], [0, 1, 0], [0, 0, 0]], desc: "Passes the image through unchanged — the baseline." },
  edge: { name: "Edge Detect", matrix: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]], desc: "Lights up wherever a pixel differs sharply from its neighbors — i.e. an edge." },
  sharpen: { name: "Sharpen", matrix: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], desc: "Boosts the difference between a pixel and its neighbors, making edges crisper." },
  blur: { name: "Box Blur", matrix: [[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]], desc: "Averages each pixel with its neighbors, smoothing out detail." },
  emboss: { name: "Emboss", matrix: [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]], desc: "Highlights directional change, giving a raised, 3D-looking effect." },
  sobelX: { name: "Sobel (Vertical Edges)", matrix: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], desc: "Responds strongly to vertical edges by measuring left-right contrast." },
  sobelY: { name: "Sobel (Horizontal Edges)", matrix: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]], desc: "Responds strongly to horizontal edges by measuring top-bottom contrast." },
};

const FEATURE_KERNELS = [KERNELS.sobelX.matrix, KERNELS.sobelY.matrix, KERNELS.blur.matrix, KERNELS.sharpen.matrix];

const STEPS = [
  { id: "convolution", name: "Convolution", icon: Grid3x3 },
  { id: "featuremaps", name: "Feature Maps", icon: Layers },
  { id: "architecture", name: "Architecture", icon: Layers },
  { id: "transfer", name: "Transfer Learning", icon: ArrowLeftRight },
] as const;

type StepId = (typeof STEPS)[number]["id"];

// ------------------------------------------------------------
// Pure image-math helpers
// ------------------------------------------------------------

function drawSample(ctx: CanvasRenderingContext2D, id: SampleId, size: number) {
  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(0, 0, size, size);

  if (id === "shapes") {
    ctx.fillStyle = "#1d4ed8";
    ctx.fillRect(size * 0.1, size * 0.1, size * 0.35, size * 0.35);
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.arc(size * 0.68, size * 0.32, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#16a34a";
    ctx.beginPath();
    ctx.moveTo(size * 0.5, size * 0.6);
    ctx.lineTo(size * 0.85, size * 0.9);
    ctx.lineTo(size * 0.15, size * 0.9);
    ctx.closePath();
    ctx.fill();
  } else if (id === "checkerboard") {
    const n = 8;
    const cell = size / n;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? "#0f172a" : "#e2e8f0";
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
  } else if (id === "smiley") {
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(size * 0.36, size * 0.42, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size * 0.64, size * 0.42, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = size * 0.045;
    ctx.strokeStyle = "#1e293b";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(size / 2, size * 0.48, size * 0.22, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  } else if (id === "digit") {
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = size * 0.09;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(size * 0.28, size * 0.22);
    ctx.quadraticCurveTo(size * 0.82, size * 0.18, size * 0.52, size * 0.48);
    ctx.quadraticCurveTo(size * 0.85, size * 0.55, size * 0.3, size * 0.82);
    ctx.stroke();
  }
}

function toGrayscale(img: ImageData): Float32Array {
  const { data, width, height } = img;
  const out = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    out[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }
  return out;
}

function convolve3x3(data: Float32Array, w: number, h: number, kernel: number[][]): Float32Array {
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const yy = y + ky;
          const xx = x + kx;
          const val = yy >= 0 && yy < h && xx >= 0 && xx < w ? data[yy * w + xx] : 0;
          sum += val * kernel[ky + 1][kx + 1];
        }
      }
      out[y * w + x] = sum;
    }
  }
  return out;
}

function relu(data: Float32Array): Float32Array {
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) out[i] = Math.max(0, data[i]);
  return out;
}

function maxPool2(data: Float32Array, w: number, h: number): { data: Float32Array; w: number; h: number } {
  const ow = Math.floor(w / 2);
  const oh = Math.floor(h / 2);
  const out = new Float32Array(ow * oh);
  for (let y = 0; y < oh; y++) {
    for (let x = 0; x < ow; x++) {
      const a = data[2 * y * w + 2 * x];
      const b = data[2 * y * w + 2 * x + 1];
      const c = data[(2 * y + 1) * w + 2 * x];
      const d = data[(2 * y + 1) * w + 2 * x + 1];
      out[y * ow + x] = Math.max(a, b, c, d);
    }
  }
  return { data: out, w: ow, h: oh };
}

function clampToBytes(data: Float32Array): Uint8ClampedArray {
  const out = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i++) out[i] = data[i];
  return out;
}

function normalizeToBytes(data: Float32Array): Uint8ClampedArray {
  let min = Infinity;
  let max = -Infinity;
  for (const v of data) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = max - min || 1;
  const out = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i++) out[i] = ((data[i] - min) / range) * 255;
  return out;
}

// ------------------------------------------------------------
// Small reusable canvas components
// ------------------------------------------------------------

function SampleCanvas({ id, size }: { id: SampleId; size: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    drawSample(ctx, id, size);
  }, [id, size]);
  return <canvas ref={ref} width={size} height={size} className="rounded-lg border border-border" />;
}

function PixelCanvas({ data, w, h, size, className }: { data: Uint8ClampedArray; w: number; h: number; size: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || w === 0 || h === 0) return;
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const octx = off.getContext("2d");
    if (!octx) return;
    const imageData = octx.createImageData(w, h);
    for (let i = 0; i < w * h; i++) {
      const v = data[i];
      imageData.data[i * 4] = v;
      imageData.data[i * 4 + 1] = v;
      imageData.data[i * 4 + 2] = v;
      imageData.data[i * 4 + 3] = 255;
    }
    octx.putImageData(imageData, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(off, 0, 0, w, h, 0, 0, size, size);
  }, [data, w, h, size]);
  return <canvas ref={ref} width={size} height={size} className={className} />;
}

// ------------------------------------------------------------
// Architecture + Transfer Learning static data
// ------------------------------------------------------------

const ARCH_LAYERS = [
  { name: "Input", detail: "64×64×3", desc: "The raw image: height × width × color channels (red, green, blue)." },
  { name: "Conv 1", detail: "3×3, 32 filters", desc: "32 small learnable filters slide over the image. Each produces one feature map that lights up for a specific pattern — an edge, a color blob, a texture." },
  { name: "ReLU", detail: "max(0, x)", desc: "Zeroes out negative values so the network can learn curved, non-linear patterns instead of just straight combinations of pixels." },
  { name: "MaxPool", detail: "2×2, stride 2", desc: "Shrinks each feature map by keeping only the strongest value in every 2×2 block. The network cares less about the exact pixel position of a pattern." },
  { name: "Conv 2", detail: "3×3, 64 filters", desc: "Combines the simple patterns from layer 1 (edges, blobs) into more complex ones — corners, textures, small parts." },
  { name: "ReLU + Pool", detail: "", desc: "Same idea again. Each conv → relu → pool stage roughly halves the spatial size while doubling how complex the detected patterns are." },
  { name: "Flatten", detail: "→ 1D vector", desc: "All remaining feature-map numbers get unrolled into one long list, ready for standard fully-connected layers." },
  { name: "Dense", detail: "128 units", desc: "A fully-connected layer that combines everything the convolutions found into a compact summary." },
  { name: "Softmax", detail: "N classes", desc: "Turns the final numbers into a probability for each class — e.g. 92% cat, 5% dog, 3% other." },
] as const;

const BASE_BLOCKS = [
  { name: "Block 1", detail: "edges & colors", params: 4 },
  { name: "Block 2", detail: "textures", params: 12 },
  { name: "Block 3", detail: "simple shapes", params: 26 },
  { name: "Block 4", detail: "object parts", params: 48 },
  { name: "Block 5", detail: "high-level concepts", params: 78 },
];
const HEAD_PARAMS = 2;
const TOTAL_PARAMS = HEAD_PARAMS + BASE_BLOCKS.reduce((s, b) => s + b.params, 0);

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export default function CNNComputerVisionLab() {
  const [activeStep, setActiveStep] = useState<StepId>("convolution");
  const [sample, setSample] = useState<SampleId>("smiley");
  const [kernelId, setKernelId] = useState<KernelId>("edge");
  const [customMatrix, setCustomMatrix] = useState<number[][]>([[0, 0, 0], [0, 1, 0], [0, 0, 0]]);
  const [selectedLayer, setSelectedLayer] = useState(1);
  const [frozen, setFrozen] = useState<boolean[]>(BASE_BLOCKS.map(() => true));

  const [grayscale, setGrayscale] = useState<Float32Array | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = IMG_SIZE;
    canvas.height = IMG_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawSample(ctx, sample, IMG_SIZE);
    setGrayscale(toGrayscale(ctx.getImageData(0, 0, IMG_SIZE, IMG_SIZE)));
  }, [sample]);

  const activeKernelMatrix = kernelId === "custom" ? customMatrix : KERNELS[kernelId].matrix;

  const convDisplay = useMemo(() => {
    if (!grayscale) return null;
    const raw = convolve3x3(grayscale, IMG_SIZE, IMG_SIZE, activeKernelMatrix);
    return clampToBytes(raw);
  }, [grayscale, activeKernelMatrix]);

  const pipeline = useMemo(() => {
    if (!grayscale) return null;
    const conv1 = FEATURE_KERNELS.map((k) => relu(convolve3x3(grayscale, IMG_SIZE, IMG_SIZE, k)));
    const pool1 = conv1.map((m) => maxPool2(m, IMG_SIZE, IMG_SIZE));
    const conv2 = pool1.map((p) => relu(convolve3x3(p.data, p.w, p.h, KERNELS.edge.matrix)));
    const pool2 = conv2.map((m, i) => maxPool2(m, pool1[i].w, pool1[i].h));
    return { conv1, pool1, conv2, pool2 };
  }, [grayscale]);

  const trainableParams = HEAD_PARAMS + BASE_BLOCKS.reduce((s, b, i) => s + (frozen[i] ? 0 : b.params), 0);
  const trainablePct = (trainableParams / TOTAL_PARAMS) * 100;

  const applyPreset = (mode: "transfer" | "finetune") => {
    if (mode === "transfer") setFrozen(BASE_BLOCKS.map(() => true));
    else setFrozen(BASE_BLOCKS.map((_, i) => i < BASE_BLOCKS.length - 2));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="font-semibold text-lg">CNN &amp; Computer Vision</h2>
        <p className="text-sm text-muted-foreground">
          Real convolution and pooling math running on real pixels — see exactly what a CNN sees at every stage.
        </p>
      </div>

      {/* Step selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {STEPS.map((step, i) => (
          <button
            key={step.id}
            onClick={() => setActiveStep(step.id)}
            className={cn(
              "flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm transition-all",
              activeStep === step.id ? "border-primary bg-primary/5 text-primary font-medium" : "border-border hover:bg-muted/50"
            )}
          >
            <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
            <step.icon className="w-4 h-4" />
            {step.name}
          </button>
        ))}
      </div>

      {/* Sample picker — shared across the first two steps */}
      {(activeStep === "convolution" || activeStep === "featuremaps") && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Image:</span>
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSample(s.id)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-colors",
                sample === s.id ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:bg-muted"
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 1: CONVOLUTION */}
      {/* ---------------------------------------------------- */}
      {activeStep === "convolution" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A convolution kernel is a small grid of numbers that slides across every pixel, multiplying and summing as it goes.
            Different number patterns pull out different things — edges, blur, sharpness. This is the exact operation every
            conv layer in a CNN performs, just with filters the network learns instead of ones we picked.
          </p>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              <div className="bg-muted/20 rounded-xl p-4 text-center">
                <div className="text-xs text-muted-foreground mb-2">Original</div>
                <SampleCanvas id={sample} size={KERNEL_DISPLAY} />
              </div>
              <div className="bg-muted/20 rounded-xl p-4 text-center">
                <div className="text-xs text-muted-foreground mb-2">After convolution</div>
                {convDisplay && <PixelCanvas data={convDisplay} w={IMG_SIZE} h={IMG_SIZE} size={KERNEL_DISPLAY} className="rounded-lg border border-border mx-auto" />}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-medium">Kernel</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(KERNELS) as Exclude<KernelId, "custom">[]).map((k) => (
                    <button
                      key={k}
                      onClick={() => setKernelId(k)}
                      className={cn(
                        "text-xs px-2 py-1.5 rounded-lg border transition-colors",
                        kernelId === k ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:bg-muted"
                      )}
                    >
                      {KERNELS[k].name}
                    </button>
                  ))}
                  <button
                    onClick={() => setKernelId("custom")}
                    className={cn(
                      "text-xs px-2 py-1.5 rounded-lg border transition-colors col-span-2",
                      kernelId === "custom" ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:bg-muted"
                    )}
                  >
                    Custom (edit below)
                  </button>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  {kernelId === "custom" ? "Edit any of the 9 numbers and watch the image change live." : KERNELS[kernelId].desc}
                </p>
              </div>

              <div className="bg-muted/30 rounded-xl p-4">
                <h3 className="text-sm font-medium mb-2">3×3 matrix</h3>
                <div className="grid grid-cols-3 gap-1 w-40 mx-auto">
                  {(kernelId === "custom" ? customMatrix : KERNELS[kernelId].matrix).map((row, ri) =>
                    row.map((val, ci) =>
                      kernelId === "custom" ? (
                        <input
                          key={`${ri}-${ci}`}
                          type="number"
                          step={0.1}
                          value={val}
                          onChange={(e) => {
                            const next = customMatrix.map((r) => [...r]);
                            next[ri][ci] = Number(e.target.value);
                            setCustomMatrix(next);
                          }}
                          className="w-full text-center text-xs border border-border rounded-md py-1.5 bg-background"
                        />
                      ) : (
                        <div key={`${ri}-${ci}`} className="text-center text-xs border border-border rounded-md py-1.5 bg-background font-mono">
                          {Number.isInteger(val) ? val : val.toFixed(2)}
                        </div>
                      )
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 2: FEATURE MAPS */}
      {/* ---------------------------------------------------- */}
      {activeStep === "featuremaps" && pipeline && (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            A real conv layer runs <em>many</em> filters at once, each producing its own feature map. Here are 4 fixed filters
            (not learned — just to illustrate) run through two conv → ReLU → pool stages, the same shape as a real CNN&apos;s
            early layers.
          </p>

          <div className="bg-muted/20 rounded-xl p-4 text-center w-fit">
            <div className="text-xs text-muted-foreground mb-2">Input ({IMG_SIZE}×{IMG_SIZE})</div>
            <SampleCanvas id={sample} size={MAP_DISPLAY} />
          </div>

          {[
            { label: "Conv 1 + ReLU (4 filters)", maps: pipeline.conv1, size: IMG_SIZE },
            { label: "MaxPool 1 (2×2)", maps: pipeline.pool1.map((p) => p.data), size: pipeline.pool1[0]?.w ?? 0 },
            { label: "Conv 2 + ReLU (4 filters)", maps: pipeline.conv2, size: pipeline.pool1[0]?.w ?? 0 },
            { label: "MaxPool 2 (2×2)", maps: pipeline.pool2.map((p) => p.data), size: pipeline.pool2[0]?.w ?? 0 },
          ].map((row) => (
            <div key={row.label}>
              <div className="text-xs text-muted-foreground mb-2">{row.label}</div>
              <div className="flex gap-3 flex-wrap">
                {row.maps.map((m, i) => (
                  <PixelCanvas
                    key={i}
                    data={normalizeToBytes(m)}
                    w={row.size}
                    h={row.size}
                    size={MAP_DISPLAY * 0.7}
                    className="rounded-lg border border-border"
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="bg-muted/20 rounded-xl p-4 text-sm text-muted-foreground">
            <strong className="text-foreground">Flatten → Dense → Softmax:</strong> in a real, trained CNN these final small
            feature maps get unrolled into a list of numbers and fed through fully-connected layers that output a class
            probability. These particular filters are fixed for illustration, not learned, so they don&apos;t actually
            classify anything — but the shrinking-spatial / growing-abstraction pattern you&apos;re watching is exactly
            what a trained CNN does.
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 3: ARCHITECTURE */}
      {/* ---------------------------------------------------- */}
      {activeStep === "architecture" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">A typical small CNN, layer by layer. Click any block to read what it does.</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {ARCH_LAYERS.map((layer, i) => (
              <div key={layer.name} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => setSelectedLayer(i)}
                  className={cn(
                    "flex-shrink-0 w-32 text-left px-3 py-3 rounded-xl border transition-colors",
                    selectedLayer === i ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                  )}
                >
                  <div className={cn("text-sm font-medium", selectedLayer === i && "text-primary")}>{layer.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{layer.detail}</div>
                </button>
                {i < ARCH_LAYERS.length - 1 && <span className="text-muted-foreground px-1.5">→</span>}
              </div>
            ))}
          </div>
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <div className="text-xs font-medium text-muted-foreground mb-1.5">{ARCH_LAYERS[selectedLayer].name.toUpperCase()}</div>
            <p className="text-sm">{ARCH_LAYERS[selectedLayer].desc}</p>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 4: TRANSFER LEARNING & FINE-TUNING */}
      {/* ---------------------------------------------------- */}
      {activeStep === "transfer" && (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Training a CNN from scratch needs huge datasets. Instead, start from a model already trained on millions of
            images (e.g. ImageNet), keep its learned filters, and adapt just the end for your own task.
          </p>

          <div className="flex gap-2">
            <button onClick={() => applyPreset("transfer")} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">
              Preset: Transfer Learning
            </button>
            <button onClick={() => applyPreset("finetune")} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">
              Preset: Fine-Tuning
            </button>
            <button onClick={() => setFrozen(BASE_BLOCKS.map(() => true))} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors ml-auto">
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-muted/20 rounded-xl p-4">
              <div className="text-xs text-muted-foreground mb-3">Pretrained base (click a block to toggle frozen/trainable)</div>
              <div className="flex items-center gap-2 flex-wrap">
                {BASE_BLOCKS.map((b, i) => (
                  <div key={b.name} className="flex items-center">
                    <button
                      onClick={() => setFrozen((f) => f.map((v, idx) => (idx === i ? !v : v)))}
                      className={cn(
                        "w-24 px-2 py-3 rounded-lg border text-center transition-colors",
                        frozen[i] ? "border-border bg-muted/40 text-muted-foreground" : "border-primary bg-primary/10 text-primary"
                      )}
                    >
                      {frozen[i] ? <Lock className="w-3.5 h-3.5 mx-auto mb-1" /> : <Unlock className="w-3.5 h-3.5 mx-auto mb-1" />}
                      <div className="text-xs font-medium">{b.name}</div>
                      <div className="text-[10px] opacity-70">{b.detail}</div>
                    </button>
                    {i < BASE_BLOCKS.length - 1 && <span className="text-muted-foreground px-1 text-xs">→</span>}
                  </div>
                ))}
                <span className="text-muted-foreground px-1 text-xs">→</span>
                <div className="w-24 px-2 py-3 rounded-lg border border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-center">
                  <Unlock className="w-3.5 h-3.5 mx-auto mb-1" />
                  <div className="text-xs font-medium">New Head</div>
                  <div className="text-[10px] opacity-70">always trainable</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Locked = frozen (keeps its pretrained weights, doesn&apos;t update). Unlocked = trainable (weights get
                updated during training on your new data).
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Trainable parameters</div>
                <div className="text-2xl font-bold text-primary">{trainablePct.toFixed(0)}%</div>
                <div className="w-full bg-border/50 rounded-full h-2 mt-2 overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${trainablePct}%` }} />
                </div>
              </div>
              <div className="bg-muted/20 rounded-xl p-4 space-y-2 text-xs text-muted-foreground">
                <div><strong className="text-foreground">Transfer learning</strong> — freeze the whole base, only train the new head. Fast, needs little data, low overfitting risk.</div>
                <div><strong className="text-foreground">Fine-tuning</strong> — also unfreeze the last block(s), so task-specific layers adapt too. Needs a much smaller learning rate (~100–1000× smaller) so you don&apos;t wreck the pretrained features.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-muted/20 rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">📚 Why This Matters</h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-muted-foreground">
          <div><strong className="text-foreground">Convolution</strong><p className="mt-1">Small filters detect local patterns — the core building block of vision models</p></div>
          <div><strong className="text-foreground">Pooling</strong><p className="mt-1">Shrinks feature maps, keeping strong signals and adding position tolerance</p></div>
          <div><strong className="text-foreground">Depth</strong><p className="mt-1">Stacking layers builds from edges → textures → parts → whole objects</p></div>
          <div><strong className="text-foreground">Transfer learning</strong><p className="mt-1">Reuse pretrained knowledge instead of learning vision from zero every time</p></div>
        </div>
      </div>
    </div>
  );
}
