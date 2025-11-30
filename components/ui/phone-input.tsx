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
    { label: "Turkey", value: "TR", code: "+90" },
    { label: "United States", value: "US", code: "+1" },
    { label: "United Kingdom", value: "GB", code: "+44" },
    { label: "Germany", value: "DE", code: "+49" },
    { label: "France", value: "FR", code: "+33" },
    { label: "Netherlands", value: "NL", code: "+31" },
    { label: "Azerbaijan", value: "AZ", code: "+994" },
    // Add more as needed
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

    if (!mounted) {
        return (
            <div className={cn("flex gap-2", className)}>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-[100px] justify-between px-3"
                >
                    {countryCode}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
                <Input
                    type="tel"
                    placeholder="5XX XXX XX XX"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className="flex-1"
                />
            </div>
        )
    }

    return (
        <div className={cn("flex gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[100px] justify-between px-3"
                    >
                        {countryCode}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandInput placeholder="Ülke ara..." />
                        <CommandList>
                            <CommandEmpty>Ülke bulunamadı.</CommandEmpty>
                            <CommandGroup>
                                {countries.map((country) => (
                                    <CommandItem
                                        key={country.value}
                                        value={country.value}
                                        onSelect={handleCountrySelect}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                countryCode === country.code ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {country.label} ({country.code})
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
                className="flex-1"
            />
        </div>
    )
}
