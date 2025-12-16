"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { dateToMmdd } from "@/lib/date"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type MmddPickerProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function MmddPicker({
  value,
  onChange,
  placeholder = "MM-DD",
  className,
  disabled,
}: MmddPickerProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode="numeric"
        disabled={disabled}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            aria-label="选择日期"
          >
            <CalendarIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={undefined}
            onSelect={(d) => {
              if (!d) return
              onChange(dateToMmdd(d))
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
