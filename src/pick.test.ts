import { describe, expect, it } from "vitest"
import { pickRandom } from "./pick"
import type { Snippet } from "./snippet"

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
