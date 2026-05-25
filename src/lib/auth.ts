// ============================================================================
// NextAuth v5 (Auth.js) Configuration
// MongoDB Adapter + Credentials Provider with role-based auth
// ============================================================================

import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// Extend the built-in session types to include role
declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

// Re-export for convenience throughout the app
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] Missing credentials");
          return null;
        }
        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        console.log("[AUTH] Attempting login for:", email);

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) {
          console.log("[AUTH] User not found or no password set:", email);
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          console.log("[AUTH] Invalid password for:", email);
          return null;
        }

        console.log("[AUTH] Login successful for:", email, "role:", user.role);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role ?? "tenant";
        console.log("[AUTH] JWT callback — user set:", { id: token.id, role: token.role });
      }
      if (trigger === "update" && session) {
        token.role = (session as any).role ?? token.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role ?? "tenant";
        console.log("[AUTH] Session callback:", { id: session.user.id, role: (session.user as any).role });
      }
      return session;
    },
  },
});
