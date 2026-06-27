// ============================================================
// SETUP ROUTE — /api/setup
// Creates the admin account if it doesn't exist.
// Visit http://localhost:3000/api/setup once to initialise.
// DELETE THIS FILE before deploying to production.
// ============================================================

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const email = "admin@auraml.com";
    const plainPassword = "Admin@123";
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    // Upsert admin user — always writes the correct password
    const user = await db.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        name: "Super Admin",
      },
      create: {
        email,
        name: "Super Admin",
        password: hashedPassword,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      },
    });

    // Ensure Admin profile row exists
    await db.admin.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, department: "Management" },
    });

    // Verify the hash works before reporting success
    const check = await bcrypt.compare(plainPassword, hashedPassword);

    return NextResponse.json({
      success: true,
      message: "Admin account ready. You can now log in.",
      email,
      password: plainPassword,
      hashValid: check,
      userId: user.id,
    });
  } catch (error) {
    console.error("[SETUP]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Setup failed. Check your DATABASE_URL and run: npx prisma db push",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
