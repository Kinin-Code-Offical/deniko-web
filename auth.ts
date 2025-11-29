import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { SignJWT } from "jose"

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
                    emailVerified: profile.email_verified ? new Date() : null,
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
            if (account?.provider === "google") {
                if (!user.email) return false

                const existingUser = await db.user.findUnique({
                    where: { email: user.email },
                })

                if (existingUser) return true

                // User does not exist, create a token and redirect to onboarding
                const secret = new TextEncoder().encode(process.env.AUTH_SECRET)
                const token = await new SignJWT({
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    googleId: user.id,
                })
                    .setProtectedHeader({ alg: "HS256" })
                    .setExpirationTime("1h")
                    .sign(secret)

                return `/onboarding?token=${token}`
            }
            return true
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }

            if (token.role && session.user) {
                // @ts-expect-error - Role is added to user type
                session.user.role = token.role
            }
            return session
        },
        async jwt({ token }) {
            if (!token.sub) return token;

            const existingUser = await db.user.findUnique({
                where: { id: token.sub }
            });

            if (!existingUser) return token;

            token.role = existingUser.role;
            return token;
        }
    },
    pages: {
        signIn: "/login",
    },
})
