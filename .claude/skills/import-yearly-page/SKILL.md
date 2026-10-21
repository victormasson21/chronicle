---
name: import-yearly-page
description: Add the clippings from a yearly Notion "Articles" page that are missing from the Clippings database, then refresh data/snippets.json. Use when the user says "import from the yearly page", "import the new articles", "add this year's clippings to the DB", or "the latest quote is missing".
---

# Import clippings from a yearly page

Each year has a Notion page **Articles** under the "<year> 🪐" page, where clippings are pasted one below another. The **Clippings** database (data source `3a3e119e-f189-4c5a-8509-f622ea1ca0df`) is the source of truth for the app, so new entries on the page must become rows there. Reading the page and creating rows go through the Notion connector (the integration token used by the exporter only sees the database).

## Steps

1. Find the page: `notion-search` for `Articles`, pick the hit whose path is "<year> 🪐", or use the URL the user gave. Fetch it with `notion-fetch`; a long page is saved to a file whose path the result names.
2. List what is missing:
   ```sh
   node scripts/diff-yearly-page.mjs <saved-fetch-file>
   ```
   Entries are split on `---` rules and on an em-dash starting a line inside an entry (the page uses both). The match is fuzzy, so for each reported miss grep a distinctive phrase against `data/snippets.json`; a hit means the row exists with edited text, so skip it. Entries that are only an image or a bookmark are skipped.
3. Show the user the candidates as `title · type · words` and wait for a yes before creating anything.
4. Create the rows with `notion-create-pages`, parent `data_source_id` above, one page per clipping:
   - `Clipping`: a short label in the style of the existing titles (a hook from the text, under 70 characters).
   - `Type`: `Excerpt` for an article passage, `Quote` for a one-liner, `Note` for the user's own or AI-generated notes (a "(from Google Gemini)" line marks one).
   - `Year`: the page's year. Add the select option in Notion first if it does not exist yet, or the write fails.
   - `Tags`: one or two from the fixed list in the schema.
   - `Publication`, `Source`, `date:Added:start`: only from what the entry states, such as a link to the article (Guardian and NYT URLs carry the date in the path) or a named outlet in the text. Never guess a publication from style.
   - `content`: the entry's paragraphs as Markdown, `<br />` runs turned into paragraph breaks, bold kept, repeated paragraphs dropped once.
5. Run the `update-from-notion` skill to refresh `data/snippets.json`, then report: rows created, rows skipped as already present, and which new rows have no publication, source or date.

## Don'ts

- Don't create a row for an entry the grep confirms is present, even when the diff script lists it.
- Don't edit the yearly page; it stays as the user pasted it.
- Don't write `Last surfaced` or `Times surfaced`.
