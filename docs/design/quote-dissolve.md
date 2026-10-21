# Coding Agent Prompt: Implement Scroll-Driven CSS Text Dissolve Effect

**Task:** Integrate and optimize the following CSS scroll-driven text dissolve animation into the stylesheet, ensuring maximum performance, proper setup of scroll/view timelines, and robust fallback support.

---

### Target CSS Keyframes & Class

```css
@keyframes text-dissolve {
  0% {
    filter: blur(0px);
    letter-spacing: 0px;
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
  100% {
    filter: blur(26px);
    letter-spacing: 12px;
    opacity: 0;
    transform: translate3d(0, 200px, 0) scale(1.05);
  }
}

.dissolve-text {
  will-change: filter, opacity, transform;
  animation: text-dissolve linear forwards;
  animation-timeline: view(); /* Or scroll(), depending on sticky/viewport container behavior */
  animation-range: exit 0% exit 100%;
}
```

---

### Core Technical Requirements

1. **Timeline & Container Setup:**
   * Configure the target element (`.dissolve-text`) and its parent container so that `animation-timeline` (using `view()` or `scroll()`) correctly maps the 0% to 100% keyframe progress over the user's scroll interaction.
   * If using `animation-range: exit 0% exit 100%`, attach `view-timeline-name` to the element or parent container so the browser accurately tracks when the element exits the viewport.

2. **Performance Optimization:**
   * Ensure standard GPU acceleration (`translate3d` and `will-change: filter, opacity, transform`) is enabled to avoid layout thrashing during hardware-accelerated blur processing.
   * Add `backface-visibility: hidden;` and `contain: paint;` (or `contain: layout paint;`) if necessary to keep blur rendering fast and smooth across mobile and desktop devices.

3. **CSS Fallback (`@supports` rule):**
   * Wrap the scroll-timeline property inside a feature query (`@supports (animation-timeline: scroll())` or `@supports (animation-timeline: view())`).
   * Provide a CSS fallback (such as a standard transition triggered via a simple `.is-scrolled` or observer class, or sticky fade) for browsers that do not support modern CSS Scroll-Driven Animations.