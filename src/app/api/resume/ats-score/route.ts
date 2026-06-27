// ============================================================
// ATS SCORE API
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { generateText, AI_SYSTEM_PROMPTS } from "@/lib/ai/provider";
import type { ATSReport } from "@/types";

const PROMPT_TEMPLATE = (resumeData: unknown) => `
Analyze this resume for ATS (Applicant Tracking System) compatibility.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Return ONLY valid JSON (no markdown, no backticks) in this exact format:
{
  "score": 72,
  "keywords": {
    "found": ["Python", "Machine Learning", "SQL"],
    "missing": ["Docker", "AWS", "TensorFlow"]
  },
  "formatting": {
    "score": 85,
    "issues": ["Avoid tables in resume", "Use standard section headings"]
  },
  "sections": {
    "present": ["Contact", "Summary", "Experience", "Education", "Skills"],
    "missing": ["Certifications", "Achievements"]
  },
  "suggestions": [
    "Add quantifiable metrics to experience bullets",
    "Include LinkedIn URL",
    "Add more industry-relevant keywords"
  ],
  "breakdown": {
    "keywords": 68,
    "experience": 80,
    "education": 90,
    "skills": 75,
    "formatting": 85
  }
}`;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { resumeData } = await req.json();

    const raw = await generateText(PROMPT_TEMPLATE(resumeData), AI_SYSTEM_PROMPTS.atsAnalyzer);

    // Clean and parse
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const report: ATSReport = JSON.parse(cleaned);

    return NextResponse.json({ report });
  } catch (error) {
    console.error("[ATS SCORE]", error);
    // Return fallback report
    return NextResponse.json({
      report: {
        score: 0,
        keywords: { found: [], missing: [] },
        formatting: { score: 0, issues: ["Analysis failed - please check your API keys"] },
        sections: { present: [], missing: [] },
        suggestions: ["Please check your AI API keys to enable ATS analysis"],
        breakdown: { keywords: 0, experience: 0, education: 0, skills: 0, formatting: 0 },
      },
    });
  }
}
