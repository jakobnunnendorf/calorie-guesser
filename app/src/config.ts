// CaloLingo runtime configuration.
//
// Meal content is loaded from a public Google Sheet so non-developers
// can add or edit plates without rebuilding the app. While
// MEALS_SHEET_ID is empty, the app falls back to src/data/meals.ts.
//
// The sheet uses German column headers and direct image URLs (currently
// from Wikipedia). Once the Drive folder is set up, the photo column
// can hold either a full URL or a Drive file ID — the parser handles
// both.

export const MEALS_SHEET_ID = '1GYDmsLni7K0PpkkT_DxIELTEsiUPOkNV';

// Empty string means "first sheet in the workbook".
export const MEALS_SHEET_NAME = '';

// How long to trust a successful fetch before refetching.
export const MEALS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Sheet column header names (case-insensitive, trimmed before match).
// Reorder columns in the sheet freely — lookup is by name.
export const COLUMN_HEADERS = {
  photo: 'Bild-URL',
  caption: 'Lebensmittel',
  calories: 'Kalorien (kcal)',
  protein: 'Eiweiß (g)',
  carbs: 'Kohlenhydrate (g)',
  fat: 'Fett (g)',
} as const;
