import { useState, type JSX } from "react"
import styles from "./app.module.css"
import { BottomBar } from "./bottom-bar"
import { FilterView } from "./filter-view"
import { DEFAULT_FILTER, filterLabel, matchesFilter, type Filter } from "./filters"
import { pickRandom } from "./pick"
import { Quote } from "./quote"
import { SNIPPETS, type Snippet } from "./snippet"

function randomSnippet(filter: Filter): Snippet | undefined {
  const now = Date.now()
  return pickRandom(
    SNIPPETS.filter((candidate) => matchesFilter(candidate, filter, now)),
    Math.random,
  )
}

export function App(): JSX.Element {
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER)
  const [filterOpen, setFilterOpen] = useState(false)
  const [snippet, setSnippet] = useState(() => randomSnippet(DEFAULT_FILTER))

  function pickFilter(picked: Filter): void {
    setFilter(picked)
    setSnippet(randomSnippet(picked))
    setFilterOpen(false)
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Chronicles</h1>
        <button
          type="button"
          className={styles.filterButton}
          aria-expanded={filterOpen}
          onClick={() => setFilterOpen((open) => !open)}
        >
          {filterOpen ? "Close" : "Filter"}
          <span className={styles.filterSuffix}> · {filterLabel(filter)}</span>
        </button>
      </header>
      {filterOpen ? (
        <FilterView selected={filter} onPick={pickFilter} />
      ) : snippet ? (
        <>
          <Quote snippet={snippet} />
          <BottomBar snippet={snippet} />
        </>
      ) : (
        <p className={styles.empty}>Nothing here yet.</p>
      )}
    </div>
  )
}
