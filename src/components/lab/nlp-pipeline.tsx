// ============================================================
// NLP PIPELINE LAB
// Interactive walkthrough of how raw text becomes numbers:
// Tokenize -> Preprocess -> Vectorize (BoW/TF-IDF) -> Embed
// ============================================================

"use client";

import { useMemo, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Type, Filter, Table2, Network, RefreshCw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------
// Static reference data
// ------------------------------------------------------------

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "in", "on", "at", "to", "for", "of", "with", "and", "or", "but", "not",
  "this", "that", "these", "those", "it", "its", "he", "she", "they",
  "them", "his", "her", "their", "i", "you", "we", "us", "my", "your",
  "our", "as", "by", "from", "over", "under", "up", "down", "if", "so",
  "than", "then", "there", "here", "who", "what", "when", "where", "why", "how",
]);

const SAMPLE_SENTENCES = [
  "The quick brown fox jumps over the lazy dogs running quickly",
  "Students are learning how computers understand human language",
  "A happy puppy chased the excited cat around the sunny garden",
];

const REFERENCE_DOCS = [
  "A fast dog runs past the sleepy cat in the yard",
  "The lazy fox sleeps while the quick cat watches",
];

type EmbedCategory = "people" | "animals" | "tech" | "emotion" | "food" | "nature";

const CATEGORY_COLORS: Record<EmbedCategory, string> = {
  people: "#7c3aed",
  animals: "#f59e0b",
  tech: "#3b82f6",
  emotion: "#ef4444",
  food: "#10b981",
  nature: "#06b6d4",
};

const VOCAB: { word: string; category: EmbedCategory; x: number; y: number }[] = [
  { word: "king", category: "people", x: 60, y: 80 },
  { word: "queen", category: "people", x: 65, y: 85 },
  { word: "man", category: "people", x: 40, y: 70 },
  { word: "woman", category: "people", x: 45, y: 78 },
  { word: "prince", category: "people", x: 58, y: 72 },
  { word: "princess", category: "people", x: 63, y: 76 },

  { word: "cat", category: "animals", x: 20, y: 20 },
  { word: "dog", category: "animals", x: 25, y: 18 },
  { word: "lion", category: "animals", x: 30, y: 25 },
  { word: "tiger", category: "animals", x: 28, y: 22 },
  { word: "wolf", category: "animals", x: 22, y: 28 },
  { word: "puppy", category: "animals", x: 23, y: 15 },

  { word: "computer", category: "tech", x: 80, y: 20 },
  { word: "robot", category: "tech", x: 85, y: 25 },
  { word: "algorithm", category: "tech", x: 82, y: 15 },
  { word: "data", category: "tech", x: 78, y: 22 },
  { word: "code", category: "tech", x: 88, y: 18 },
  { word: "software", category: "tech", x: 84, y: 12 },

  { word: "happy", category: "emotion", x: 50, y: 40 },
  { word: "joy", category: "emotion", x: 55, y: 42 },
  { word: "sad", category: "emotion", x: 45, y: 10 },
  { word: "angry", category: "emotion", x: 40, y: 8 },
  { word: "fear", category: "emotion", x: 38, y: 12 },
  { word: "excited", category: "emotion", x: 52, y: 38 },

  { word: "pizza", category: "food", x: 10, y: 60 },
  { word: "burger", category: "food", x: 15, y: 58 },
  { word: "apple", category: "food", x: 12, y: 65 },
  { word: "bread", category: "food", x: 8, y: 62 },
  { word: "rice", category: "food", x: 18, y: 55 },
  { word: "pasta", category: "food", x: 13, y: 57 },

  { word: "tree", category: "nature", x: 70, y: 55 },
  { word: "river", category: "nature", x: 75, y: 50 },
  { word: "mountain", category: "nature", x: 72, y: 60 },
  { word: "ocean", category: "nature", x: 78, y: 52 },
  { word: "sky", category: "nature", x: 74, y: 58 },
  { word: "forest", category: "nature", x: 68, y: 53 },
];

const VOCAB_WORDS = VOCAB.map((v) => v.word).sort();

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function tokenize(text: string): string[] {
  const matches = text.match(/[A-Za-z']+/g);
  return matches ? matches : [];
}

// Deliberately simplified rule-based stemmer for teaching purposes
// (not a real Porter/Snowball stemmer).
function simpleStem(word: string): string {
  const w = word.toLowerCase();
  if (w.endsWith("ies") && w.length > 4) return w.slice(0, -3) + "y";
  if (w.endsWith("ing") && w.length > 5) {
    let base = w.slice(0, -3);
    const last = base[base.length - 1];
    const secondLast = base[base.length - 2];
    if (last === secondLast && !"aeiou".includes(last)) base = base.slice(0, -1);
    return base;
  }
  if (w.endsWith("ed") && w.length > 4) return w.slice(0, -2);
  if (w.endsWith("es") && w.length > 4) return w.slice(0, -2);
  if (w.endsWith("s") && !w.endsWith("ss") && w.length > 3) return w.slice(0, -1);
  return w;
}

interface TokenInfo {
  original: string;
  lower: string;
  isStopword: boolean;
  stemmed: string;
  kept: boolean;
}

interface PreprocessOptions {
  lowercase: boolean;
  removeStopwords: boolean;
  stem: boolean;
}

function analyzeTokens(tokens: string[], opts: PreprocessOptions): TokenInfo[] {
  return tokens.map((t) => {
    const lower = opts.lowercase ? t.toLowerCase() : t;
    const isStopword = opts.removeStopwords && STOPWORDS.has(lower.toLowerCase());
    const stemmed = opts.stem ? simpleStem(lower) : lower;
    return { original: t, lower, isStopword, stemmed, kept: !isStopword };
  });
}

function processedTokensOf(text: string, opts: PreprocessOptions): string[] {
  return analyzeTokens(tokenize(text), opts)
    .filter((t) => t.kept)
    .map((t) => t.stemmed);
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function cosineSim(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dot = a.x * b.x + a.y * b.y;
  const magA = Math.sqrt(a.x ** 2 + a.y ** 2);
  const magB = Math.sqrt(b.x ** 2 + b.y ** 2);
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

function vocabPoint(word: string) {
  return VOCAB.find((v) => v.word === word);
}

const STEPS = [
  { id: "tokenize", name: "Tokenize", icon: Type },
  { id: "preprocess", name: "Preprocess", icon: Filter },
  { id: "vectorize", name: "Vectorize", icon: Table2 },
  { id: "embed", name: "Embeddings", icon: Network },
] as const;

type StepId = (typeof STEPS)[number]["id"];

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export default function NLPPipelineLab() {
  const [activeStep, setActiveStep] = useState<StepId>("tokenize");
  const [inputText, setInputText] = useState(SAMPLE_SENTENCES[0]);

  const [lowercase, setLowercase] = useState(true);
  const [removeStopwords, setRemoveStopwords] = useState(true);
  const [stem, setStem] = useState(true);

  const [wordA, setWordA] = useState("king");
  const [wordB, setWordB] = useState("queen");

  const [mathBase, setMathBase] = useState("king");
  const [mathSubtract, setMathSubtract] = useState("man");
  const [mathAdd, setMathAdd] = useState("woman");

  const rawTokens = useMemo(() => tokenize(inputText), [inputText]);
  const tokenAnalysis = useMemo(
    () => analyzeTokens(rawTokens, { lowercase, removeStopwords, stem }),
    [rawTokens, lowercase, removeStopwords, stem]
  );
  const finalTokens = useMemo(() => tokenAnalysis.filter((t) => t.kept).map((t) => t.stemmed), [tokenAnalysis]);

  // Bag of Words for the current sentence
  const bowCounts = useMemo(() => {
    const counts = new Map<string, number>();
    finalTokens.forEach((tok) => counts.set(tok, (counts.get(tok) || 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [finalTokens]);

  // TF-IDF across current sentence + 2 fixed reference docs
  const tfidfRows = useMemo(() => {
    const refOpts: PreprocessOptions = { lowercase, removeStopwords, stem };
    const docs = [finalTokens, ...REFERENCE_DOCS.map((d) => processedTokensOf(d, refOpts))];
    const n = docs.length;
    const doc1Vocab = Array.from(new Set(finalTokens));

    return doc1Vocab
      .map((word) => {
        const tf = finalTokens.filter((t) => t === word).length / (finalTokens.length || 1);
        const df = docs.filter((d) => d.includes(word)).length;
        const idf = Math.log(n / df);
        return { word, tf, df, idf, tfidf: tf * idf };
      })
      .sort((a, b) => b.tfidf - a.tfidf);
  }, [finalTokens, lowercase, removeStopwords, stem]);

  // Words from the sentence that exist in the toy embedding vocabulary
  const highlightedWords = useMemo(
    () => Array.from(new Set(finalTokens)).filter((t) => vocabPoint(t)),
    [finalTokens]
  );

  const pointA = vocabPoint(wordA);
  const pointB = vocabPoint(wordB);
  const simAB = pointA && pointB ? cosineSim(pointA, pointB) : 0;
  const distAB = pointA && pointB ? distance(pointA, pointB) : 0;

  const nearestToA = useMemo(() => {
    if (!pointA) return [];
    return VOCAB.filter((v) => v.word !== wordA)
      .map((v) => ({ word: v.word, dist: distance(pointA, v) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);
  }, [pointA, wordA]);

  const mathResult = useMemo(() => {
    const b = vocabPoint(mathBase);
    const s = vocabPoint(mathSubtract);
    const a = vocabPoint(mathAdd);
    if (!b || !s || !a) return null;
    const target = { x: b.x - s.x + a.x, y: b.y - s.y + a.y };
    const exclude = [mathBase, mathSubtract, mathAdd];
    const nearest = VOCAB.filter((v) => !exclude.includes(v.word))
      .map((v) => ({ word: v.word, dist: distance(target, v) }))
      .sort((x, y) => x.dist - y.dist)[0];
    return { target, nearest };
  }, [mathBase, mathSubtract, mathAdd]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-semibold text-lg">NLP Pipeline</h2>
          <p className="text-sm text-muted-foreground">
            See how raw text turns into numbers a model can use — step by step
          </p>
        </div>
      </div>

      {/* Text input */}
      <div className="bg-muted/30 rounded-xl p-4 space-y-3">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={2}
          className="w-full bg-background border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Type a sentence to run through the pipeline..."
        />
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Try:</span>
          {SAMPLE_SENTENCES.map((s, i) => (
            <button
              key={i}
              onClick={() => setInputText(s)}
              className="text-xs px-2.5 py-1 rounded-full border border-border hover:bg-muted transition-colors"
            >
              Example {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Step selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {STEPS.map((step, i) => (
          <button
            key={step.id}
            onClick={() => setActiveStep(step.id)}
            className={cn(
              "flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm transition-all",
              activeStep === step.id
                ? "border-primary bg-primary/5 text-primary font-medium"
                : "border-border hover:bg-muted/50"
            )}
          >
            <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
              {i + 1}
            </span>
            <step.icon className="w-4 h-4" />
            {step.name}
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------- */}
      {/* STEP 1: TOKENIZE */}
      {/* ---------------------------------------------------- */}
      {activeStep === "tokenize" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The raw sentence is split into individual <strong className="text-foreground">tokens</strong> (words).
            Punctuation is dropped in this simplified tokenizer.
          </p>
          <div className="bg-muted/20 rounded-xl p-5">
            <div className="text-xs text-muted-foreground mb-2">Raw text</div>
            <div className="text-sm font-mono bg-background border border-border rounded-lg p-3 mb-4">{inputText}</div>
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
              <ArrowRight className="w-3.5 h-3.5" /> {rawTokens.length} tokens
            </div>
            <div className="flex flex-wrap gap-2">
              {rawTokens.map((tok, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-mono border border-blue-500/20">
                  {tok}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 2: PREPROCESS */}
      {/* ---------------------------------------------------- */}
      {activeStep === "preprocess" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Toggle the cleaning steps below and watch each token transform live.
          </p>
          <div className="flex flex-wrap gap-4 bg-muted/30 rounded-xl p-4">
            {[
              { label: "Lowercase", value: lowercase, set: setLowercase },
              { label: "Remove stopwords", value: removeStopwords, set: setRemoveStopwords },
              { label: "Stem words", value: stem, set: setStem },
            ].map((t) => (
              <label key={t.label} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={t.value} onChange={(e) => t.set(e.target.checked)} className="accent-primary w-4 h-4" />
                {t.label}
              </label>
            ))}
          </div>

          <div className="bg-muted/20 rounded-xl p-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="pb-2 pr-4">Original</th>
                  <th className="pb-2 pr-4">Lowercase</th>
                  <th className="pb-2 pr-4">Stopword?</th>
                  <th className="pb-2 pr-4">Stemmed</th>
                  <th className="pb-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {tokenAnalysis.map((t, i) => (
                  <tr key={i} className={cn("border-b border-border/50", !t.kept && "opacity-40")}>
                    <td className="py-1.5 pr-4 font-mono">{t.original}</td>
                    <td className="py-1.5 pr-4 font-mono">{t.lower}</td>
                    <td className="py-1.5 pr-4">
                      {t.isStopword ? <span className="text-red-500">removed</span> : <span className="text-muted-foreground">kept</span>}
                    </td>
                    <td className="py-1.5 pr-4 font-mono">{t.stemmed}</td>
                    <td className="py-1.5">
                      {t.kept ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono">{t.stemmed}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-muted-foreground">
            Final tokens ({finalTokens.length}):{" "}
            <span className="font-mono text-foreground">{finalTokens.join(", ") || "(none left)"}</span>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 3: VECTORIZE */}
      {/* ---------------------------------------------------- */}
      {activeStep === "vectorize" && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Text has to become numbers before a model can use it. Below are two common approaches.
          </p>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Bag of Words */}
            <div className="bg-muted/20 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-1">Bag of Words</h3>
              <p className="text-xs text-muted-foreground mb-3">Just counts how often each word appears — order doesn&apos;t matter.</p>
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {bowCounts.map(([word, count]) => (
                  <div key={word} className="flex items-center gap-2 text-sm">
                    <span className="w-24 truncate font-mono text-xs">{word}</span>
                    <div className="flex-1 bg-border/50 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(count / bowCounts[0][1]) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-4 text-right">{count}</span>
                  </div>
                ))}
                {bowCounts.length === 0 && <div className="text-xs text-muted-foreground">No tokens left — adjust preprocessing.</div>}
              </div>
            </div>

            {/* TF-IDF */}
            <div className="bg-muted/20 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-1">TF-IDF</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Weighs words by how distinctive they are across a small 3-document corpus, not just how frequent.
              </p>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border">
                      <th className="pb-1.5 pr-3">Word</th>
                      <th className="pb-1.5 pr-3">TF</th>
                      <th className="pb-1.5 pr-3">DF</th>
                      <th className="pb-1.5 pr-3">IDF</th>
                      <th className="pb-1.5">TF-IDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tfidfRows.map((r) => (
                      <tr key={r.word} className="border-b border-border/50">
                        <td className="py-1 pr-3 font-mono">{r.word}</td>
                        <td className="py-1 pr-3">{r.tf.toFixed(2)}</td>
                        <td className="py-1 pr-3">{r.df}/3</td>
                        <td className="py-1 pr-3">{r.idf.toFixed(2)}</td>
                        <td className="py-1 font-medium text-foreground">{r.tfidf.toFixed(3)}</td>
                      </tr>
                    ))}
                    {tfidfRows.length === 0 && (
                      <tr><td className="py-2 text-muted-foreground" colSpan={5}>No tokens left — adjust preprocessing.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                Higher TF-IDF = more distinctive to this sentence. Common words shared across all documents score lower even if frequent.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 4: EMBEDDINGS */}
      {/* ---------------------------------------------------- */}
      {activeStep === "embed" && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Real embeddings live in hundreds of dimensions learned from huge corpora. This is a simplified 2D
            projection built by hand so you can see the core idea: <strong className="text-foreground">words with similar meaning end up near each other</strong>,
            and directions between points can carry meaning too.
          </p>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={380}>
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="x" type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis dataKey="y" type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const p = payload[0].payload as { word?: string };
                      return p.word ? (
                        <div className="bg-popover border border-border rounded-lg px-2.5 py-1.5 text-xs shadow-md">{p.word}</div>
                      ) : null;
                    }}
                  />
                  {(Object.keys(CATEGORY_COLORS) as EmbedCategory[]).map((cat) => (
                    <Scatter
                      key={cat}
                      data={VOCAB.filter((v) => v.category === cat && !highlightedWords.includes(v.word))}
                      fill={CATEGORY_COLORS[cat]}
                      fillOpacity={0.55}
                    />
                  ))}
                  {/* words from the user's sentence, highlighted */}
                  <Scatter data={VOCAB.filter((v) => highlightedWords.includes(v.word))} fill="#111827" />
                  {/* word-math result point */}
                  {mathResult && <Scatter data={[{ x: mathResult.target.x, y: mathResult.target.y, word: "?" }]} fill="#f97316" />}
                </ScatterChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                {(Object.keys(CATEGORY_COLORS) as EmbedCategory[]).map((cat) => (
                  <div key={cat} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                    {cat}
                  </div>
                ))}
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-900" />
                  words from your sentence
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  word-math result
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {/* Similarity calculator */}
              <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold">Similarity calculator</h3>
                <div className="grid grid-cols-2 gap-2">
                  <select value={wordA} onChange={(e) => setWordA(e.target.value)} className="text-sm border border-border rounded-lg px-2 py-1.5 bg-background">
                    {VOCAB_WORDS.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                  <select value={wordB} onChange={(e) => setWordB(e.target.value)} className="text-sm border border-border rounded-lg px-2 py-1.5 bg-background">
                    {VOCAB_WORDS.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div className="text-center py-2">
                  <div className="text-2xl font-bold text-primary">{simAB.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">cosine similarity (distance {distAB.toFixed(1)})</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5">Nearest to &ldquo;{wordA}&rdquo;</div>
                  <div className="flex flex-wrap gap-1.5">
                    {nearestToA.map((n) => (
                      <span key={n.word} className="text-xs px-2 py-0.5 rounded-full bg-muted font-mono">{n.word}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Word math */}
              <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold">Word math</h3>
                <div className="flex items-center gap-1.5 flex-wrap text-sm">
                  <select value={mathBase} onChange={(e) => setMathBase(e.target.value)} className="text-xs border border-border rounded-lg px-1.5 py-1 bg-background">
                    {VOCAB_WORDS.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                  <span className="text-muted-foreground">−</span>
                  <select value={mathSubtract} onChange={(e) => setMathSubtract(e.target.value)} className="text-xs border border-border rounded-lg px-1.5 py-1 bg-background">
                    {VOCAB_WORDS.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                  <span className="text-muted-foreground">+</span>
                  <select value={mathAdd} onChange={(e) => setMathAdd(e.target.value)} className="text-xs border border-border rounded-lg px-1.5 py-1 bg-background">
                    {VOCAB_WORDS.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div className="text-center py-2">
                  <div className="text-xs text-muted-foreground mb-1">≈</div>
                  <div className="text-xl font-bold text-orange-500">{mathResult?.nearest.word ?? "—"}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    closest vocabulary word to the resulting point
                  </div>
                </div>
                <button
                  onClick={() => { setMathBase("king"); setMathSubtract("man"); setMathAdd("woman"); }}
                  className="w-full flex items-center justify-center gap-2 text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-muted"
                >
                  <RefreshCw className="w-3 h-3" /> Reset to king − man + woman
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-muted/20 rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">📚 Why this matters</h3>
        <div className="grid md:grid-cols-4 gap-3 text-xs text-muted-foreground">
          {[
            { title: "Tokenization", desc: "Breaks text into units a model can process" },
            { title: "Preprocessing", desc: "Reduces noise so similar words are treated alike" },
            { title: "Vectorization", desc: "Converts words into numeric features (counts, weights)" },
            { title: "Embeddings", desc: "Places words in space so meaning becomes geometry" },
          ].map((s) => (
            <div key={s.title}>
              <div className="font-medium text-foreground">{s.title}</div>
              <p className="mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
