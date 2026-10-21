import { useEffect, type RefObject } from "react"

const SUPPORTS_VIEW_TIMELINE = typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()")

export function useDissolveFallback(
  scrollerRef: RefObject<HTMLElement | null>,
  targetRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    const scroller = scrollerRef.current
    const target = targetRef.current
    if (SUPPORTS_VIEW_TIMELINE || !scroller || !target) {
      return
    }
    const update = (): void => {
      const targetBottom = target.offsetTop + target.offsetHeight - scroller.scrollTop
      const progress = (scroller.clientHeight - targetBottom) / scroller.clientHeight
      target.style.setProperty("--dissolve-progress", String(Math.min(Math.max(progress, 0), 1)))
    }
    update()
    scroller.addEventListener("scroll", update, { passive: true })
    return () => scroller.removeEventListener("scroll", update)
  }, [scrollerRef, targetRef])
}
