import data from "../data/snippets.json"

export type Snippet = {
  readonly id: string
  readonly title: string
  readonly type: string
  readonly year: string | null
  readonly publication: string | null
  readonly source: string | null
  readonly date: string | null
  readonly tags: readonly string[]
  readonly text: string
}

export const SNIPPETS: readonly Snippet[] = data.snippets

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}
