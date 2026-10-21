import type { Snippet } from "./snippet"

export function pickRandom(pool: readonly Snippet[], random: () => number): Snippet | undefined {
  return pool[Math.floor(random() * pool.length)]
}
