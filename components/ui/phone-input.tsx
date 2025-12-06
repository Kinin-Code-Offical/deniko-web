"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import RPNInput, {
  getCountryCallingCode,
  type Country,
  type Value,
} from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value"
> &
  Omit<React.ComponentProps<typeof RPNInput>, "onChange"> & {
    onChange?: (value: Value) => void;
    searchPlaceholder?: string;
    noResultsMessage?: string;
  };

const PhoneInput = React.forwardRef<
  React.ElementRef<typeof RPNInput>,
  PhoneInputProps
>(
  (
    {
      className,
      onChange,
      searchPlaceholder = "Search country...",
      noResultsMessage = "No country found.",
      ...props
    },
    ref
  ) => {
    return (
      <RPNInput
        ref={ref}
        defaultCountry="TR"
        className={cn("flex items-center", className)}
        flagComponent={FlagComponent}
        countrySelectComponent={(props) => (
          <CountrySelect
            {...props}
            searchPlaceholder={searchPlaceholder}
            noResultsMessage={noResultsMessage}
          />
        )}
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
        smartCaret={false}
        onChange={(value) => onChange?.(value || ("" as Value))}
        {...props}
        international={false}
      />
    );
  }
);
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, value, ...props }, ref) => {
  const stringValue = value ? String(value) : "";
  // Remove leading zero if present (requested behavior for TR numbers)
  const displayValue = stringValue.startsWith("0")
    ? stringValue.substring(1)
    : stringValue;

  return (
    <Input
      className={cn("flex-shrink-1 rounded-s-none rounded-e-lg", className)}
      {...props}
      value={displayValue}
      maxLength={13}
      ref={ref}
    />
  );
});
InputComponent.displayName = "InputComponent";

type CountrySelectOption = { label: string; value: Country };

type CountrySelectProps = {
  disabled?: boolean;
  value: Country;
  onChange: (value: Country) => void;
  options: CountrySelectOption[];
  searchPlaceholder?: string;
  noResultsMessage?: string;
};

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
  searchPlaceholder,
  noResultsMessage,
}: CountrySelectProps) => {
  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  const handleSelect = React.useCallback(
    (country: Country) => {
      onChange(country);
    },
    [onChange]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={"outline"}
          className={cn(
            "flex items-center gap-1 rounded-s-lg rounded-e-none px-3"
          )}
          disabled={disabled}
          aria-label={`Select country code. Current ${
            selectedOption?.label || value
          } (+${getCountryCallingCode(value)})`}
        >
          <FlagComponent country={value} countryName={value} />
          <span className="text-foreground text-sm font-medium">
            {value && `+${getCountryCallingCode(value)}`}
          </span>
          <ChevronsUpDown
            className={cn(
              "-mr-2 h-4 w-4 opacity-50",
              disabled ? "hidden" : "opacity-100"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" aria-label="Country selector">
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
                        {`+${getCountryCallingCode(option.value)}`}
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
  );
};

const FlagComponent = ({
  country,
  countryName,
}: {
  country: Country;
  countryName: string;
}) => {
  const Flag = flags[country];

  return (
    <span className="h-5 w-5 overflow-hidden rounded-sm [&_svg]:block [&_svg]:!h-full [&_svg]:!w-full">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};
FlagComponent.displayName = "FlagComponent";

export { PhoneInput };
