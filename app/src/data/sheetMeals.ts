// Fetches meals from a public Google Sheet via the gviz JSON endpoint.
// No API key required as long as the sheet is set to "Anyone with the
// link can view" or published to web.
//
// The endpoint returns a JSONP-style payload prefixed with
//     /*O_o*/\ngoogle.visualization.Query.setResponse(<json>);
// We strip the wrapper and parse the inner JSON ourselves.
//
// The photo cell can be either a full URL (https://…) — used as-is —
// or a Google Drive file ID, which we wrap in
//     https://lh3.googleusercontent.com/d/<id>
// so swapping to a Drive folder later doesn't require any code change.

import {
  COLUMN_HEADERS,
  MEALS_SHEET_ID,
  MEALS_SHEET_NAME,
} from '../config';
import type { Meal } from './meals';

function gvizUrl(): string {
  const base = `https://docs.google.com/spreadsheets/d/${MEALS_SHEET_ID}/gviz/tq?tqx=out:json`;
  return MEALS_SHEET_NAME
    ? `${base}&sheet=${encodeURIComponent(MEALS_SHEET_NAME)}`
    : base;
}

function stripGvizWrapper(text: string): string {
  const m = text.match(/setResponse\(([\s\S]*)\);?\s*$/);
  if (!m) throw new Error('unexpected gviz response shape');
  return m[1];
}

function buildPhotoUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://lh3.googleusercontent.com/d/${trimmed}`;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics (e.g. ä → a)
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

type GvizCell = { v: string | number | boolean | null } | null;
type GvizCol = { id?: string; label?: string; type?: string };
type GvizResponse = {
  status: 'ok' | 'error';
  errors?: Array<{ detailed_message?: string; message?: string }>;
  table: {
    cols: GvizCol[];
    rows: Array<{ c: GvizCell[] }>;
  };
};

type CanonicalKey = keyof typeof COLUMN_HEADERS;

function indexColumns(cols: GvizCol[]): Record<CanonicalKey, number> {
  const headers = cols.map((c) =>
    (c.label ?? c.id ?? '').toLowerCase().trim(),
  );
  const idx = {} as Record<CanonicalKey, number>;
  for (const [canonical, header] of Object.entries(COLUMN_HEADERS) as Array<
    [CanonicalKey, string]
  >) {
    const i = headers.indexOf(header.toLowerCase().trim());
    if (i === -1) {
      throw new Error(`sheet is missing the "${header}" column`);
    }
    idx[canonical] = i;
  }
  return idx;
}

/** Returns null when no sheet is configured. Throws on fetch / parse error. */
export async function fetchSheetMeals(): Promise<Meal[] | null> {
  if (!MEALS_SHEET_ID) return null;

  const r = await fetch(gvizUrl());
  if (!r.ok) throw new Error(`gviz HTTP ${r.status}`);
  const text = await r.text();
  const json = JSON.parse(stripGvizWrapper(text)) as GvizResponse;

  if (json.status !== 'ok') {
    const detail =
      json.errors?.[0]?.detailed_message ?? json.errors?.[0]?.message;
    throw new Error(`gviz error: ${detail ?? 'unknown'}`);
  }

  const idx = indexColumns(json.table.cols);
  const cellAt = (row: { c: GvizCell[] }, i: number) =>
    row.c[i]?.v ?? null;

  const meals: Meal[] = [];
  const seenIds = new Set<string>();

  for (const row of json.table.rows) {
    const captionRaw = cellAt(row, idx.caption);
    const photoRaw = cellAt(row, idx.photo);
    if (!captionRaw || !photoRaw) continue;

    const caption = String(captionRaw).trim();
    const photoStr = String(photoRaw).trim();
    if (!caption || !photoStr) continue;

    let id = slugify(caption);
    if (seenIds.has(id)) {
      let n = 2;
      while (seenIds.has(`${id}-${n}`)) n += 1;
      id = `${id}-${n}`;
    }
    seenIds.add(id);

    const num = (key: CanonicalKey): number => {
      const v = cellAt(row, idx[key]);
      const n = typeof v === 'number' ? v : Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    meals.push({
      id,
      caption,
      photo: buildPhotoUrl(photoStr),
      calories: num('calories'),
      protein: num('protein'),
      carbs: num('carbs'),
      fat: num('fat'),
    });
  }

  return meals;
}
