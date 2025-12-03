"use server"

import { signOut } from "@/auth"

/**
 * Signs out the current user and redirects to the login page.
 */
export async function signOutAction() {
    await signOut({ redirectTo: "/login" })
}
