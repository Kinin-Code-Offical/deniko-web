import { GoogleLoginButton } from "@/components/auth/google-login-button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { GraduationCap } from "lucide-react"

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-blue-100 p-3 mb-4">
                        <GraduationCap className="h-10 w-10 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Deniko'ya Hoş Geldiniz
                    </h1>
                    <p className="mt-2 text-slate-600">
                        Profesyonel özel ders yönetim platformu
                    </p>
                </div>

                <Card className="border-slate-200 shadow-lg">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-xl">Giriş Yap</CardTitle>
                        <CardDescription>
                            Hesabınıza erişmek için Google ile devam edin
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <GoogleLoginButton />
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500">
                                    Güvenli Giriş
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-center text-slate-500 px-4">
                            Devam ederek <span className="text-blue-600 hover:underline cursor-pointer">Kullanım Koşulları</span> ve <span className="text-blue-600 hover:underline cursor-pointer">Gizlilik Politikası</span>'nı kabul etmiş olursunuz.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
