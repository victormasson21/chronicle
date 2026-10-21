#!/usr/bin/env node
/**
 * List the entries of a yearly Articles page that are not yet in data/snippets.json.
 *
 * Usage:
 *   node scripts/diff-yearly-page.mjs <page-file>
 *
 * <page-file> is the Notion-flavoured Markdown of the page, either raw or as the JSON a
 * notion-fetch call saved to disk. Entries are separated by `---` rules; an em-dash starting
 * a line inside an entry also separates clippings. Matching is fuzzy (three 60-character
 * windows of normalised text), so confirm a reported miss with a grep for a distinctive phrase.
 */

import { readFile } from "node:fs/promises";

const SNIPPETS = new URL("../data/snippets.json", import.meta.url).pathname;
const WINDOW = 60;
const PREVIEW = 300;

const [, , input] = process.argv;
if (!input) {
  console.error("Usage: node scripts/diff-yearly-page.mjs <page-file>");
  process.exit(1);
}

function pageMarkdown(raw) {
  let text = raw;
  try {
    const payload = JSON.parse(raw);
    const wrapped = Array.isArray(payload) ? payload[0].text : payload.text;
    text = JSON.parse(wrapped).text;
  } catch {
    text = raw;
  }
  const [, content = text] = text.match(/<content>([\s\S]*)<\/content>/) ?? [];
  return content;
}

const plain = (md) =>
  md
    .replace(/<page url="[^"]*">[\s\S]*?<\/page>/g, "")
    .replace(/<(?:image|bookmark)[^>]*\/>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*/g, "")
    .trim();

const normalise = (text) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

function windows(key) {
  const starts = [0, Math.floor((key.length - WINDOW) / 2), key.length - WINDOW];
  return starts.filter((start) => start >= 0).map((start) => key.slice(start, start + WINDOW));
}

const content = pageMarkdown(await readFile(input, "utf8"));
const entries = content
  .split(/\n\s*(?:---\s*\n|—-?\s+)/)
  .map(plain)
  .filter(Boolean);

const { snippets } = JSON.parse(await readFile(SNIPPETS, "utf8"));
const known = snippets.map((s) => normalise(s.text));
const present = (key) => windows(key).some((window) => known.some((k) => k.includes(window)));

const missing = entries.filter((entry) => !present(normalise(entry)));
console.log(`${entries.length} entries on the page, ${snippets.length} snippets in the JSON, ${missing.length} missing\n`);
for (const entry of missing) {
  console.log(`--- ${entry.split(/\s+/).length} words ---`);
  console.log(entry.length > PREVIEW ? `${entry.slice(0, PREVIEW)}…` : entry);
  console.log();
}
