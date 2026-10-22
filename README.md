# FortyBible

Read the Bible before you scroll. Android app built with React Native (Expo dev build).

Product spec: [docs/Forty-PRD.pdf](docs/Forty-PRD.pdf)

## Features

- Goal-based plans with a finish date, themed plans (`src/lib/catalog.ts`), pause and extend
- The app lock (Kotlin accessibility service in `modules/forty-lock`) with Emergency access and Skip today
- Offline reader in three translations (WEB, KJV, Douay-Rheims), audio mode (phone voice), search, highlights, saved verses, verse cards
- Memory verses (spaced review), daily check-in, journal, weekly reflection, streaks with a grace day
- Verse of the day on the lock screen and a home-screen widget
- Google Play billing (`expo-iap`), hard paywall
- All data stays on the phone

## Docs

- [Build and Google Play setup](docs/BUILD-AND-PLAY-SETUP.md)

## Development

```bash
npm install
npx expo start --go   # Expo Go preview (no lock or billing)
npm test              # logic tests
```
