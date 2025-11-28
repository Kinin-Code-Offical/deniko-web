import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import { db } from "@/lib/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(db),
    providers: [
        Google({
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    firstName: profile.given_name,
                    lastName: profile.family_name,
                    email: profile.email,
                    image: profile.picture,
                    role: "STUDENT", // Default role, will be updated in onboarding
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id
                // @ts-expect-error - Role is added to user type via module augmentation or just runtime property
                session.user.role = user.role
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
    },
})
