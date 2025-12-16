import { format } from "date-fns"

export function dateToMmdd(date: Date) {
  return format(date, "MM-dd")
}

export function isValidMmdd(value: string) {
  return /^\d{2}-\d{2}$/.test(value)
}
