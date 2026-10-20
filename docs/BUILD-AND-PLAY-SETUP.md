# Building FortyBible and setting up Google Play

Nothing in this file has been run yet. The native lock module and the billing code were written
but never compiled or tested on a device, so expect to fix small things on the first build.

## 1. First build (needs one of these)

**Cloud build (easiest):** create a free Expo account, then

```bash
npx eas-cli login
npx eas-cli init
npx eas-cli build --profile development --platform android
```

Install the APK on the phone, then run `npx expo start --dev-client` on the Mac.

**Local build:** install JDK 17 and the Android command-line tools, then `npx expo run:android`.

Expo Go cannot run the lock or billing. Everything else works in Expo Go.

## 2. Google Play Console (one-time US$25 developer account)

1. Create the app with package name `com.yuvrajdevs.fortybible`.
2. Monetize > Subscriptions > create product ID `fortybible_premium` (set in `src/lib/billing.ts`).
3. Add two base plans with these exact IDs: `weekly` (1 week) and `yearly` (1 year).
4. On each base plan add an offer with a 7-day free trial.
5. Set prices per country (the PRD suggests $4.99/week and $39.99/year; India is set separately).
6. Upload a build to the Internal testing track and add your Gmail as a licence tester. Billing only
   works for apps installed from Play, even on an internal track.

## 3. Accessibility policy (Play can reject apps that skip this)

- Declare the Accessibility API use in Play Console (App content). Core purpose: reading-first app
  blocker chosen by the user. The service reads no screen content (`canRetrieveWindowContent` is false).
- The in-app disclosure is in `src/lib/legal.ts` ("How the lock works") and the permissions screen.
- Add a real support contact in `SUPPORT_EMAIL` in `src/lib/legal.ts` and host the privacy policy at a URL.
- Have the privacy policy and terms text reviewed before publishing.

## 4. Things to check on the first device build

- The `expo-build-properties` Kotlin version (2.2.0) works with Expo SDK 57. If Gradle complains, check the
  expo-iap installation guide for the version it needs.
- The lock service starts after Accessibility is turned on, and opens the `fortybible://lock` prompt.
- Vivo (Funtouch OS) may kill background services: allow "Run in background" and auto-start.
- Daily lock reminders and the day-5 trial reminder (`src/lib/notifications.ts`) need a real build.
