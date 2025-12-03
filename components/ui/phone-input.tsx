"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"
import * as RPNInput from "react-phone-number-input"
import flags from "react-phone-number-input/flags"

import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type PhoneInputProps = Omit<
    React.ComponentProps<"input">,
    "onChange" | "value"
> &
    Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
        onChange?: (value: RPNInput.Value) => void
        searchPlaceholder?: string
        noResultsMessage?: string
    }

const PhoneInput = React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
    ({ className, onChange, searchPlaceholder = "Search country...", noResultsMessage = "No country found.", ...props }, ref) => {
        return (
            <RPNInput.default
                ref={ref}
                defaultCountry="TR"
                international={false}
                smartCaret={false}
                className={cn("flex items-center", className)}
                flagComponent={FlagComponent}
                countrySelectComponent={(props) => <CountrySelect {...props} searchPlaceholder={searchPlaceholder} noResultsMessage={noResultsMessage} />}
                inputComponent={InputComponent}
                limitMaxLength={true}
                /**
                 * Handles the onChange event.
                 *
                 * react-phone-number-input might trigger the onChange event as undefined
                 * when a valid phone number is not generated.
                 *
                 * @param value
                 */
                onChange={(value) => onChange?.(value as RPNInput.Value)}
                {...props}
            />
        )
    }
)
PhoneInput.displayName = "PhoneInput"

const InputComponent = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({ className, ...props }, ref) => (
        <Input
            className={cn("rounded-e-lg rounded-s-none flex-shrink-1 ", className)}
            {...props}
            maxLength={13}
            ref={ref}
        />
    )
)
InputComponent.displayName = "InputComponent"

type CountrySelectOption = { label: string; value: RPNInput.Country }

type CountrySelectProps = {
    disabled?: boolean
    value: RPNInput.Country
    onChange: (value: RPNInput.Country) => void
    options: CountrySelectOption[]
    searchPlaceholder?: string
    noResultsMessage?: string
}

const CountrySelect = ({
    disabled,
    value,
    onChange,
    options,
    searchPlaceholder,
    noResultsMessage,
}: CountrySelectProps) => {
    const handleSelect = React.useCallback(
        (country: RPNInput.Country) => {
            onChange(country)
        },
        [onChange]
    )

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant={"outline"}
                    className={cn("flex gap-1 rounded-e-none rounded-s-lg px-3  items-center")}
                    disabled={disabled}
                >
                    <FlagComponent country={value} countryName={value} />
                    <span className="text-muted-foreground/80 text-sm font-normal">
                        {value && `+${RPNInput.getCountryCallingCode(value)}`}
                    </span>
                    <ChevronsUpDown
                        className={cn(
                            "-mr-2 h-4 w-4 opacity-50",
                            disabled ? "hidden" : "opacity-100"
                        )}
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandList>
                        <CommandInput placeholder={searchPlaceholder} />
                        <CommandEmpty>{noResultsMessage}</CommandEmpty>
                        <CommandGroup>
                            {options
                                .filter((x) => x.value)
                                .map((option) => (
                                    <CommandItem
                                        className="gap-2"
                                        key={option.value}
                                        onSelect={() => handleSelect(option.value)}
                                    >
                                        <FlagComponent
                                            country={option.value}
                                            countryName={option.label}
                                        />
                                        <span className="flex-1 text-sm">{option.label}</span>
                                        {option.value && (
                                            <span className="text-foreground/50 text-sm">
                                                {`+${RPNInput.getCountryCallingCode(option.value)}`}
                                            </span>
                                        )}
                                        <Check
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                option.value === value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
    const Flag = flags[country]

    return (
        <span className="h-5 w-5  overflow-hidden rounded-sm [&_svg]:!h-full [&_svg]:!w-full [&_svg]:block">
            {Flag && <Flag title={countryName} />}
        </span>
    )
}
FlagComponent.displayName = "FlagComponent"

export { PhoneInput }
