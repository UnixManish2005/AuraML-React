// ============================================================
// AI CHAT API ROUTE
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { generateAIResponse, AI_SYSTEM_PROMPTS } from "@/lib/ai/provider";
import { db } from "@/lib/db";
import type { AIMessage } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, topic } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // Build system prompt with optional topic focus
    let systemPrompt = AI_SYSTEM_PROMPTS.tutor;
    if (topic) {
      systemPrompt += `\n\nFocus area for this session: ${topic}. Prioritize examples and explanations related to ${topic}.`;
    }

    const aiMessages: AIMessage[] = messages.slice(-10); // Keep last 10 messages for context

    const response = await generateAIResponse(aiMessages, systemPrompt);

    // Save to DB (non-blocking)
    const lastUserMsg = messages.filter((m: AIMessage) => m.role === "user").pop();
    if (lastUserMsg) {
      db.chatMessage.createMany({
        data: [
          { userId: session.user.id, role: "user", content: lastUserMsg.content, metadata: { topic, model: response.model } },
          { userId: session.user.id, role: "assistant", content: response.text, metadata: { provider: response.provider, model: response.model } },
        ],
      }).catch(console.error);
    }

    return NextResponse.json({
      text: response.text,
      provider: response.provider,
      model: response.model,
    });
  } catch (error) {
    console.error("[AI CHAT]", error);
    return NextResponse.json(
      { error: "AI service unavailable. Please check your API keys." },
      { status: 503 }
    );
  }
}
