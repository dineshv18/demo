"use client"

import * as React from "react"
import { format } from "date-fns"
import { IconCalendar } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  fromYear?: number
  toYear?: number
  maxDate?: Date
  minDate?: Date
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
  fromYear = 1950,
  toYear = new Date().getFullYear(),
  maxDate,
  minDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground/50",
            className
          )}
        >
          <IconCalendar className="mr-2 h-4 w-4 shrink-0 opacity-60" />
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange?.(date)
            setOpen(false)
          }}
          disabled={[
            ...(maxDate ? [{ after: maxDate }] : []),
            ...(minDate ? [{ before: minDate }] : []),
          ]}
          startMonth={new Date(fromYear, 0)}
          endMonth={new Date(toYear, 11)}
          defaultMonth={value ?? new Date(toYear - 18, 0)}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
