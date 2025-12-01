"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { claimStudentProfile } from "@/app/actions/student"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function JoinCard({ token, studentName, teacherName, lang }: { token: string, studentName: string, teacherName: string, lang: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleJoin = async () => {
        setLoading(true)
        try {
            const result = await claimStudentProfile(token)
            if (result.success) {
                toast.success("Successfully joined the class!")
                router.push(`/${lang}/dashboard`)
            } else {
                toast.error(result.error || "Failed to join")
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Join Class</CardTitle>
                <CardDescription>
                    You have been invited to join a class on Deniko.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">Teacher</div>
                    <div className="text-lg font-semibold">{teacherName}</div>
                </div>
                <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">Student Profile</div>
                    <div className="text-lg font-semibold">{studentName}</div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => router.push(`/${lang}/dashboard`)}>
                    Cancel
                </Button>
                <Button onClick={handleJoin} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Accept Invite
                </Button>
            </CardFooter>
        </Card>
    )
}
