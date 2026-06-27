// ============================================================
// AI TUTOR PAGE
// ============================================================

"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Trash2, Zap, BookOpen, Code2, BarChart3, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  { icon: "🤖", text: "Explain gradient descent with a simple analogy" },
  { icon: "🐍", text: "What's the difference between lists and tuples in Python?" },
  { icon: "📊", text: "How does a Random Forest work?" },
  { icon: "🧠", text: "What is backpropagation in neural networks?" },
  { icon: "📈", text: "Explain overfitting and how to prevent it" },
  { icon: "🔢", text: "What is the difference between L1 and L2 regularization?" },
];

const TOPIC_CHIPS = [
  { label: "Python", icon: Code2 },
  { label: "Machine Learning", icon: Brain },
  { label: "Statistics", icon: BarChart3 },
  { label: "Deep Learning", icon: Zap },
  { label: "Concepts", icon: BookOpen },
];

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isUser ? "bg-blue-600 text-white" : "bg-violet-600 text-white"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-3 text-sm",
        isUser
          ? "bg-blue-600 text-white rounded-tr-sm"
          : "bg-card border border-border text-foreground rounded-tl-sm"
      )}>
        {/* Render markdown-like content */}
        <div className="whitespace-pre-wrap leading-relaxed">
          {message.content.split("```").map((part, i) => {
            if (i % 2 === 1) {
              // Code block
              const lines = part.split("\n");
              const lang = lines[0];
              const code = lines.slice(1).join("\n");
              return (
                <div key={i} className="my-2">
                  {lang && <div className="text-xs text-muted-foreground mb-1 font-mono">{lang}</div>}
                  <pre className="bg-black/20 rounded-lg p-3 overflow-x-auto text-xs font-mono">
                    <code>{code || part}</code>
                  </pre>
                </div>
              );
            }
            // Regular text - handle **bold** and bullet points
            return (
              <span key={i}>
                {part.split("\n").map((line, li) => {
                  const boldProcessed = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`);
                  return (
                    <span key={li}>
                      <span dangerouslySetInnerHTML={{ __html: boldProcessed }} />
                      {li < part.split("\n").length - 1 && <br />}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </div>

        <div className={cn("text-xs mt-2 opacity-60", isUser ? "text-blue-100" : "text-muted-foreground")}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm **AuraML Soul**, your AI tutor for Python, Machine Learning, Data Science, and AI! 🤖\n\nI can help you:\n- Understand complex concepts with simple analogies\n- Debug your Python code\n- Explain ML algorithms step-by-step\n- Suggest projects and resources\n\nWhat would you like to learn today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(content?: string) {
    const text = content || input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          topic: selectedTopic,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.text, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm having trouble connecting right now. Please check your API keys and try again.", timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">AuraML Soul</h1>
            <div className="flex items-center gap-1.5 text-xs text-emerald-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Online • Powered by Gemini
            </div>
          </div>
        </div>
        <button
          onClick={() => setMessages([{
            role: "assistant",
            content: "Chat cleared! How can I help you learn today? 🎯",
            timestamp: new Date(),
          }])}
          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear chat
        </button>
      </div>

      {/* Topic filter chips */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-xs text-muted-foreground flex-shrink-0">Focus on:</span>
        {TOPIC_CHIPS.map((topic) => (
          <button
            key={topic.label}
            onClick={() => setSelectedTopic(selectedTopic === topic.label ? null : topic.label)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0",
              selectedTopic === topic.label
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            <topic.icon className="w-3 h-3" />
            {topic.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Suggested questions when no user messages */}
        {messages.length === 1 && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-3 font-medium">TRY ASKING</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q.text}
                  onClick={() => sendMessage(q.text)}
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl text-left hover:border-primary/40 hover:bg-muted/50 transition-all text-sm group"
                >
                  <span className="text-xl">{q.icon}</span>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
                    {q.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="mt-4 bg-card border border-border rounded-2xl p-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about Python, ML, AI, Statistics..."
          rows={1}
          className="w-full bg-transparent text-sm resize-none focus:outline-none placeholder:text-muted-foreground max-h-32 overflow-y-auto scrollbar-thin"
          style={{ minHeight: "2rem" }}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1 py-0.5 rounded bg-muted text-xs">Enter</kbd> to send • <kbd className="px-1 py-0.5 rounded bg-muted text-xs">Shift+Enter</kbd> for new line
          </p>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
