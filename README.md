# CaloLingo

Practice estimating macros from meal photos. The app shows you a plate
and asks you to guess its calories, protein, carbs, fat — then scores
how close you were so your intuition sharpens over time.

## Repo layout

```
CaloLingo/
├── app/        — Expo + React Native app (the actual MVP)
├── mockups/    — static HTML mockups exploring four design directions
└── README.md   — you are here
```

The mockups are not in this repo — they live alongside `app/` in the
working tree but aren't tracked by git.

## Run the app

```bash
cd app
npm install
npx expo start
```

`w` for browser, `i` for iOS simulator, `a` for Android. See `app/README.md`
for the full setup notes.

## Status

- [x] Core guess → result loop with sliders + accuracy ring
- [x] Session-summary screen (per-round breakdown, 14-session chart, lifetime tiles)
- [x] First-run empty state with skeletons
- [x] Macro-agnostic scoring (calories, protein, carbs, fat)
- [x] Configurable session length (5 / 10 / 15)
- [x] First production iOS build via EAS
- [ ] AsyncStorage persistence
- [ ] App Store Connect entry + TestFlight submission
- [ ] Real meal content + photo licensing
