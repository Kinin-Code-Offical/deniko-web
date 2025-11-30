"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

const countries = [
    { label: "Turkey", value: "TR", code: "+90", flag: "🇹🇷" },
    { label: "United States", value: "US", code: "+1", flag: "🇺🇸" },
    { label: "United Kingdom", value: "GB", code: "+44", flag: "🇬🇧" },
    { label: "Germany", value: "DE", code: "+49", flag: "🇩🇪" },
    { label: "France", value: "FR", code: "+33", flag: "🇫🇷" },
    { label: "Netherlands", value: "NL", code: "+31", flag: "🇳🇱" },
    { label: "Azerbaijan", value: "AZ", code: "+994", flag: "🇦🇿" },
    { label: "Cyprus", value: "CY", code: "+357", flag: "🇨🇾" },
    { label: "Italy", value: "IT", code: "+39", flag: "🇮🇹" },
    { label: "Spain", value: "ES", code: "+34", flag: "🇪🇸" },
    { label: "Russia", value: "RU", code: "+7", flag: "🇷🇺" },
    { label: "Ukraine", value: "UA", code: "+380", flag: "🇺🇦" },
]

interface PhoneInputProps {
    value?: string
    onChange?: (value: string) => void
    className?: string
}

export function PhoneInput({ value = "", onChange, className }: PhoneInputProps) {
    const [open, setOpen] = React.useState(false)
    const [countryCode, setCountryCode] = React.useState("+90")
    const [phoneNumber, setPhoneNumber] = React.useState("")
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    // Parse initial value if provided
    React.useEffect(() => {
        if (value) {
            // Simple heuristic: if starts with +, try to find matching code
            const country = countries.find((c) => value.startsWith(c.code))
            if (country) {
                setCountryCode(country.code)
                setPhoneNumber(value.slice(country.code.length))
            } else {
                setPhoneNumber(value)
            }
        }
    }, [value])

    const handleCountrySelect = (currentValue: string) => {
        const country = countries.find((c) => c.value === currentValue)
        if (country) {
            setCountryCode(country.code)
            if (onChange) {
                onChange(`${country.code}${phoneNumber}`)
            }
        }
        setOpen(false)
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value.replace(/\D/g, "") // Only allow numbers
        setPhoneNumber(newValue)
        if (onChange) {
            onChange(`${countryCode}${newValue}`)
        }
    }

    const selectedCountry = countries.find(c => c.code === countryCode)

    if (!mounted) {
        return (
            <div className={cn("flex items-center w-full rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className)}>
                <Button
                    variant="ghost"
                    role="combobox"
                    className="h-full rounded-l-md rounded-r-none border-r border-input/50 px-2 gap-1 hover:bg-transparent"
                >
                    <span className="text-lg leading-none">{selectedCountry?.flag}</span>
                    <span className="text-sm font-medium">{countryCode}</span>
                    <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
                </Button>
                <Input
                    type="tel"
                    placeholder="5XX XXX XX XX"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className="h-full flex-1 rounded-l-none rounded-r-md border-0 shadow-none focus-visible:ring-0"
                />
            </div>
        )
    }

    return (
        <div className={cn("flex items-center w-full rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        role="combobox"
                        aria-expanded={open}
                        className="h-full rounded-l-md rounded-r-none border-r border-input/50 px-2 gap-1 hover:bg-transparent"
                    >
                        <span className="text-lg leading-none">{selectedCountry?.flag}</span>
                        <span className="text-sm font-medium">{countryCode}</span>
                        <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Ülke ara..." />
                        <CommandList>
                            <CommandEmpty>Ülke bulunamadı.</CommandEmpty>
                            <CommandGroup>
                                {countries.map((country) => (
                                    <CommandItem
                                        key={country.value}
                                        value={`${country.label} ${country.code}`}
                                        onSelect={() => {
                                            handleCountrySelect(country.value)
                                            setOpen(false)
                                        }}
                                        className="gap-2 cursor-pointer"
                                    >
                                        <Check
                                            className={cn(
                                                "h-4 w-4 shrink-0",
                                                countryCode === country.code ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className="text-lg leading-none">{country.flag}</span>
                                        <span className="flex-1 truncate">
                                            {country.label} <span className="text-muted-foreground">({country.code})</span>
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <Input
                type="tel"
                placeholder="5XX XXX XX XX"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="h-full flex-1 rounded-l-none rounded-r-md border-0 shadow-none focus-visible:ring-0"
            />
        </div>
    )
}
