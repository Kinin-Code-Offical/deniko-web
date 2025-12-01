import { auth } from "@/auth"
import { getStudentProfileByToken, claimStudentProfile } from "@/app/actions/student"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DenikoLogo } from "@/components/ui/deniko-logo"
import Link from "next/link"
import { CheckCircle2, LogIn, UserPlus } from "lucide-react"

export default async function JoinPage({
    params,
}: {
    params: Promise<{ lang: string; token: string }>
}) {
    const { lang, token } = await params
    const session = await auth()

    const studentProfile = await getStudentProfileByToken(token)

    if (!studentProfile) {
        notFound()
    }

    // If already claimed by this user, redirect to dashboard
    if (studentProfile.userId === session?.user?.id) {
        redirect(`/${lang}/dashboard`)
    }

    // If claimed by someone else, show error (or handle gracefully)
    if (studentProfile.isClaimed) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
                            <DenikoLogo className="h-8 w-8 text-red-600" />
                        </div>
                        <CardTitle className="text-xl text-red-600">Davet Geçersiz</CardTitle>
                        <CardDescription>
                            Bu davet bağlantısı daha önce kullanılmış.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center">
                        <Button asChild variant="outline">
                            <Link href={`/${lang}`}>Ana Sayfaya Dön</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    const teacherName = studentProfile.teacherRelations[0]?.teacher?.user?.name || "Bir Öğretmen"
    const studentName = `${studentProfile.tempFirstName} ${studentProfile.tempLastName}`

    // 1. User NOT Logged In
    if (!session?.user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="text-center space-y-2">
                        <div className="mx-auto bg-[#2062A3] p-3 rounded-xl w-fit mb-4 shadow-md">
                            <DenikoLogo className="h-10 w-10 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-[#2062A3]">Deniko'ya Hoş Geldiniz</CardTitle>
                        <CardDescription className="text-base">
                            <span className="font-semibold text-foreground">{teacherName}</span> sizi öğrencisi olarak eklemek istiyor.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-muted-foreground">
                            Daveti kabul etmek ve derslerinizi takip etmek için lütfen giriş yapın veya yeni bir hesap oluşturun.
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        <Button className="w-full h-11 text-base bg-[#2062A3] hover:bg-[#1a4f83]" asChild>
                            <Link href={`/${lang}/login?callbackUrl=/${lang}/join/${token}`}>
                                <LogIn className="mr-2 h-4 w-4" />
                                Giriş Yap
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full h-11 text-base" asChild>
                            <Link href={`/${lang}/register?invite=${token}`}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Kayıt Ol
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    // 2. User IS Logged In
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-lg border-t-4 border-t-[#2062A3]">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-xl">Davetiyeniz Var</CardTitle>
                    <CardDescription>
                        Sayın <span className="font-semibold text-foreground">{session.user.name}</span>,
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-6 pt-4">
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 shadow-sm">
                        <p className="text-lg font-medium text-[#2062A3] mb-1">{teacherName}</p>
                        <p className="text-sm text-muted-foreground">Sizi öğrencisi olarak eklemek istiyor</p>

                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Öğrenci Bilgileri</p>
                            <p className="font-medium">{studentName}</p>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Kabul ettiğinizde bu profil hesabınızla eşleştirilecek ve ders geçmişinize erişebileceksiniz.
                    </p>
                </CardContent>
                <CardFooter>
                    <form action={async () => {
                        "use server"
                        await claimStudentProfile(token)
                        redirect(`/${lang}/dashboard`)
                    }} className="w-full">
                        <Button type="submit" className="w-full h-11 text-base bg-[#2062A3] hover:bg-[#1a4f83]">
                            Daveti Kabul Et
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    )
}
