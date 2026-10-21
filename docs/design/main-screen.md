# Chronicles — main screen style (implement from `chronicles-main-screen.png`)

Implement the main snippet screen of the Chronicles PWA to match the reference image `chronicles-main-screen.png` (rendered at 390×780, 2x). Mobile-first; on wider screens keep the content column max ~640px, centred.

## Fonts (Google Fonts)
- **Newsreader** (400, 500, italic 400): app name, filter button, filter list, bottom bar.
- **Source Serif 4** (400): quote body.
- **Old Standard TT** (400): the large opening quote mark only.

## Colours
- Paper background: `#f3efe6` (page, plus the sticky bars, which must be opaque).
- Ink: `#1b1916` (text, rules, icon badge).
- Accent (oxblood): `oklch(0.45 0.12 25)` (Filter button text, selected-filter marker).
- Muted: `#857e71` (current filter label, date, "Contents" label). Secondary muted: `#6a6458`. Dotted leader: `#b3ab9c`.

## Layout
The page scrolls as a whole. The quote runs as long as it needs to, and both bars stay pinned.

### Top bar (sticky, top: 0)
- Padding 22px 0 14px; horizontal page padding 22px; `border-bottom: 1px solid #1b1916`; baseline-aligned row, `justify-content: space-between`.
- Left: app name "Chronicles", Newsreader italic 24px, ink.
- Right: button `Filter · Recent`. "Filter" is Newsreader 15px in oxblood. "· Recent" is small caps, letter-spacing .06em, muted. Use `white-space: nowrap`. The label reads "Close" while the filter view is open, and the suffix shows the active filter.

### Quote
- Padding 28px 0 32px.
- Opening mark: “ in Old Standard TT 84px, line-height .6, a 40px-tall box, ink.
- Body: Source Serif 4 20px, line-height 1.5, `text-wrap: pretty`, `white-space: pre-line` so paragraph breaks (`\n\n`) in the data render.
- Below the body: a thin chevron, centred, margin-top 36px. It's a 12×12 box with 1px right and bottom borders in ink, rotated 45°. It hints that scrolling brings the next snippet.
- Typical snippet length is ~64 words, but it can reach 200+, so it must handle overflow gracefully.

### Bottom bar (sticky, bottom: 0)
- `border-top: 1px solid #1b1916`; padding 14px 0 24px; row, gap 9px; Newsreader 15px.
- Show each item only if its data exists:
  1. Publication icon: 22px circle, ink background, paper-coloured italic initial (13px). Swap in the real favicon/logo when available.
  2. Publication name: Newsreader italic, underlined (offset 3px), a link to the source with `target="_blank" rel="noopener"`, nowrap.
  3. Date: `· 14 Mar 2026`, normal case (not small caps), muted, nowrap.
  4. Save button (to come in a later iteration): ♡ at 22px, ink, pushed right with `margin-left: auto`.

## Filter view
Tapping Filter replaces the quote and bottom bar (the top bar stays) with a vertically centred column:
- Label "Contents": Newsreader small caps 13px, letter-spacing .1em, muted, margin-bottom 10px.
- Rows (button, padding 12px 0, Newsreader): label at 24px ink, then a flexible dotted leader (`border-bottom: 1px dotted #b3ab9c`, nudged up 5px), then the description in italic 14px `#6a6458`, then ● in oxblood if the row is selected.
  - Recent: past 3 months
  - Past year: past 12 months
  - Older: before last year
  - Favourites: "Coming soon", disabled at 40% opacity until saving ships
- Picking a row sets the filter, closes the view, and shows a random snippet from the filtered pool.

## Transitions
Keep the scroll-to-dissolve and next-snippet transitions in their own isolated, swappable module or CSS classes. Detailed animation specs will follow; don't hard-code them into the layout.
