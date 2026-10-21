import type { JSX } from "react"
import styles from "./quote.module.css"
import type { Snippet } from "./snippet"

type Props = {
  readonly snippet: Snippet
}

export function Quote({ snippet }: Props): JSX.Element {
  return (
    <main className={styles.scroller}>
      <section className={styles.section}>
        <div className={styles.mark} aria-hidden="true">
          “
        </div>
        <p className={styles.body}>{snippet.text}</p>
        <div className={styles.chevron} aria-hidden="true" />
      </section>
    </main>
  )
}
