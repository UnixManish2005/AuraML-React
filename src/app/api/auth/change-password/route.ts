// ============================================================
// CHANGE PASSWORD API
// Updates password + clears mustChangePassword flag
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  newPassword: z
    .string()
    .min(8, "Minimum 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { newPassword } = parsed.data;

    // Hash and save new password, clear the mustChangePassword flag
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    // Determine where to redirect based on role
    const redirectMap: Record<string, string> = {
      TRAINER: "/trainer",
      ADMIN: "/admin",
      SUPER_ADMIN: "/admin",
      STUDENT: "/student",
    };
    const redirectTo = redirectMap[session.user.role] || "/";

    return NextResponse.json({ success: true, redirectTo });
  } catch (error) {
    console.error("[CHANGE PASSWORD]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}