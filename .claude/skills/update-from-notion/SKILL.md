---
name: update-from-notion
description: Refresh data/snippets.json from the Notion Clippings database. Use when the user says "update snippets", "pull new clippings", "sync from Notion", or after they've added rows to the Clippings DB.
---

# Update snippets from Notion

The Notion **Clippings** database (data source `3a3e119e-f189-4c5a-8509-f622ea1ca0df`) is the source of truth. `data/snippets.json` is a build artefact of it.

## Steps

1. Check `NOTION_TOKEN` is set (`echo ${NOTION_TOKEN:+set}`). If not, ask the user for it; never commit it. A `.env` file at the repo root is gitignored, so `export $(cat .env)` is fine.
2. Run the exporter. Incremental by default (only fetches bodies for rows not already in the JSON):
   ```sh
   node scripts/export-notion.mjs
   ```
   Use `--full` if the user has edited existing rows' text in Notion, or if asked to rebuild.
3. Report the delta: new snippet count, how many bodies were fetched, how many were dropped as empty or duplicate. Name any new rows that have no `publication`, `source` or `date` so the user can fill them in.
4. `git diff --stat data/snippets.json`, then commit as `data: sync from Notion (+N)` if the user wants it committed.

## Don'ts

- Don't edit `snippets.json` by hand; fix the Notion row and re-run.
- Don't write back to Notion (`Last surfaced`, `Times surfaced`); seen-state lives on-device in the app.
