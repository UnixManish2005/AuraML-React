// ============================================================
// RESUME SAVE API
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const resumes = await db.resumeProfile.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });

    return NextResponse.json({ resumes });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { resumeData, template, title } = await req.json();

    // If no existing resume, mark as default
    const count = await db.resumeProfile.count({ where: { userId: session.user.id } });

    const resume = await db.resumeProfile.create({
      data: {
        userId: session.user.id,
        title: title || `Resume ${count + 1}`,
        template: template || "MODERN",
        isDefault: count === 0,
        personalInfo: resumeData.personalInfo,
        summary: resumeData.summary || null,
        experience: resumeData.experience || [],
        education: resumeData.education || [],
        skills: resumeData.skills || {},
        projects: resumeData.projects || [],
        achievements: resumeData.achievements || [],
        certifications: resumeData.certifications || [],
      },
    });

    // Update analytics
    await db.userAnalytics.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
    }).catch(console.error);

    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    console.error("[RESUME SAVE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, resumeData, template, atsScore, atsReport } = await req.json();

    const resume = await db.resumeProfile.update({
      where: { id, userId: session.user.id },
      data: {
        template: template || "MODERN",
        personalInfo: resumeData.personalInfo,
        summary: resumeData.summary || null,
        experience: resumeData.experience || [],
        education: resumeData.education || [],
        skills: resumeData.skills || {},
        projects: resumeData.projects || [],
        achievements: resumeData.achievements || [],
        certifications: resumeData.certifications || [],
        ...(atsScore !== undefined && { atsScore }),
        ...(atsReport !== undefined && { atsReport }),
      },
    });

    return NextResponse.json({ resume });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
