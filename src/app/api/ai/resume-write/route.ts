// ============================================================
// AI RESUME WRITER API
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { generateText, AI_SYSTEM_PROMPTS } from "@/lib/ai/provider";

const prompts = {
  summary: (ctx: { name: string; title: string }) => `
Write a compelling professional summary for a resume.
Name: ${ctx.name}
Title/Role: ${ctx.title}

Requirements:
- 3-4 sentences, 80-100 words
- ATS-optimized with relevant keywords
- Start with a strong action statement
- Include years of experience estimate
- Highlight key value proposition
- Focus on AI/ML/Data Science context

Return ONLY the summary text, nothing else.`,

  experience_bullets: (ctx: { role: string; company: string }) => `
Generate 4 powerful resume bullet points for this experience:
Role: ${ctx.role}
Company: ${ctx.company}

Requirements:
- Start each with a strong action verb (Developed, Implemented, Optimized, Led, Built, Designed)
- Include metrics/percentages where possible
- Focus on AI/ML/Data Science achievements
- ATS-optimized language

Return as JSON array: ["bullet 1", "bullet 2", "bullet 3", "bullet 4"]
No markdown, no extra text.`,

  project_description: (ctx: { name: string; techStack: string[] }) => `
Write a concise project description for a resume:
Project: ${ctx.name}
Tech Stack: ${ctx.techStack.join(", ")}

Requirements:
- 2-3 sentences max
- Mention the problem solved and impact
- Include tech stack naturally
- ATS-friendly keywords
- Professional tone

Return ONLY the description text.`,

  achievement: (ctx: { description: string }) => `
Rewrite this achievement as a powerful resume bullet point:
"${ctx.description}"

Make it:
- Start with a strong action verb
- Include metrics if possible
- Concise and impactful (1 sentence)
- ATS-optimized

Return ONLY the bullet text.`,
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { type, context } = await req.json();

    const promptFn = prompts[type as keyof typeof prompts];
    if (!promptFn) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const raw = await generateText(
      promptFn(context as { name: string; title: string; role: string; company: string; techStack: string[]; description: string }),
      AI_SYSTEM_PROMPTS.resumeWriter
    );

    // Parse JSON arrays if expected
    let content: string | string[] = raw.trim();
    if (type === "experience_bullets") {
      try {
        const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        content = JSON.parse(cleaned);
      } catch {
        content = raw.split("\n").filter((l) => l.trim().startsWith("-") || l.trim().startsWith("•"))
          .map((l) => l.replace(/^[-•]\s*/, "").trim())
          .filter(Boolean);
      }
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("[RESUME WRITER]", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 503 });
  }
}
