import { useState, type JSX } from "react"
import styles from "./app.module.css"
import { BottomBar } from "./bottom-bar"
import { pickRandom } from "./pick"
import { Quote } from "./quote"
import { SNIPPETS } from "./snippet"

export function App(): JSX.Element {
  const [snippet] = useState(() => pickRandom(SNIPPETS, Math.random))

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Chronicles</h1>
        <button type="button" className={styles.filterButton}>
          Filter<span className={styles.filterSuffix}> · Recent</span>
        </button>
      </header>
      {snippet ? (
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
