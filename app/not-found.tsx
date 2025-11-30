"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion, Home, MoveLeft } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export default function NotFound() {
  const router = useRouter()
  const pathname = usePathname()

  const isEnglish = pathname?.startsWith("/en")

  const dict = {
    title: isEnglish ? "Page Not Found" : "Sayfa Bulunamadı",
    heading: isEnglish ? "The page you are looking for seems to be lost" : "Aradığınız sayfa kaybolmuş gibi görünüyor",
    description: isEnglish
      ? "The page you are trying to reach may have been deleted, moved, or never existed. Don't worry, we can get you back on track."
      : "Ulaşmaya çalıştığınız sayfa silinmiş, taşınmış veya hiç var olmamış olabilir. Endişelenmeyin, sizi doğru yola geri döndürebiliriz.",
    goBack: isEnglish ? "Go Back" : "Geri Dön",
    home: isEnglish ? "Home" : "Ana Sayfa"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-200/30 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-200/30 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-sky-200/30 blur-[100px]" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <div className="mb-10 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-200 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
            <div className="bg-white p-8 rounded-full shadow-2xl relative border border-slate-100 transform group-hover:scale-105 transition-transform duration-300">
              <FileQuestion className="h-20 w-20 text-blue-600" />
            </div>

            {/* Floating elements */}
            <div className="absolute -top-2 -right-2 bg-indigo-100 p-2 rounded-full animate-bounce delay-100">
              <div className="w-3 h-3 bg-indigo-500 rounded-full" />
            </div>
            <div className="absolute -bottom-1 -left-2 bg-sky-100 p-2 rounded-full animate-bounce delay-300">
              <div className="w-2 h-2 bg-sky-500 rounded-full" />
            </div>
          </div>
        </div>

        <h1 className="text-8xl md:text-9xl font-black text-slate-900 tracking-tighter mb-2 select-none drop-shadow-sm">
          4<span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600">0</span>4
        </h1>

        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
          {dict.heading}
        </h2>

        <p className="text-slate-600 text-lg mb-10 leading-relaxed">
          {dict.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="lg"
            className="min-w-[160px] border-slate-300 hover:bg-slate-100 hover:text-slate-900 transition-all"
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            {dict.goBack}
          </Button>

          <Button
            asChild
            size="lg"
            className="min-w-[160px] bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/40"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              {dict.home}
            </Link>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 text-slate-400 text-sm font-medium">
        &copy; {new Date().getFullYear()} Deniko
      </div>
    </div>
  )
}
