import type { JSX } from "react"
import styles from "./filter-view.module.css"
import { FILTERS, type Filter } from "./filters"

type Props = {
  readonly selected: Filter
  readonly onPick: (filter: Filter) => void
}

export function FilterView({ selected, onPick }: Props): JSX.Element {
  return (
    <nav className={styles.view} aria-label="Contents">
      <p className={styles.label}>Contents</p>
      {FILTERS.map((option) => (
        <button
          key={option.id}
          type="button"
          className={styles.row}
          aria-pressed={option.id === selected}
          onClick={() => onPick(option.id)}
        >
          <span className={styles.name}>{option.label}</span>
          <span className={styles.leader} />
          <span className={styles.description}>{option.description}</span>
          {option.id === selected && <span className={styles.marker}>●</span>}
        </button>
      ))}
      <button type="button" className={styles.row} disabled>
        <span className={styles.name}>Favourites</span>
        <span className={styles.leader} />
        <span className={styles.description}>Coming soon</span>
      </button>
    </nav>
  )
}
