import { describe, expect, it } from "vitest"
import { excludedIds, nextSnippet, pickRandom } from "./pick"
import type { Snippet } from "./snippet"
import type { Entry, Store } from "./storage"

const DAY = 86_400_000
const now = Date.UTC(2026, 9, 21)

const snippet = (id: string): Snippet => ({
  id,
  title: id,
  type: "Excerpt",
  year: null,
  publication: null,
  source: null,
  date: null,
  tags: [],
  text: id,
})

function memoryStore<T>(initial: readonly Entry<T>[] = []): Store<T> & { readonly entries: Map<string, T> } {
  const entries = new Map(initial)
  return {
    entries,
    get: async (id) => entries.get(id),
    set: async (id, value) => {
      entries.set(id, value)
    },
    remove: async (id) => {
      entries.delete(id)
    },
    list: async () => [...entries],
  }
}

describe("excludedIds", () => {
  it("frees a view older than 7 days once 30 newer views exist", () => {
    const newer: Entry<number>[] = Array.from({ length: 30 }, (_, i) => [`s${i}`, now - i * DAY / 10])
    const excluded = excludedIds([...newer, ["old", now - 8 * DAY]], now)
    expect(excluded.size).toBe(30)
    expect(excluded.has("old")).toBe(false)
  })

  it("excludes the last 30 views even when older than 7 days", () => {
    const seen: Entry<number>[] = Array.from({ length: 35 }, (_, i) => [`s${i}`, now - (10 + i) * DAY])
    const excluded = excludedIds(seen, now)
    expect(excluded.size).toBe(30)
    expect(excluded.has("s0")).toBe(true)
    expect(excluded.has("s29")).toBe(true)
    expect(excluded.has("s30")).toBe(false)
  })

  it("takes whichever rule excludes more", () => {
    const seen: Entry<number>[] = Array.from({ length: 40 }, (_, i) => [`s${i}`, now - i * 1000])
    expect(excludedIds(seen, now).size).toBe(40)
  })
})

describe("pickRandom", () => {
  it("maps the random number onto the pool", () => {
    const pool = [snippet("a"), snippet("b"), snippet("c")]
    expect(pickRandom(pool, () => 0)).toBe(pool[0])
    expect(pickRandom(pool, () => 0.99)).toBe(pool[2])
  })

  it("is absent for an empty pool", () => {
    expect(pickRandom([], () => 0)).toBeUndefined()
  })
})

describe("nextSnippet", () => {
  it("skips seen snippets and records the pick", async () => {
    const seen = memoryStore<number>([["a", now - DAY]])
    const picked = await nextSnippet([snippet("a"), snippet("b")], seen, now, () => 0)
    expect(picked?.id).toBe("b")
    expect(seen.entries.get("b")).toBe(now)
  })

  it("clears the seen-list for the pool once exhausted and picks again", async () => {
    const seen = memoryStore<number>([
      ["a", now - DAY],
      ["b", now - DAY],
      ["other", now - DAY],
    ])
    const picked = await nextSnippet([snippet("a"), snippet("b")], seen, now, () => 0.5)
    expect(picked?.id).toBe("b")
    expect([...seen.entries.keys()]).toEqual(["other", "b"])
  })

  it("is absent for an empty pool", async () => {
    expect(await nextSnippet([], memoryStore(), now, () => 0)).toBeUndefined()
  })
})
