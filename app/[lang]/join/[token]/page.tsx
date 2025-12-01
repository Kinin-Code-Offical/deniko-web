import { auth } from "@/auth"
import { Locale } from "@/i18n-config"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { JoinCard } from "./join-card"

export default async function JoinPage({
    params,
}: {
    params: Promise<{ lang: Locale; token: string }>
}) {
    const { lang, token } = await params
    console.log("JoinPage params:", { lang, token })

    if (!token) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive">Invalid Link</h1>
                    <p className="text-muted-foreground">The invite link is missing the token.</p>
                </div>
            </div>
        )
    }

    const session = await auth()

    if (!session?.user) {
        redirect(`/${lang}/login?callbackUrl=/${lang}/join/${token}`)
    }

    const profile = await db.studentProfile.findUnique({
        where: { inviteToken: token },
        include: {
            teacherRelations: {
                include: {
                    teacher: {
                        include: {
                            user: true
                        }
                    }
                }
            }
        }
    })

    if (!profile) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive">Invalid Invite</h1>
                    <p className="text-muted-foreground">This invite link is invalid or has expired.</p>
                </div>
            </div>
        )
    }

    if (profile.userId) {
        if (profile.userId === session.user.id) {
            redirect(`/${lang}/dashboard`)
        }
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive">Invite Used</h1>
                    <p className="text-muted-foreground">This invite link has already been claimed.</p>
                </div>
            </div>
        )
    }

    // Extract teacher name
    const teacher = profile.teacherRelations[0]?.teacher?.user
    const teacherName = teacher ? (teacher.name || `${teacher.firstName} ${teacher.lastName}`) : "Unknown Teacher"

    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/50 p-4">
            <JoinCard
                token={token}
                studentName={`${profile.tempFirstName} ${profile.tempLastName}`}
                teacherName={teacherName}
                lang={lang}
            />
        </div>
    )
}
