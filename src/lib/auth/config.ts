// ============================================================
// AUTH.JS v5 CONFIGURATION
// ============================================================

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validators";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) {
            console.error("[AUTH] loginSchema failed:", parsed.error.flatten());
            return null;
          }

          const { email, password } = parsed.data;

          const user = await db.user.findUnique({
            where: { email },
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
              role: true,
              status: true,
              image: true,
              mustChangePassword: true,
            },
          });

          if (!user) {
            console.error("[AUTH] User not found:", email);
            return null;
          }

          if (!user.password) {
            console.error("[AUTH] User has no password (OAuth-only account):", email);
            return null;
          }

          if (user.status === "SUSPENDED") {
            throw new Error("Account suspended. Contact admin.");
          }

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            console.error("[AUTH] Password mismatch for:", email);
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            image: user.image,
            mustChangePassword: user.mustChangePassword,
          };
        } catch (err) {
          // Only surface explicit user-facing messages (e.g. "Account suspended")
          if (err instanceof Error && err.message && !err.message.includes("prisma") && !err.message.includes("NEXT_REDIRECT")) {
            throw err;
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
        token.status = (user as { status: string }).status;
        token.mustChangePassword = (user as { mustChangePassword: boolean }).mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
        session.user.mustChangePassword = token.mustChangePassword as boolean;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      // Update last active analytics
      await db.userAnalytics.upsert({
        where: { userId: user.id! },
        update: { lastActive: new Date() },
        create: { userId: user.id! },
      }).catch(() => {});
    },
  },
});

// ---- TYPE AUGMENTATION ----
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      status: string;
      mustChangePassword: boolean;
    };
  }
}