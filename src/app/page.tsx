// ============================================================
// LANDING PAGE - Marketing homepage
// ============================================================

import Link from "next/link";
import { ArrowRight, Brain, Code2, BarChart3, FileText, Trophy, Users, Zap, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050813] text-white overflow-hidden">
      {/* ---- NAVIGATION ---- */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-xl bg-[#050813]/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <span className="text-lg">🐬</span>
            </div>
            <span className="font-bold text-lg tracking-tight">AuraML</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#courses" className="hover:text-white transition-colors">Courses</Link>
            <Link href="#tools" className="hover:text-white transition-colors">AI Tools</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/auth/register" className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ---- HERO ---- */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Glow orbs */}
        <div className="absolute top-40 left-1/4 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-sm text-blue-400 mb-8">
            <Zap className="w-3.5 h-3.5" />
            Welcome to AuraML
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
            Master{" "}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              AI & Machine Learning
            </span>
            <br />with Expert Guidance
          </h1>

          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            The complete platform for learning Data Science, Machine Learning & AI — with interactive labs, ATS resume builder, AI tutor, and placement support.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200">
              Start Learning Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/auth/login" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200">
              View Demo
            </Link>
          </div>

          {/* Stats bar */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm">
            {[
              { label: "Students Enrolled", value: "12,000+" },
              { label: "Courses Available", value: "10+" },
              { label: "AI Tools", value: "10+" },
              { label: "Placement Rate", value: "87%" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FEATURES ---- */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-white/50 text-lg">From interactive learning to job placement</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- COURSES ---- */}
      <section id="courses" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What we offer !!</h2>
            <p className="text-white/50 text-lg">Learn from basics to advanced with structured curriculum</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map((c) => (
              <div key={c.name} className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all">
                <div className="text-3xl mb-3">{c.icon}</div>
                <div className="font-medium mb-1">{c.name}</div>
                <div className="text-white/40 text-sm">{c.lessons} lessons</div>
                <div className={`mt-3 text-xs font-medium px-2.5 py-1 rounded-full inline-block ${c.levelColor}`}>
                  {c.level}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- AI TOOLS ---- */}
      <section id="tools" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 text-sm text-violet-400 mb-6">
                <Brain className="w-3.5 h-3.5" />
                AI-Powered Tools
              </div>
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                Your AI assistant for every step
              </h2>
              <div className="space-y-4">
                {aiTools.map((t) => (
                  <div key={t.title} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">{t.title}</div>
                      <div className="text-white/40 text-sm">{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 font-mono text-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-white/30 text-xs">AI Tutor Chat</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-lg p-3 text-white/70">
                    How does gradient descent work? 🤔
                  </div>
                  <div className="bg-blue-600/20 border border-blue-500/20 rounded-lg p-3 text-white/80">
                    <p className="mb-2">Great question! Think of gradient descent like rolling a ball downhill 🏔️</p>
                    <p className="text-white/50 text-xs">1. Start at a random point<br />2. Calculate the slope (gradient)<br />3. Move in the direction that reduces loss<br />4. Repeat until you reach the bottom</p>
                    <div className="mt-3 bg-black/30 rounded p-2 text-xs text-green-400">
                      <span className="text-blue-400">def </span>
                      gradient_descent(X, y, lr=0.01): ...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to start your AI journey?</h2>
          <p className="text-white/50 text-lg mb-10">Join thousands of students building careers in AI & Data Science</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-10 py-4 rounded-xl font-medium text-lg transition-all duration-200 shadow-lg shadow-blue-500/25">
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-sm">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span>AuraML © 2026</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white/70 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ---- DATA ----
const features = [
  { icon: Brain, title: "AI/ML Learning Labs", desc: "Interactive visual labs to train models, adjust parameters and see results in real-time.", color: "bg-blue-600" },
  { icon: FileText, title: "ATS Resume Builder", desc: "Build job-ready resumes with AI writing assistance and ATS score checker.", color: "bg-violet-600" },
  { icon: Code2, title: "Project Generator", desc: "Get complete AI project blueprints with folder structure, code templates and guides.", color: "bg-cyan-600" },
  { icon: Trophy, title: "Quiz System", desc: "Timed quizzes with MCQ, coding, and scenario questions with instant feedback.", color: "bg-amber-600" },
  { icon: BarChart3, title: "Progress Analytics", desc: "Detailed dashboards tracking learning time, quiz scores, and completion rates.", color: "bg-green-600" },
  { icon: Users, title: "Batch Management", desc: "Admin tools to manage students, trainers, batches, and certificates.", color: "bg-rose-600" },
];

const courses = [
  { name: "Python Fundamentals", icon: "🐍", lessons: 48, level: "Beginner", levelColor: "bg-green-500/10 text-green-400" },
  { name: "Machine Learning", icon: "🤖", lessons: 64, level: "Intermediate", levelColor: "bg-yellow-500/10 text-yellow-400" },
  { name: "Deep Learning", icon: "🧠", lessons: 52, level: "Advanced", levelColor: "bg-red-500/10 text-red-400" },
  { name: "Data Science", icon: "📊", lessons: 56, level: "Intermediate", levelColor: "bg-yellow-500/10 text-yellow-400" },
  { name: "Computer Vision", icon: "👁️", lessons: 40, level: "Advanced", levelColor: "bg-red-500/10 text-red-400" },
  { name: "NLP & GenAI", icon: "💬", lessons: 44, level: "Advanced", levelColor: "bg-red-500/10 text-red-400" },
  { name: "Statistics", icon: "📐", lessons: 36, level: "Beginner", levelColor: "bg-green-500/10 text-green-400" },
  { name: "AI for Teenagers", icon: "👦", lessons: 32, level: "Beginner", levelColor: "bg-green-500/10 text-green-400" },
];

const aiTools = [
  { title: "AI Tutor Chatbot", desc: "Ask anything about Python, ML, AI, or Statistics. Get instant expert answers." },
  { title: "ATS Resume Analyzer", desc: "Score your resume against job descriptions and get improvement suggestions." },
  { title: "AI Resume Writer", desc: "Generate professional summaries, bullet points and project descriptions." },
  { title: "ML Project Builder", desc: "Generate complete project blueprints for your portfolio." },
  { title: "Dataset Playground", desc: "Upload any CSV and get instant EDA, visualizations, and insights." },
];
