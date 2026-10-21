#!/usr/bin/env node
/**
 * Export the Notion "Clippings" database to data/snippets.json.
 *
 * Usage:
 *   NOTION_TOKEN=secret_xxx node scripts/export-notion.mjs          # incremental: only rows missing from the JSON
 *   NOTION_TOKEN=secret_xxx node scripts/export-notion.mjs --full   # re-fetch everything
 *
 * Setup (once):
 *   1. https://www.notion.so/profile/integrations → New integration (internal), copy the token.
 *   2. Open the Clippings database in Notion → ··· → Connections → add the integration.
 *
 * No dependencies. Node 18+ (uses global fetch).
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const DATA_SOURCE_ID = "3a3e119e-f189-4c5a-8509-f622ea1ca0df";
const OUT = new URL("../data/snippets.json", import.meta.url).pathname;
const NOTION_VERSION = "2025-09-03";
const TOKEN = process.env.NOTION_TOKEN;
const FULL = process.argv.includes("--full");

if (!TOKEN) {
  console.error("Missing NOTION_TOKEN env var.");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Notion-Version": NOTION_VERSION,
  "Content-Type": "application/json",
};

async function notion(path, init = {}) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`https://api.notion.com/v1${path}`, { ...init, headers });
    if (res.status === 429) {
      const wait = Number(res.headers.get("retry-after") ?? 1) * 1000;
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    if (!res.ok) throw new Error(`${init.method ?? "GET"} ${path} → ${res.status} ${await res.text()}`);
    return res.json();
  }
  throw new Error(`Rate-limited too many times on ${path}`);
}

// ---------- rows ----------

async function* rows() {
  let cursor;
  do {
    const body = { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) };
    const page = await notion(`/data_sources/${DATA_SOURCE_ID}/query`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    yield* page.results;
    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);
}

const plain = (rich) => (rich ?? []).map((t) => t.plain_text).join("");

function propsOf(page) {
  const p = page.properties;
  const text = (k) => plain(p[k]?.rich_text) || null;
  return {
    id: page.id.replace(/-/g, ""),
    title: plain(p.Clipping?.title) || null,
    type: p.Type?.select?.name ?? null,
    year: p.Year?.select?.name ?? null,
    publication: text("Publication"),
    source: p.Source?.url ?? null,
    date: p.Added?.date?.start ?? null, // article publication date (YYYY-MM-DD)
    tags: (p.Tags?.multi_select ?? []).map((t) => t.name),
  };
}

// ---------- body ----------

const TEXT_BLOCKS = new Set([
  "paragraph",
  "quote",
  "bulleted_list_item",
  "numbered_list_item",
  "heading_1",
  "heading_2",
  "heading_3",
  "callout",
  "toggle",
]);

async function bodyOf(pageId) {
  const paras = [];
  let cursor;
  do {
    const qs = new URLSearchParams({ page_size: "100", ...(cursor ? { start_cursor: cursor } : {}) });
    const page = await notion(`/blocks/${pageId}/children?${qs}`);
    for (const b of page.results) {
      if (!TEXT_BLOCKS.has(b.type)) continue;
      const t = plain(b[b.type].rich_text).trim();
      if (t) paras.push(t);
    }
    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);
  return paras.join("\n\n");
}

// ---------- main ----------

async function loadExisting() {
  if (FULL) return [];
  try {
    return JSON.parse(await readFile(OUT, "utf8")).snippets ?? [];
  } catch {
    return [];
  }
}

const existing = await loadExisting();
const known = new Map(existing.map((s) => [s.id, s]));
const out = [];
let fetched = 0;

for await (const page of rows()) {
  const meta = propsOf(page);
  if (known.has(meta.id)) {
    out.push({ ...known.get(meta.id), ...meta }); // refresh properties, keep body
    continue;
  }
  const text = await bodyOf(page.id);
  fetched++;
  process.stderr.write(`\r${fetched} fetched…`);
  out.push({ ...meta, text });
}
process.stderr.write("\n");

// Drop rows with no body (e.g. Type = Image) and exact-duplicate bodies, keeping the first seen.
const seen = new Set();
const snippets = out.filter((s) => {
  if (!s.text) return false;
  const key = s.text.replace(/\s+/g, " ").trim().toLowerCase();
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

snippets.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || a.title.localeCompare(b.title));

await mkdir(dirname(OUT), { recursive: true });
await writeFile(
  OUT,
  JSON.stringify({ exportedAt: new Date().toISOString(), count: snippets.length, snippets }, null, 2) + "\n"
);

console.log(`Wrote ${snippets.length} snippets to ${OUT} (${fetched} bodies fetched, ${out.length - snippets.length} dropped as empty/duplicate).`);
