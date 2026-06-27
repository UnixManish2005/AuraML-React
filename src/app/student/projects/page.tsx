// ============================================================
// PROJECT BUILDER PAGE
// ============================================================

"use client";

import { useState } from "react";
import { Loader2, Code2, BookOpen, Folder, Copy, Check, Wand2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PROJECT_TEMPLATES = [
  { id: "house-price", title: "House Price Prediction", category: "Regression", icon: "🏠", difficulty: "Beginner", tech: ["Python", "Scikit-learn", "Pandas", "Matplotlib"] },
  { id: "sentiment", title: "Sentiment Analysis", category: "NLP", icon: "💬", difficulty: "Intermediate", tech: ["Python", "NLTK", "TensorFlow", "Flask"] },
  { id: "fake-news", title: "Fake News Detector", category: "NLP", icon: "📰", difficulty: "Intermediate", tech: ["Python", "Scikit-learn", "TF-IDF", "Streamlit"] },
  { id: "image-classifier", title: "Image Classifier", category: "Computer Vision", icon: "👁️", difficulty: "Intermediate", tech: ["Python", "TensorFlow", "Keras", "CNN"] },
  { id: "chatbot", title: "AI Chatbot", category: "GenAI", icon: "🤖", difficulty: "Advanced", tech: ["Python", "LangChain", "OpenAI", "FastAPI"] },
  { id: "stock-pred", title: "Stock Price Predictor", category: "Time Series", icon: "📈", difficulty: "Advanced", tech: ["Python", "LSTM", "Pandas", "Plotly"] },
  { id: "customer-churn", title: "Customer Churn Predictor", category: "Classification", icon: "📊", difficulty: "Beginner", tech: ["Python", "XGBoost", "Pandas", "Seaborn"] },
  { id: "music-rec", title: "Music Recommendation", category: "Recommendation", icon: "🎵", difficulty: "Intermediate", tech: ["Python", "Collaborative Filtering", "FastAPI"] },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "bg-green-500/10 text-green-600 border-green-500/20",
  Intermediate: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  Advanced: "bg-red-500/10 text-red-600 border-red-500/20",
};

interface ProjectResult {
  title: string;
  overview: string;
  structure: string;
  readme: string;
  guide: { step: string; description: string }[];
  techStack: string[];
  keyFiles: { name: string; purpose: string }[];
}

export default function ProjectBuilderPage() {
  const [selectedProject, setSelectedProject] = useState<typeof PROJECT_TEMPLATES[0] | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProjectResult | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "structure" | "readme" | "guide">("overview");
  const [copied, setCopied] = useState(false);

  async function generateProject(project: typeof PROJECT_TEMPLATES[0]) {
    setSelectedProject(project);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/generate-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project }),
      });
      const data = await res.json();
      setResult(data.result);
      setActiveTab("overview");
    } catch {
      toast.error("Generation failed. Check your API keys.");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <Code2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Project Builder</h1>
          <p className="text-muted-foreground text-sm">Generate complete ML/AI project blueprints with AI</p>
        </div>
      </div>

      {!result ? (
        <div>
          <h2 className="font-medium mb-4">Choose a project to build:</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROJECT_TEMPLATES.map((proj) => (
              <button
                key={proj.id}
                onClick={() => generateProject(proj)}
                disabled={loading}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all hover:border-primary/40 hover:bg-muted/50 group disabled:opacity-50",
                  selectedProject?.id === proj.id && loading ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <div className="text-3xl mb-3">{proj.icon}</div>
                <div className="font-medium text-sm mb-1">{proj.title}</div>
                <div className="text-xs text-muted-foreground mb-2">{proj.category}</div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border", DIFFICULTY_COLORS[proj.difficulty])}>
                    {proj.difficulty}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {proj.tech.slice(0, 2).map((t) => (
                    <span key={t} className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                  {proj.tech.length > 2 && <span className="text-xs text-muted-foreground">+{proj.tech.length - 2}</span>}
                </div>

                {selectedProject?.id === proj.id && loading ? (
                  <div className="flex items-center gap-2 mt-3 text-xs text-primary">
                    <Loader2 className="w-3 h-3 animate-spin" /> Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    <Wand2 className="w-3 h-3" /> Generate Blueprint <ChevronRight className="w-3 h-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Result header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{selectedProject?.icon}</div>
              <div>
                <h2 className="font-semibold text-lg">{result.title}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {result.techStack.map((t) => (
                    <span key={t} className="bg-muted px-2 py-0.5 rounded text-xs">{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => { setResult(null); setSelectedProject(null); }}
              className="text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              ← Back to projects
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            {(["overview", "structure", "readme", "guide"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2",
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-card border border-border rounded-xl p-6">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">{result.overview}</p>
                <div>
                  <h3 className="font-medium mb-3">Key Files:</h3>
                  <div className="space-y-2">
                    {result.keyFiles?.map((f) => (
                      <div key={f.name} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Code2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-mono text-sm">{f.name}</div>
                          <div className="text-xs text-muted-foreground">{f.purpose}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "structure" && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Folder Structure</h3>
                  <button onClick={() => copyToClipboard(result.structure)} className="flex items-center gap-1 px-2 py-1 text-xs border border-border rounded hover:bg-muted">
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <pre className="bg-black/20 rounded-xl p-5 text-sm font-mono overflow-x-auto text-green-400 leading-relaxed">
                  {result.structure}
                </pre>
              </div>
            )}

            {activeTab === "readme" && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">README.md</h3>
                  <button onClick={() => copyToClipboard(result.readme)} className="flex items-center gap-1 px-2 py-1 text-xs border border-border rounded hover:bg-muted">
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground font-mono bg-muted/20 rounded-xl p-5">
                  {result.readme}
                </pre>
              </div>
            )}

            {activeTab === "guide" && (
              <div className="space-y-4">
                <h3 className="font-medium">Implementation Guide</h3>
                {result.guide?.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{step.step}</div>
                      <p className="text-muted-foreground text-sm mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
