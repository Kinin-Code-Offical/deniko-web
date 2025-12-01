import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { SignJWT } from "jose"
import { Role } from "@prisma/client"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    providers: [
        Google({
            allowDangerousEmailAccountLinking: true,
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    firstName: profile.given_name,
                    lastName: profile.family_name,
                    email: profile.email,
                    image: profile.picture,
                    // Email verification will happen after onboarding completion
                    emailVerified: null,
                }
            },
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await db.user.findUnique({ where: { email } });

                    if (!user || !user.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) {
                        if (!user.emailVerified) throw new Error("Email not verified");
                        return user;
                    }
                }
                return null;
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            // Allow dangerous linking for Google (handled in provider config usually, but we can check here)

            if (account?.provider === "google") {
                if (!user.email) return false

                const existingUser = await db.user.findUnique({
                    where: { email: user.email },
                })

                if (existingUser) {
                    // Check if user is active
                    if (existingUser.isActive === false) return false
                    return true
                }

                // User does not exist, allow creation
                return true
            }

            // For credentials, we also want to check isActive if not already done in authorize
            if (user.email) {
                const existingUser = await db.user.findUnique({ where: { email: user.email } })
                if (existingUser && existingUser.isActive === false) return false
            }

            return true
        },
        async session({ session, token }) {
            // Strict validation: If token is invalid/null, invalidate session
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!token || !token.sub) return null as any

            if (token.sub && session.user) {
                session.user.id = token.sub
            }

            if (token.role && session.user) {
                session.user.role = token.role as Role
            }

            if (session.user) {
                session.user.isOnboardingCompleted = token.isOnboardingCompleted as boolean
            }

            return session
        },
        async jwt({ token }) {
            if (!token.sub) return token;

            const existingUser = await db.user.findUnique({
                where: { id: token.sub }
            });

            // If user is deleted or inactive, invalidate token
            if (!existingUser || existingUser.isActive === false) {
                return null;
            }

            token.role = existingUser.role;
            token.isOnboardingCompleted = existingUser.isOnboardingCompleted;
            return token;
        }
    },
    pages: {
        signIn: "/login",
        newUser: "/onboarding" // Redirect new users here
    },
})
