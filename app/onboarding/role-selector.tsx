"use client"

import { selectRole } from "@/app/actions/onboarding"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { GraduationCap, School, Loader2 } from "lucide-react"
import { useState, useTransition } from "react"

export function RoleSelector() {
    const [isPending, startTransition] = useTransition()
    const [selected, setSelected] = useState<"TEACHER" | "STUDENT" | null>(null)

    const handleSelect = (role: "TEACHER" | "STUDENT") => {
        setSelected(role)
        startTransition(async () => {
            await selectRole(role)
        })
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
            <Card
                className={cn(
                    "cursor-pointer transition-all hover:border-blue-500 hover:shadow-md group relative overflow-hidden",
                    selected === "TEACHER" && "ring-2 ring-blue-600 border-blue-600",
                    isPending && selected !== "TEACHER" && "opacity-50 pointer-events-none"
                )}
                onClick={() => handleSelect("TEACHER")}
            >
                <CardContent className="flex flex-col items-center justify-center p-10 text-center space-y-4">
                    <div className="p-4 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                        <School className="w-12 h-12 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-slate-900">Öğretmenim</h3>
                        <p className="text-slate-500">
                            Öğrencilerimi yönetmek ve ders takibi yapmak istiyorum.
                        </p>
                    </div>
                    {isPending && selected === "TEACHER" && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card
                className={cn(
                    "cursor-pointer transition-all hover:border-blue-500 hover:shadow-md group relative overflow-hidden",
                    selected === "STUDENT" && "ring-2 ring-blue-600 border-blue-600",
                    isPending && selected !== "STUDENT" && "opacity-50 pointer-events-none"
                )}
                onClick={() => handleSelect("STUDENT")}
            >
                <CardContent className="flex flex-col items-center justify-center p-10 text-center space-y-4">
                    <div className="p-4 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
                        <GraduationCap className="w-12 h-12 text-green-600" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-slate-900">Öğrenciyim</h3>
                        <p className="text-slate-500">
                            Ders programımı ve ilerlememi takip etmek istiyorum.
                        </p>
                    </div>
                    {isPending && selected === "STUDENT" && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
