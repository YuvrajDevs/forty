# Building FortyBible and setting up Google Play

## 1. Local builds (set up on this Mac, no accounts needed)

The Android toolchain lives in `/opt/homebrew/share/android-commandlinetools` (JDK 17 from Homebrew).
`source .android-env.sh` sets the paths (the file is not committed; recreate it from the exports below).

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH
```

Generate the native project (it is git-ignored) and build:

```bash
npx expo prebuild --platform android --no-install
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
cd android
./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a        # dev build, needs `npx expo start` running
EXPO_PUBLIC_PREVIEW=1 ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a   # standalone test APK
```

- `EXPO_PUBLIC_PREVIEW=1` lets a sideloaded test build skip the purchase. Never set it for a Play build.
- Test APK: `android/app/build/outputs/apk/release/app-release.apk` (signed with the debug key, for testing only).
- Store build: `./gradlew bundleRelease` after setting up a real upload keystore (or use EAS).

Emulator used for testing: `system-images;android-36;google_apis;arm64-v8a`, AVD `fortytest`.
Expo Go cannot run the lock or billing; everything else works in Expo Go.

### What was tested on the Android emulator

Onboarding (all screens), installed-app picker with real icons, hold-to-commit, the three permission
buttons and their live status, the notification permission prompt, the lock prompt opening over
Chrome, reading then returning to Chrome with the gap applied, the second reading, Emergency access,
and a standalone release build with no dev server.

Not tested: Google Play billing (no Play Store on the emulator), notification delivery at the
scheduled time, real Vivo background-killing behaviour.

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

## 4. Things to check on the Vivo

- The `expo-build-properties` Kotlin version (2.2.0) works with Expo SDK 57. If Gradle complains, check the
  expo-iap installation guide for the version it needs.
- The lock service starts after Accessibility is turned on, and opens the `fortybible://lock` prompt.
- Vivo (Funtouch OS) may kill background services: allow "Run in background" and auto-start.
- Daily lock reminders and the day-5 trial reminder (`src/lib/notifications.ts`) need a real build.
