// ============================================================
// REGISTER API ROUTE
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { sendEmail } from "@/lib/email";
import { studentSelfRegisterEmail } from "@/lib/email/templates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    // Check if user exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user + profile in transaction
    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      });

      // Create role-specific profile
      if (role === "STUDENT") {
        await tx.student.create({ data: { userId: newUser.id } });
        await tx.userAnalytics.create({ data: { userId: newUser.id } });
      } else if (role === "TRAINER") {
        await tx.trainer.create({ data: { userId: newUser.id } });
      }

      return newUser;
    });

    // Send welcome email — fire-and-forget (don't await so response isn't delayed)
    if (role === "STUDENT") {
      const template = studentSelfRegisterEmail(name, email, password);
      sendEmail({ to: email, ...template });
    }

    return NextResponse.json(
      { success: true, message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}