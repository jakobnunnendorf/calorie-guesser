# CaloLingo · MVP (Expo + React Native)

Implementation of **Direction 2** (iOS-style minimal) from the mock-ups
in `../mockups/`. The MVP covers the core loop:

1. See a meal photo
2. Slide to estimate calories + protein
3. Submit
4. Read your accuracy ring + per-macro breakdown
5. Tap **Next meal** and repeat

No accounts, no backend — everything is local state. The five seeded
meals live in `src/data/meals.ts`.

## Run it

```bash
cd app
npm install
npx expo start
```

Then press **i** for the iOS simulator, **a** for an Android emulator,
or scan the QR code with Expo Go on your phone. **w** runs it in the
browser, which is the fastest way to iterate.

If `npx expo start` complains about version drift, run
`npx expo install --fix` to align native packages with the installed
SDK — Expo manages the exact versions of `react-native-svg` and
`@react-native-community/slider` per SDK release.

## Project layout

```
app/
├── App.tsx                       round/view state machine
├── index.ts                      Expo entry
├── package.json / app.json
├── src/
│   ├── theme.ts                  color + spacing tokens, macro meta
│   ├── scoring.ts                composite + per-macro accuracy
│   ├── types.ts
│   ├── data/meals.ts             seeded meals
│   ├── components/
│   │   ├── AccuracyRing.tsx      SVG ring (react-native-svg)
│   │   ├── MacroSlider.tsx       label + slider + tabular value
│   │   ├── MealPhoto.tsx
│   │   ├── PrimaryButton.tsx
│   │   ├── Eyebrow.tsx           eyebrow + big SF-Pro headline
│   │   └── StatusNav.tsx
│   └── screens/
│       ├── GuessScreen.tsx
│       └── ResultScreen.tsx
```

## Loading meals from a Google Sheet

The app pulls its meal pool from a public Google Sheet
(`MEALS_SHEET_ID` in `src/config.ts`) so meals can be added or edited
without rebuilding. The current sheet uses these German column headers:

| Bild-URL | Lebensmittel | Kalorien (kcal) | Eiweiß (g) | Kohlenhydrate (g) | Fett (g) |
|---|---|---|---|---|---|
| https://… | Apfel | 52 | 0.3 | 14 | 0.2 |

Column order is flexible; lookup is by header name. Rows with an empty
photo or caption are dropped silently. The `id` field is derived from a
slug of the caption (so `Ei (gekocht)` → `ei-gekocht`).

### Photos

The `Bild-URL` column accepts either:
- a full `https://…` URL (current state — Wikipedia thumbnails)
- a Google Drive file ID — wrapped in `https://lh3.googleusercontent.com/d/<id>`

To switch to Drive-hosted photos later: upload images to a Drive folder
shared as **Anyone with the link can view**, copy each file ID
(`drive.google.com/file/d/<THIS_PART>/view`) into the `Bild-URL` column.
No code change required.

### Caching

The app fetches the sheet on launch, caches the result for 24 h via
`AsyncStorage`, and falls back to bundled meals on network errors.

## Where to take it next

- Macro selector: let users turn carbs / fat on or off (the project
  spec calls for this — currently hard-wired to calories + protein).
- Persist `history` to `AsyncStorage` so 7-day-avg / best-streak
  survive app restarts.
- Real meal content: swap `src/data/meals.ts` for a small Supabase
  table or a local JSON pack.
- Better feedback: animate the ring in, gently haptic on submit.
- Replace placeholder photos with licensed imagery before any kind of
  production use — Unsplash is fine for prototypes only.
