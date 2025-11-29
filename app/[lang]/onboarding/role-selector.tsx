"use client"

import { selectRole } from "@/app/actions/onboarding"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { GraduationCap, School, Loader2, CheckCircle2 } from "lucide-react"
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
        <div className="grid grid-cols-1 gap-6 w-full max-w-md">
            {/* Teacher Card */}
            <Card
                className={cn(
                    "group relative cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02] hover:border-blue-600 hover:shadow-xl",
                    selected === "TEACHER"
                        ? "border-blue-600 ring-2 ring-blue-600 ring-offset-2 bg-blue-50/50"
                        : "border-slate-200 bg-white",
                    isPending && selected !== "TEACHER" && "opacity-50 pointer-events-none"
                )}
                onClick={() => handleSelect("TEACHER")}
            >
                <CardContent className="flex items-center p-6 gap-6">
                    <div className={cn(
                        "flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl transition-colors",
                        selected === "TEACHER" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                    )}>
                        <School className="h-10 w-10" />
                    </div>

                    <div className="flex flex-col text-left space-y-1">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                            Öğretmenim
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Öğrencilerimi yönetmek, ders programı oluşturmak ve takip etmek istiyorum.
                        </p>
                    </div>

                    {/* Selection Indicator */}
                    <div className={cn(
                        "absolute top-6 right-6 opacity-0 transition-all duration-300 transform translate-x-2",
                        selected === "TEACHER" && "opacity-100 translate-x-0",
                        "group-hover:opacity-100 group-hover:translate-x-0"
                    )}>
                        {isPending && selected === "TEACHER" ? (
                            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                        ) : (
                            <CheckCircle2 className={cn(
                                "h-6 w-6",
                                selected === "TEACHER" ? "text-blue-600" : "text-slate-300 group-hover:text-blue-400"
                            )} />
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Student Card */}
            <Card
                className={cn(
                    "group relative cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02] hover:border-indigo-600 hover:shadow-xl",
                    selected === "STUDENT"
                        ? "border-indigo-600 ring-2 ring-indigo-600 ring-offset-2 bg-indigo-50/50"
                        : "border-slate-200 bg-white",
                    isPending && selected !== "STUDENT" && "opacity-50 pointer-events-none"
                )}
                onClick={() => handleSelect("STUDENT")}
            >
                <CardContent className="flex items-center p-6 gap-6">
                    <div className={cn(
                        "flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl transition-colors",
                        selected === "STUDENT" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                    )}>
                        <GraduationCap className="h-10 w-10" />
                    </div>

                    <div className="flex flex-col text-left space-y-1">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                            Öğrenciyim
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Derslerimi görmek, ödevlerimi takip etmek ve sınav sonuçlarımı incelemek istiyorum.
                        </p>
                    </div>

                    {/* Selection Indicator */}
                    <div className={cn(
                        "absolute top-6 right-6 opacity-0 transition-all duration-300 transform translate-x-2",
                        selected === "STUDENT" && "opacity-100 translate-x-0",
                        "group-hover:opacity-100 group-hover:translate-x-0"
                    )}>
                        {isPending && selected === "STUDENT" ? (
                            <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
                        ) : (
                            <CheckCircle2 className={cn(
                                "h-6 w-6",
                                selected === "STUDENT" ? "text-indigo-600" : "text-slate-300 group-hover:text-indigo-400"
                            )} />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
