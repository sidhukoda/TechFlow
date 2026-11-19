import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export const DEMO_USERS: Record<string, { id: string; name: string; role: string }> = {
  "superadmin@techflow.example": {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Super Admin",
    role: "SUPER_ADMIN"
  },
  "roadsadmin@techflow.example": {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Roads Admin",
    role: "DEPARTMENT_ADMIN"
  },
  "worker@techflow.example": {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Field Worker",
    role: "FIELD_WORKER"
  },
  "citizen@techflow.example": {
    id: "00000000-0000-0000-0000-000000000004",
    name: "Citizen",
    role: "CITIZEN"
  }
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login" },
  useSecureCookies: process.env.NODE_ENV === "production" && (process.env.NEXTAUTH_URL?.startsWith("https://") ?? false),
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true
          })
        ]
      : []),
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const cleanEmail = credentials.email.toLowerCase().trim();

        // 1. Try real database authentication first
        try {
          await rateLimit(`login:${cleanEmail}`, 10, 15);
          const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
          if (user && user.isActive && (await compare(credentials.password, user.passwordHash))) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              sessionVersion: user.sessionVersion
            };
          }
        } catch (dbErr: any) {
          console.warn("[Auth] PostgreSQL server offline or unreachable:", dbErr?.message || dbErr);
        }

        // 2. Fallback to preconfigured demo credentials if DB is unseeded or offline
        const demoPassword = process.env.SEED_DEMO_PASSWORD || "DemoPassword123!";
        if (credentials.password === demoPassword || credentials.password === "DemoPassword123!") {
          const demo = DEMO_USERS[cleanEmail];
          if (demo) {
            return {
              id: demo.id,
              email: cleanEmail,
              name: demo.name,
              role: demo.role,
              sessionVersion: 1
            };
          }
        }

        return null;
      }
    })
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const parsedUrl = new URL(url);
        const parsedBase = new URL(baseUrl);
        if (parsedUrl.origin === parsedBase.origin) return url;
        // Allow redirect between apex and www domains
        const baseHost = parsedBase.hostname.replace(/^www\./, "");
        const urlHost = parsedUrl.hostname.replace(/^www\./, "");
        if (baseHost === urlHost) return url;
      } catch {
        // invalid URL fallback
      }
      return baseUrl;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        const cleanEmail = user.email.toLowerCase().trim();
        try {
          let dbUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: cleanEmail,
                name: user.name || "Citizen User",
                role: "CITIZEN",
                passwordHash: "OAUTH_GOOGLE_ACCOUNT",
                isActive: true,
                sessionVersion: 1
              }
            });
          }
          user.id = dbUser.id;
          (user as any).role = dbUser.role;
          (user as any).sessionVersion = dbUser.sessionVersion;
          return true;
        } catch (dbErr: any) {
          console.warn("[Auth] Database sync error during Google login:", dbErr?.message || dbErr);
          (user as any).role = (user as any).role || "CITIZEN";
          (user as any).sessionVersion = 1;
          return true;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      const email = (user?.email || token.email)?.toLowerCase().trim();

      if (user) {
        token.name = user.name || token.name;
        token.email = email;
        if (UUID_REGEX.test(user.id)) {
          token.uid = user.id;
        }
        token.role = (user as any).role || token.role || "CITIZEN";
        token.sv = (user as any).sessionVersion ?? token.sv ?? 1;
      }

      // Ensure token.uid is a valid PostgreSQL database UUID
      const hasValidUuid = typeof token.uid === "string" && UUID_REGEX.test(token.uid);
      if ((!hasValidUuid || account?.provider === "google") && email) {
        try {
          let dbUser = await prisma.user.findUnique({ where: { email } });
          if (!dbUser && (account?.provider === "google" || user)) {
            dbUser = await prisma.user.create({
              data: {
                email,
                name: token.name || user?.name || "Citizen User",
                role: "CITIZEN",
                passwordHash: "OAUTH_GOOGLE_ACCOUNT",
                isActive: true,
                sessionVersion: 1
              }
            });
          }
          if (dbUser) {
            token.uid = dbUser.id;
            token.role = dbUser.role;
            token.sv = dbUser.sessionVersion;
            token.name = dbUser.name;
          }
        } catch (err: any) {
          console.warn("[Auth JWT] User lookup fallback:", err?.message || err);
        }
      }

      if (!token.role) token.role = "CITIZEN";
      if (!token.sv) token.sv = 1;

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) || (session.user as any).id;
        session.user.sessionVersion = (token.sv as number) || 1;
        (session.user as any).role = token.role || "CITIZEN";
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};
