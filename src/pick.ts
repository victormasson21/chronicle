import type { Snippet } from "./snippet"
import type { Entry, Store } from "./storage"

const SEEN_WINDOW_MS = 7 * 24 * 60 * 60 * 1000
const SEEN_VIEWS = 30

export function excludedIds(seen: readonly Entry<number>[], now: number): ReadonlySet<string> {
  const withinWindow = seen.filter(([, seenAt]) => now - seenAt < SEEN_WINDOW_MS)
  const latestViews = [...seen].sort(([, a], [, b]) => b - a).slice(0, SEEN_VIEWS)
  return new Set([...withinWindow, ...latestViews].map(([id]) => id))
}

export function pickRandom(pool: readonly Snippet[], random: () => number): Snippet | undefined {
  return pool[Math.floor(random() * pool.length)]
}

export async function nextSnippet(
  pool: readonly Snippet[],
  seen: Store<number>,
  now: number,
  random: () => number,
): Promise<Snippet | undefined> {
  if (pool.length === 0) {
    return undefined
  }
  const excluded = excludedIds(await seen.list(), now)
  const unseen = pool.filter((snippet) => !excluded.has(snippet.id))
  if (unseen.length === 0) {
    await Promise.all(pool.map((snippet) => seen.remove(snippet.id)))
  }
  const picked = pickRandom(unseen.length === 0 ? pool : unseen, random)
  if (picked) {
    await seen.set(picked.id, now)
  }
  return picked
}
