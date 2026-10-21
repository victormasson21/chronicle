import { useEffect, useRef, type JSX } from "react"
import styles from "./quote.module.css"
import type { Snippet } from "./snippet"
import transitions from "./transitions.module.css"
import { useDissolveFallback } from "./use-dissolve-fallback"

type Props = {
  readonly snippet: Snippet
  readonly onExhausted: () => void
}

export function Quote({ snippet, onExhausted }: Props): JSX.Element {
  const scrollerRef = useRef<HTMLElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  useDissolveFallback(scrollerRef, sectionRef)

  useEffect(() => {
    const scroller = scrollerRef.current
    const end = endRef.current
    if (!scroller || !end) {
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          onExhausted()
        }
      },
      { root: scroller, threshold: 1 },
    )
    observer.observe(end)
    return () => observer.disconnect()
  }, [onExhausted])

  return (
    <main ref={scrollerRef} className={`${styles.scroller} ${transitions.appear}`}>
      <section ref={sectionRef} className={`${styles.section} ${transitions.dissolve}`}>
        <div className={styles.mark} aria-hidden="true">
          “
        </div>
        <p className={styles.body}>{snippet.text}</p>
        <div className={styles.chevron} aria-hidden="true" />
      </section>
      <div className={styles.runway} />
      <div ref={endRef} className={styles.end} />
    </main>
  )
}
