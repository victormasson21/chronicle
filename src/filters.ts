import type { Snippet } from "./snippet"

export type Filter = "recent" | "past-year" | "older"

export type FilterOption = {
  readonly id: Filter
  readonly label: string
  readonly description: string
}

export const FILTERS: readonly FilterOption[] = [
  { id: "recent", label: "Recent", description: "past 3 months" },
  { id: "past-year", label: "Past year", description: "past 12 months" },
  { id: "older", label: "Older", description: "before last year" },
]

export const DEFAULT_FILTER: Filter = "recent"

const RECENT_MONTHS = 3
const PAST_YEAR_MONTHS = 12

function isoDateMonthsBefore(now: number, months: number): string {
  const date = new Date(now)
  date.setUTCMonth(date.getUTCMonth() - months)
  return date.toISOString().slice(0, 10)
}

export function matchesFilter(snippet: Snippet, filter: Filter, now: number): boolean {
  const { date } = snippet
  switch (filter) {
    case "recent":
      return date !== null && date >= isoDateMonthsBefore(now, RECENT_MONTHS)
    case "past-year":
      return date !== null && date >= isoDateMonthsBefore(now, PAST_YEAR_MONTHS)
    case "older":
      return date === null || date < isoDateMonthsBefore(now, PAST_YEAR_MONTHS)
  }
}

export function filterLabel(filter: Filter): string {
  return FILTERS.find((option) => option.id === filter)?.label ?? filter
}
