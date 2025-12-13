import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { z } from "zod";
import { Role } from "@prisma/client";
import { env } from "@/lib/env";
import { generateUniqueUsername } from "@/lib/username";
import { assertLoginRateLimit } from "@/lib/rate-limit-login";
import { getClientIp } from "@/lib/get-client-ip";
import { logger } from "@/lib/logger";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  secret: env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      async profile(profile) {
        const username = await generateUniqueUsername(
          profile.given_name || "",
          profile.family_name || ""
        );
        return {
          id: profile.sub,
          name: profile.name,
          firstName: profile.given_name,
          lastName: profile.family_name,
          username,
          email: profile.email,
          image: profile.picture,
          // Email verification will happen after onboarding completion
          emailVerified: null,
        };
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const ip = getClientIp(req as Request);
        const email = (credentials?.email as string)?.toLowerCase() ?? null;

        try {
          await assertLoginRateLimit({
            ip,
            email,
          });

          const parsedCredentials = z
            .object({ email: z.string().email(), password: z.string().min(6) })
            .safeParse(credentials);

          if (parsedCredentials.success) {
            const { email, password } = parsedCredentials.data;
            const user = await db.user.findUnique({ where: { email } });

            if (!user || !user.password) {
              logger.warn({
                event: "login_failed_user_not_found",
                ip,
                email,
              });
              return null;
            }

            // Check if user is active
            if (user.isActive === false) {
              logger.warn({
                event: "login_blocked_inactive",
                ip,
                userId: user.id,
                email: user.email,
              });
              throw new Error("ACCOUNT_INACTIVE");
            }

            const passwordsMatch = await verifyPassword(password, user.password);

            if (passwordsMatch) {
              if (!user.emailVerified) {
                logger.warn({
                  event: "login_blocked_unverified_email",
                  ip,
                  userId: user.id,
                  email: user.email,
                });
                throw new Error("Email not verified");
              }

              logger.info({
                event: "login_success",
                ip,
                userId: user.id,
                email: user.email,
                role: user.role,
              });
              return user;
            } else {
              logger.warn({
                event: "login_failed_invalid_password",
                ip,
                userId: user.id,
                email: user.email,
              });
            }
          }
          return null;
        } catch (err) {
          const code = (err as { code?: string })?.code ?? "UNKNOWN";
          const { message } = err as Error;

          // Don't log expected errors as errors
          if (code === "TOO_MANY_LOGIN_ATTEMPTS_IP" || code === "TOO_MANY_LOGIN_ATTEMPTS_USER") {
            // Already logged in assertLoginRateLimit
            throw err;
          }

          if (message === "ACCOUNT_INACTIVE" || message === "Email not verified") {
            // Already logged above
            throw err;
          }

          logger.error({
            event: "login_authorize_error",
            ip,
            email,
            errorCode: code,
            errorMessage: message,
          });

          throw err;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Allow dangerous linking for Google (handled in provider config usually, but we can check here)

      if (account?.provider === "google") {
        if (!user.email) return false;

        const existingUser = await db.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          // Check if user is active
          if (existingUser.isActive === false) return false;
          return true;
        }

        // User does not exist, allow creation
        return true;
      }

      // For credentials, we also want to check isActive if not already done in authorize
      if (user.email) {
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
        });
        if (existingUser && existingUser.isActive === false) return false;
      }

      return true;
    },
    async session({ session, token }) {
      // Strict validation: If token is invalid/null, invalidate session

      if (!token || !token.sub) return session;

      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as Role;
      }

      if (session.user) {
        session.user.isOnboardingCompleted =
          token.isOnboardingCompleted as boolean;
        session.user.username = token.username as string;
        session.user.avatarVersion = token.avatarVersion as number;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await db.user.findUnique({
        where: { id: token.sub },
      });

      // If user is deleted or inactive, invalidate token
      if (!existingUser || existingUser.isActive === false) {
        return null;
      }

      token.role = existingUser.role;
      token.username = existingUser.username;
      token.isOnboardingCompleted = existingUser.isOnboardingCompleted;
      token.avatarVersion = existingUser.avatarVersion;
      return token;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding", // Redirect new users here
  },
});
