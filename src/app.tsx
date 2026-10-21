import { useCallback, useEffect, useState, type JSX } from "react"
import styles from "./app.module.css"
import { BottomBar } from "./bottom-bar"
import { FilterView } from "./filter-view"
import { DEFAULT_FILTER, filterLabel, matchesFilter, type Filter } from "./filters"
import { nextSnippet } from "./pick"
import { Quote } from "./quote"
import { SNIPPETS, type Snippet } from "./snippet"
import { localStore } from "./storage"

const seenStore = localStore<number>("seen")

type View = {
  readonly snippet: Snippet | undefined
  readonly sequence: number
}

export function App(): JSX.Element {
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER)
  const [filterOpen, setFilterOpen] = useState(false)
  const [view, setView] = useState<View>({ snippet: undefined, sequence: 0 })

  const showNext = useCallback((): void => {
    const now = Date.now()
    const pool = SNIPPETS.filter((candidate) => matchesFilter(candidate, filter, now))
    void nextSnippet(pool, seenStore, now, Math.random).then((snippet) =>
      setView((current) => ({ snippet, sequence: current.sequence + 1 })),
    )
  }, [filter])

  useEffect(showNext, [showNext])

  function pickFilter(picked: Filter): void {
    setFilter(picked)
    setFilterOpen(false)
  }

  const { snippet, sequence } = view

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
          <Quote key={sequence} snippet={snippet} />
          <BottomBar snippet={snippet} />
        </>
      ) : (
        <p className={styles.empty}>Nothing here yet.</p>
      )}
    </div>
  )
}
