# Store assets

Before submitting to the App Store / Play Store, replace the placeholder Expo
template icons in `mobile/assets/` and produce screenshots in this directory.

## Required files

### Mobile/assets (replace these — currently default Expo template)

- `icon.png` — **1024×1024** square, no rounded corners, no transparency.
- `adaptive-icon.png` — **1024×1024**, foreground over `#0F766E` background (see `app.json`).
- `splash-icon.png` — **~1284×2778** centred logo over `#0F766E`.
- `favicon.png` — 48×48 for web build.

### App Store (iOS)

Place at `mobile/assets/store/ios/`:

| File                                | Device                  | Size       |
| ----------------------------------- | ----------------------- | ---------- |
| `01-iphone-6.7.png` … `05-...`      | iPhone 15 Pro Max       | 1290×2796  |
| `01-iphone-5.5.png` … `05-...`      | iPhone 8 Plus           | 1242×2208  |

At least 3 screenshots per device size are required.

### Play Store (Android)

Place at `mobile/assets/store/android/`:

- `feature-graphic.png` — 1024×500
- `01-screenshot.png` … `08-...` — 1080×1920 (phone screenshots)

## How to generate screenshots

1. Start the app: `npx expo start` and connect a physical device or simulator.
2. Use **iOS Simulator** ⌘+S or `xcrun simctl io booted screenshot` for iOS.
3. Use **Android Studio emulator** screenshot button for Android.
4. Crop to the exact required sizes (a tool like
   [Figma](https://figma.com) or `sips -z 2796 1290 input.png --out output.png`
   on macOS works).

Until real artwork is supplied, the placeholders from `create-expo-app` ship
with the EAS build; the submit step will be rejected by App Store Review.
Replace them before `eas submit`.
