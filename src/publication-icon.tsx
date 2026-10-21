import { useState, type JSX } from "react"
import styles from "./publication-icon.module.css"

type Props = {
  readonly publication: string
  readonly source: string | null
}

export function PublicationIcon({ publication, source }: Props): JSX.Element {
  const [faviconFailed, setFaviconFailed] = useState(false)
  const origin = source === null ? null : URL.parse(source)?.origin
  const favicon = origin && !faviconFailed ? `${origin}/favicon.ico` : null

  return (
    <span className={styles.icon} aria-hidden="true">
      {favicon ? <img src={favicon} alt="" onError={() => setFaviconFailed(true)} /> : publication.charAt(0)}
    </span>
  )
}
