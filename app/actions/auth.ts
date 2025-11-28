"use server"

import { signIn } from "@/auth"

export async function googleSignIn() {
    await signIn("google", { redirectTo: "/onboarding" })
}
