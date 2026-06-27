// ============================================================
// AI PROVIDER - Auto-fallback: Gemini → OpenRouter → Groq
// ============================================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIResponse {
  text: string;
  provider: string;
  model: string;
}

// ---- GEMINI ----
async function callGemini(
  messages: AIMessage[],
  systemPrompt?: string
): Promise<AIResponse> {
  if (!process.env.GEMINI_API_KEY) throw new Error("No Gemini key");

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    systemInstruction: systemPrompt,
  });

  // FIX: Gemini requires history to start with a 'user' message.
  // Filter out any leading assistant messages and only pass prior turns as history.
  const allMsgs = [...messages];
  const lastMessage = allMsgs.pop(); // the current user message
  if (!lastMessage) throw new Error("No messages");

  // Build history: only include turns before the last message,
  // and drop any leading assistant messages Gemini would reject.
  const rawHistory = allMsgs.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  // Remove leading model turns — Gemini requires history[0].role === "user"
  while (rawHistory.length > 0 && rawHistory[0].role === "model") {
    rawHistory.shift();
  }

  const chat = model.startChat({ history: rawHistory });
  const result = await chat.sendMessage(lastMessage.content);
  const text = result.response.text();

  return { text, provider: "gemini", model: "gemini-1.5-flash-latest" };
}

// ---- OPENROUTER ----
async function callOpenRouter(
  messages: AIMessage[],
  systemPrompt?: string
): Promise<AIResponse> {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("No OpenRouter key");

  const fullMessages = [
    ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
    ...messages,
  ];

  // FIX: updated to a model that actually exists on free tier (June 2025)
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "EduAI Platform",
    },
    body: JSON.stringify({
      model: "google/gemma-3-4b-it:free",
      messages: fullMessages,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${body}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  if (!text) throw new Error("OpenRouter returned empty response");

  return { text, provider: "openrouter", model: "llama-3.2-3b-instruct" };
}

// ---- GROQ ----
async function callGroq(
  messages: AIMessage[],
  systemPrompt?: string
): Promise<AIResponse> {
  if (!process.env.GROQ_API_KEY) throw new Error("No Groq key");

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const fullMessages = [
    ...(systemPrompt
      ? [{ role: "system" as const, content: systemPrompt }]
      : []),
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  // FIX: use llama3-8b-8192 — the correct Groq model ID (not llama-3.1-8b-instant)
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",  
    messages: fullMessages,
    max_tokens: 2048,
  });

  const text = completion.choices[0]?.message?.content || "";
  if (!text) throw new Error("Groq returned empty response");

  return { text, provider: "groq", model: "llama3-8b-8192" };
}

// ---- MAIN: Auto-fallback provider ----
export async function generateAIResponse(
  messages: AIMessage[],
  systemPrompt?: string
): Promise<AIResponse> {
  const providers = [
    { name: "gemini", fn: () => callGemini(messages, systemPrompt) },
    { name: "openrouter", fn: () => callOpenRouter(messages, systemPrompt) },
    { name: "groq", fn: () => callGroq(messages, systemPrompt) },
  ];

  for (const provider of providers) {
    try {
      const result = await provider.fn();
      console.log(`[AI] Using ${provider.name}`);
      return result;
    } catch (err) {
      console.warn(`[AI] ${provider.name} failed:`, (err as Error).message);
    }
  }

  throw new Error("All AI providers failed. Please check your API keys.");
}

// ---- SPECIALIZED PROMPTS ----

export const AI_SYSTEM_PROMPTS = {
  tutor: `You are an expert AI/ML tutor named "EduBot" for an EdTech platform.
You specialize in: Python, Machine Learning, Deep Learning, Data Science, Statistics, NLP, Computer Vision, and Generative AI.
Be concise, clear, and encouraging. Use examples and analogies. Format code with markdown.
When explaining ML concepts, break them into: Definition → Intuition → Math (simplified) → Code → Use Cases.`,

  resumeWriter: `You are a professional resume writer specializing in tech roles (AI/ML/Data Science).
Generate ATS-optimized content. Use action verbs. Quantify achievements. Be concise and impactful.
Always respond in valid JSON format as specified.`,

  projectGenerator: `You are a senior software architect helping students build impressive ML/AI projects.
Generate detailed, production-ready project blueprints with clear implementation guides.
Always respond in valid JSON format as specified.`,

  atsAnalyzer: `You are an ATS (Applicant Tracking System) expert.
Analyze resumes for ATS compatibility. Identify keyword gaps, formatting issues, and improvement areas.
Score from 0-100. Always respond in valid JSON format as specified.`,
};

// ---- SINGLE-TURN GENERATION (for resume, projects, etc.) ----
export async function generateText(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const response = await generateAIResponse(
    [{ role: "user", content: prompt }],
    systemPrompt
  );
  return response.text;
}