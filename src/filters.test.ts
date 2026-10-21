import { describe, expect, it } from "vitest"
import { matchesFilter, type Filter } from "./filters"
import type { Snippet } from "./snippet"

const now = Date.UTC(2026, 9, 21)

const snippetDated = (date: string | null): Snippet => ({
  id: date ?? "undated",
  title: "t",
  type: "Excerpt",
  year: null,
  publication: null,
  source: null,
  date,
  tags: [],
  text: "body",
})

describe("matchesFilter", () => {
  it.each<[string | null, readonly Filter[]]>([
    ["2026-10-20", ["recent", "past-year"]],
    ["2026-07-21", ["recent", "past-year"]],
    ["2026-07-20", ["past-year"]],
    ["2025-10-21", ["past-year"]],
    ["2025-10-20", ["older"]],
    [null, ["older"]],
  ])("%s matches %j", (date, expected) => {
    const filters: readonly Filter[] = ["recent", "past-year", "older"]
    expect(filters.filter((filter) => matchesFilter(snippetDated(date), filter, now))).toEqual(expected)
  })
})
