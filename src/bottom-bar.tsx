import type { JSX } from "react"
import styles from "./bottom-bar.module.css"
import { PublicationIcon } from "./publication-icon"
import { formatDate, type Snippet } from "./snippet"

type Props = {
  readonly snippet: Snippet
}

export function BottomBar({ snippet }: Props): JSX.Element {
  const { publication, source, date } = snippet
  return (
    <footer className={styles.bar}>
      {publication && <PublicationIcon key={snippet.id} publication={publication} source={source} />}
      {publication &&
        (source ? (
          <a className={styles.link} href={source} target="_blank" rel="noopener">
            {publication}
          </a>
        ) : (
          <span className={styles.name}>{publication}</span>
        ))}
      {date && <span className={styles.date}>· {formatDate(date)}</span>}
      <button type="button" className={styles.save} aria-label="Save" disabled>
        ♡
      </button>
    </footer>
  )
}
