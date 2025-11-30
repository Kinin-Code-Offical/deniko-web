"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DenikoLogo } from "@/components/ui/deniko-logo"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useState } from "react"

interface NavbarProps {
    lang: string
    dictionary: any
}

export function Navbar({ lang, dictionary }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href={`/${lang}`} className="flex items-center gap-2">
                    <div className="bg-[#2062A3] p-1.5 rounded-lg">
                        <DenikoLogo className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-[#2062A3]">Deniko</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-4">
                    <LanguageSwitcher />
                    <div className="flex gap-2">
                        <Button variant="ghost" asChild className="h-10">
                            <Link href={`/${lang}/login`}>{dictionary.home.login}</Link>
                        </Button>
                        <Button className="bg-[#2062A3] hover:bg-[#1a4f83] h-10" asChild>
                            <Link href={`/${lang}/register`}>{dictionary.home.get_started}</Link>
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden flex items-center gap-2">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <div className="flex flex-col gap-6 py-6">
                                <div className="flex items-center gap-2">
                                    <div className="bg-[#2062A3] p-1.5 rounded-lg">
                                        <DenikoLogo className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="text-xl font-bold text-[#2062A3]">Deniko</span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button variant="outline" className="w-full justify-start h-12 text-base" asChild onClick={() => setIsOpen(false)}>
                                        <Link href={`/${lang}/login`}>{dictionary.home.login}</Link>
                                    </Button>
                                    <Button className="w-full justify-start bg-[#2062A3] hover:bg-[#1a4f83] h-12 text-base" asChild onClick={() => setIsOpen(false)}>
                                        <Link href={`/${lang}/register`}>{dictionary.home.get_started}</Link>
                                    </Button>
                                </div>

                                <div className="border-t pt-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Language</span>
                                        <LanguageSwitcher />
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
